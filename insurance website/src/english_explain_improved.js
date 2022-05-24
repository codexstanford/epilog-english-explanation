//A tree of explanations.
class DerivationTree{
    constructor(conclusion,facts,rules,templates) {
        //Explanation is in a great format. Create a (non-binary) tree from it by recursively asking for explanations of children
        this.derivList = explain(conclusion, facts, rules);
        
        this.children = [];
        
        this.filledTemplate = findAndFillTemplate(this.derivList,templates);
        
        //There are no children
        if(symbolp(this.derivList) ||
            this.derivList[0] !== 'rule' ||
            this.derivList.length <= 2) {
            return;
        }
        
        //Recursively construct childrens' derivation trees
        for (let i = 2; i < this.derivList.length; i++) {
            this.children.push(new DerivationTree(this.derivList[i], facts, rules, templates));
        }
    }
    
    //Returns the symbol for the predicate at the root of the tree (i.e. the relation of the derived fact)
    getPredicateSymbol() {
        if (symbolp(this.derivList)) {
            return this.derivList;
        }

        if (this.derivList[0] === 'rule') {
            return this.derivList[1][0];
        }

        return this.derivList[0];
    }

    //Get the first argument of the conclusion, if it exists
    getFirstArgInstance() {
        
        if (symbolp(this.derivList)) {
            return false;
        }
        
        if (this.derivList[0] === 'rule') {
            return this.derivList[1][1];
        }
        
        return this.derivList[1];
    }

    //Return a list of strings with one element for the filled template of the root and each of its immediate children
    asTemplatizedExplanationList(facts, rules, typePredicate) {
        //Only display templates for rules that are one level down on a given screen.
        let explanationList = [this.filledTemplate];
        
        for (let i = 0; i < this.children.length; i++) {
            explanationList.push(this.children[i].filledTemplate);
        }

        return explanationList;
    }
}

//Different naming convention to comply with that of {explain, english, epilog}.js, as this is used externally
function englishify_improved (conclusion,facts,rules,templates)
{
    const typePredicate = "type";
    //If doTypeReplacement is set to false, assumeNonGlobal is irrelevant
    const doTypeReplacement = true;
    const ignoreClassAttributes = true;
    const assumeNonGlobal = true;

    let isFact = isDerivableFact(conclusion, facts, rules)
    console.log(isFact);
    if (!isFact) {
        console.log(conclusion, "is NOT derivable from the given facts and rules.");
    } else {
        console.log(conclusion, "IS derivable from the given facts and rules.");
    }

    let derivTree = new DerivationTree(conclusion, facts, rules, templates);

    console.log(derivTree.derivList);

    let symbolTypeMap = constructSymbolTypeMap(derivTree, facts, rules, new Map(), typePredicate);

    let LETypeExplanationList = replaceSymbolsWithTypes(derivTree, symbolTypeMap,facts, rules, typePredicate, doTypeReplacement, ignoreClassAttributes, assumeNonGlobal);

    let englishExplanation = englishify_explanationList(LETypeExplanationList, derivTree, facts, rules, typePredicate, ignoreClassAttributes);

    return englishExplanation;
}


function englishify_explanationList(explanationList, derivTree, facts, rules, typePredicate, ignoreClassAttributes = true) {
    if (explanationList.length === 0) {
        console.log("[englishify_explanationList] Warning: explanation not in list form:",explanationList);
        return false;
    }
    
    let englishExplanation = explanationList[0];
    if (explanationList.length === 1) {
        return "It is given that " + englishExplanation;
    }

    //The tree the explanation was generated from must have had children
    let childExplanationAdded = false;
    
    let derivTreeClass = getSymbolType(derivTree.getFirstArgInstance(), facts, rules,typePredicate);
    
    //Add the childrens' explanations
    for(let i = 0; i < derivTree.children.length; i++) {
        //Ignore children that are class attributes of the class instance in the root of the derivTree
        if (ignoreClassAttributes && isAttributeOfClass_relation(derivTree.children[i].getPredicateSymbol(), derivTreeClass, facts, rules, typePredicate)) {
            continue;
        }

        //TODO: Test splitting into two for loops with an additional condition on this one
        if (!childExplanationAdded) {
            englishExplanation += " because \n" + englishlink(derivTree.children[i].derivList, explanationList[i+1]);
            childExplanationAdded = true;
        } else {
            englishExplanation += " and \n" + englishlink(derivTree.children[i].derivList, explanationList[i+1]);
        }

    }

    console.log(englishExplanation);
    return englishExplanation;

}

function englishlink (p, englishExplanationOfP)
     {//p will be a fact used to derive a rule
      return"<a href='justify.html?room=codex&conclusion=" + grind(p) + "'>" + englishExplanationOfP + "</a>"
}

//Returns a list containing filled templates of the Tree's root and its immediate children
    // Symbols are replaced with their types in an LE-style manner.
    // e.g. "claim21" becomes "the claim"
function replaceSymbolsWithTypes(derivTree, symbolTypeMap, facts, rules, typePredicate, doTypeReplacement, ignoreClassAttributes, assumeNonGlobal) {
    let templatizedExplanationList = derivTree.asTemplatizedExplanationList(facts, rules, typePredicate);

    if (!doTypeReplacement) {
        return templatizedExplanationList;
    }

    let improvedExplanationList = [...templatizedExplanationList];
    
    let derivTreeClass = getSymbolType(derivTree.getFirstArgInstance(), facts, rules,typePredicate);
    for (let [symbol, [type, relation] ] of symbolTypeMap) {
        if (type === false) {
            continue;
        }
        
        //If the symbol is a class attribute, replace the first instance of it with "the [attribute] of the [class]"

        let isClassAttribute = isAttribute_relation_withMetadata(relation);

        let k = 0;
        for (;assumeNonGlobal && k < improvedExplanationList.length && isClassAttribute; k++) {
            //Ignore children that are class attributes of the class instance in the root of the derivTree
            if (ignoreClassAttributes && derivTree.derivList[0] === 'rule') {
                if (k > 0 && isAttributeOfClass_relation(derivTree.children[k-1].getPredicateSymbol(), derivTreeClass, facts, rules, typePredicate)) {
                    continue;
                }
            }

            if (improvedExplanationList[k].includes(symbol)) {
                let classType = getAttributeClass_withMetadata(relation);
                 improvedExplanationList[k] = improvedExplanationList[k].replace(symbol, "the " + type + " of the " + classType);
                //Don't increment k, so multiple instances of the symbol in the string can be treated differently
                break;
            }
        }
        //Replace the remaining instances of the symbol with "the [type]" 
        for (; k < improvedExplanationList.length; k++) {
            improvedExplanationList[k] = improvedExplanationList[k].replaceAll(symbol, "the " + type);
        }

    }
    return improvedExplanationList;
}

//Fills the template that applies to the topmost/first fact in the list
function findAndFillTemplate(derivList, templates) {
    let conclusion = getConclusion(derivList);

    if (!conclusion) {
        return false;
    }

    return englishatom(conclusion, templates);
}

function getConclusion(derivList) {
    if (symbolp(derivList) || derivList[0]!=='rule') {
        return derivList
    };
    //Not a valid/expected format
    if (derivList.length===1 || derivList[0]!=='rule') {return false};
    //Is a rule
    return derivList[1]
}


//Returns map of symbols to 2-element arrays containing [type of symbol, relation it first appears in in the derivTree]
function constructSymbolTypeMap(derivTree, facts, rules, partialTypeMap, typePredicate) {
    //Just one symbol
    if (symbolp(derivTree.derivList && !partialTypeMap.has(derivTree.derivList))) {
        partialTypeMap.set(derivTree.derivList, [getSymbolType(derivTree.derivList, facts, rules, typePredicate), null]);
        return partialTypeMap;
    }

    if (derivTree.derivList.length === 1) {
        console.log("invalid derivList");
        return partialTypeMap;
    }

    //Get the types of the symbols in the topmost rule
    //Don't care about the type of the relation
    //TODO: please refactor
    let k = 1;
    if (derivTree.derivList[0] === 'rule') {
        for (let j = 1; j < derivTree.derivList[k].length; j++) {
            let s = derivTree.derivList[k][j];
            if (symbolp(s) && !partialTypeMap.has(s)) {
                let symbolType = getSymbolType(s,facts,rules, typePredicate);
                let relation = derivTree.derivList[k][0];
                partialTypeMap.set(s, [symbolType,relation]);
            }
        }
        k++;
    }


    for (; k < derivTree.derivList.length; k++) {
        let s = derivTree.derivList[k];
        //Only add symbols that haven't already been typed

        if (symbolp(s) && !partialTypeMap.has(s)) {
            let symbolType = getSymbolType(s,facts,rules, typePredicate);
            let relation = derivTree.derivList[0];
            partialTypeMap.set(s, [symbolType,relation]);
        }
    }

    
    //Recursively get the types of the symbols in the children
    for (let i = 0; i < derivTree.children.length; i++) {
        partialTypeMap = constructSymbolTypeMap(derivTree.children[i], facts, rules, partialTypeMap, typePredicate);
    }


    return partialTypeMap
}

