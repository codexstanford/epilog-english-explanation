//==============================================================================
// english_explanation.js
//==============================================================================
//==============================================================================
// Functions to generate English-language explanations of Epilog derivations 
//==============================================================================

//==============================================================================
// External Interface (functions intended to be public)
//==============================================================================
// toEnglish
//==============================================================================

//==============================================================================
// Direct Dependencies
//==============================================================================
// {symbolp, read, grind} from epilog.js
// {explain} from explain.js
// {isDerivableFact, getSymbolType, isClass, isAttributeRelation, isAttributeOfClass} from epilog_database.js
//==============================================================================

//==============================================================================
// converting epilog to english
//==============================================================================
//------------------------------------------------------------------------------
// toEnglish
// DerivationTree (class)
// FactWrapper (class)
// getMatchingTemplate
// derivationToExplanationFactList
// constructSymbolTypeMap
// replaceSymbolsWithTypes
//------------------------------------------------------------------------------


/* Returns a string of the English explanation of the conclusion based on 
 * the given facts, rules, metadata, english_templates, and options.
 * 
 * Assumes facts, rules, metadata, and english_templates have been
 * loaded via localstorage.js
 * 
 * The Epilog derivation of the conclusion is derived from the facts and rules.
 * The English explanation of this derivation is generated using the metadata
 * and english_templates.
 * The generated explanation can be changed via the options, the effects of which 
 * are as follows:
 * 
 *      typePredicate: the predicate used in the database of facts to indicate the type of a constant. e.g. type(claim21, claim)
 *      replaceWithType: whether to replace constants in explanations with their type. e.g. "the hospitalization of claim21 is hospitalization21" becomes "the hospitalization of the claim is the hospitalization"
 *      removeClassAttributes: whether to remove class attribute facts from explanations. e.g. claim.hospitalization(claim21, hospitalization21)
 *      bindLocalConstants: whether to bind class attributes to class they were introduced as belonging to. No effect if replaceWithType is false. e.g. "the hospitalization of claim21 is hospitalization21" becomes "the hospitalization of the claim is the hospitalization of the claim"
 *      verifyDerivable: whether to verify that the fact to be explained is derivable from the given facts and rules. Without this, all facts are assumed derivable/true.
 *      useMetadata [not implemented]: whether to use metadata in determining properties of predicates in the database. e.g. whether claim.hospitalization is an attributerelation, or whether claim is a class
 *      linkFromExplanation: whether each fact in an explanation should be a hyperlink to the page explaining that fact.
 *      linkGivenFacts:  whether facts that are not derivable and are given as true should be hyperlinked as above. No effect if linkFromExplanation is false.
 * 
 */
//
function toEnglish(conclusion,
                   facts,
                   rules,
                   metadata,
                   english_templates, 
                   options = {typePredicate: "type", replaceWithType: true, removeClassAttributes: true, bindLocalConstants: false, verifyDerivable: true, useMetadata: true, linkFromExplanation: true, linkGivenFacts: true }) {

    //Note: If replaceWithType is false, bindLocalConstants is irrelevant
    //Note: if linkFromExplanation is false, linkGivenFacts is irrelevant
    
    //Check whether the conclusion is true before translating
    if (options.verifyDerivable && !isDerivableFact(conclusion, facts, rules)) {
        console.log("[Warning] toEnglish -", conclusion, "is not derivable from the given facts and rules.");
        return conclusion + " is not derivable from the given facts and rules.";
    }

    let derivTree = new DerivationTree(conclusion, facts, rules, metadata, english_templates);
    
    //Generate list of FactWrappers that will comprise the explanation, parameterized by the metadata and the options.
    let explanationFactList = derivationToExplanationFactList(derivTree, facts, rules, metadata, english_templates, options);
    
    if (options.replaceWithType) {
        explanationFactList = replaceSymbolsWithTypes(explanationFactList, derivTree, facts, rules, metadata, options);
    }
    

    //Generate text from the list of facts and their templates.
    let englishExplanation = factListToEnglish(explanationFactList, facts, rules, metadata, english_templates, options);
    
    return englishExplanation;
}

// A tree representation of the derivation of a ground atom
class DerivationTree {
    // groundAtom: A list or string representing an Epilog ground atom.
    constructor(groundAtom, facts, rules, metadata, english_templates) {
        if (typeof(groundAtom) === "string") {
            groundAtom = read(groundAtom);
        }

        this.root = new FactWrapper(groundAtom, english_templates);

        this.children = [];

        const explanation = explain(groundAtom, facts, rules);
        
        //There are no children.
        if (typeof(explanation) === "string" ||
            explanation[0] !== "rule" ||
            explanation.length <= 2) {
            return;
        }
        
        
        //Recursively construct derivations of the facts used to derive the root
        for (let i = 2; i < explanation.length; i++) {
            this.children.push(new DerivationTree(explanation[i], facts, rules, metadata, english_templates));
        }
        
    }
}

// A wrapper class for Epilog facts to simplify converting to templates. 
class FactWrapper {
    // groundAtom: A list or string representing an Epilog ground atom.
    constructor(groundAtom, english_templates) {
        //Convert to list format
        if (typeof(groundAtom) === 'string') {
            groundAtom = read(groundAtom);
        }
        this.groundAtom = groundAtom;
        
        //Find matching template, if it exists
        [this.unfilledTemplate, this.templateMatchedVars, this.templateVarReplacementSeq] = getMatchingTemplate(this.groundAtom, english_templates);;
    }

    asList() {
        return this.groundAtom;
    }

    asString() {
        return grind(this.groundAtom);
    }

    // Returns the string of the groundAtom's predicate if it exists.
    // If not, teturns the groundAtom itself (which will be a string).
    getPredicateSymbol() {
        const listAtom = this.asList();
        if (symbolp(listAtom)) {
            return listAtom;
        }

        if (listAtom[0] === 'rule') {
            return listAtom[1][0];
        }

        return listAtom[0];
    }

    //Returns the unfilledTemplate with vars replace as specified by templateVarReplacementSeq
    getFilledTemplate() {
        let strToFill = stripquotes(this.unfilledTemplate);

        for (let i=0; i<this.templateVarReplacementSeq.length; i++) {
            const replacementPair = this.templateVarReplacementSeq[i];
            let re = new RegExp('\\$' + replacementPair[0] + '\\$','i');

            strToFill = strToFill.replace(re,replacementPair[1]);
        }

        return strToFill;
    }
}

/* Fills the templates of the facts in factList to generate an English explanation.

*/
function factListToEnglish(factList, facts, rules, metadata, english_templates, options) {
    if (factList.length === 0) {
        return "";
    }

    //Treat the conclusion differently
    let englishExplanation = factList[0].getFilledTemplate();

    if (factList.length === 1) {
        return "It is given that " + englishExplanation;
    }

    //Process any child facts
    englishExplanation += " because \n \t";
    let childExplanationList = [];
    for (let i = 1; i < factList.length; i++) {
        let childExplanation = factList[i].getFilledTemplate();
        //If linkFromExplanation, generate a link to a page for each fact in the explanation
        if (options.linkFromExplanation) {
            //If linkGivenFacts is false, don't link facts without children. (i.e. those that don't have derivations, and are simply given as true)
            if (options.linkGivenFacts || (new DerivationTree(factList[i].asList(), facts, rules, metadata, english_templates).children.length > 0) ) {
                childExplanation = factLinkElem(factList[i], childExplanation);
            }
        }
        childExplanationList.push(childExplanation);
    }
    
    englishExplanation += childExplanationList.join(" and \n \t");
    return englishExplanation;
}

/* Finds and returns the first template matching the ground atom.
 * groundAtom: A string or list representing an Epilog ground atom
 * 
 * If one is found, returns an array containing
 * i. the unfilled template string
 * ii. an object mapping variables in the template string to constants
 * iii. a 2D array of pairs of strings where...
 *      a. the first element of each pair is a variable in a template to be replaced
 *      b. the second element of each pair is the epilog constant that should be substituted for the variable in the template
 *      c. the pairs appear in the list in the same order as do the corresponding variables in the template
 * If no template is found, returns [false, {}, []].
 * 
 * e.g. if groundAtom = "claim.policy(claim21,policy21)" and 
 *      english_templates = [new TemplateWrapper("claim.policy(C,P)", "the policy of $C$ is $P$", ["C", "P"]),
                            new TemplateWrapper("policy.startdate(P,S)", "$P$ began on $S$", ["P", "S"])],
        returns ["claim.policy(C,P)",
                 {"C": "claim21", "P": "policy21"},
                 [ ["C", "claim21"], ["P", "policy21"] ]
                ]
 * 
 * Intent: Enable distinguishing between different instances of a variable/constant in templates and explanations.
 * The 2D array allows us to perform per-instance substitutions of the variables.
 * The object mapping variable to constants allows us to remember which constants the variables
 * originally matched to, regardless of the transformations performed on the 2D array.
 */
function getMatchingTemplate(groundAtom, english_templates) {
    //Convert to list format
    if (typeof(groundAtom) === "string") {
        groundAtom = read(groundAtom);
    }



    //Find the matching template
    for (let i=0; i < english_templates.length; i++) {
        let matchedVars = simplematcher(english_templates[i].queryAsList(), groundAtom);
        
        //Matching template found
        if (matchedVars !== false) {
            let matchedVarMap = new Map(matchedVars);
            let matchedTemplate = english_templates[i];
            let varReplacementSeq = [];
            matchedTemplate.varSequence.forEach((varStr) => {
                varReplacementSeq.push([varStr, matchedVarMap.get(varStr)]);
            });

            return [matchedTemplate.templateString, matchedVarMap, varReplacementSeq];            
        }
    }

    //No matching template
    return [grind(groundAtom), new Map(), []];
    
}

/* Converts a DerivationTree into an array of FactWrappers that will comprise an explanation,
 * parameterized by the metadata and the options.
 *
 */
function derivationToExplanationFactList(derivTree, facts, rules, metadata, english_templates, options) {
    let factList = [];

    if (! derivTree instanceof DerivationTree ) {
        console.log("[Warning] derivationToExplanationFactList - first argument must be a DerivationTree.");
        return factList;
    }

    // Make a list of all facts that should be used in the explanation.
    // Currently, just the root and its direct children.
    factList.push(derivTree.root);
    for (let i = 0; i < derivTree.children.length; i++) {
        factList.push(derivTree.children[i].root);
    }

    for (let i = factList.length - 1; i >= 1; i--) {
        // Remove facts that are class attributes of constants in the conclusion, based on metadata, if available.
        if (options.removeClassAttributes) {
            for (let [varStr, symbolStr] of factList[0].templateMatchedVars.entries()) {
                const symbolType = getSymbolType(symbolStr, facts, rules, options.typePredicate);
                if (isClass(symbolType, facts, rules, metadata, options) && 
                    isAttributeOfClass( factList[i].getPredicateSymbol(), 
                                        symbolType,
                                        facts, rules, metadata, options)) {
                    factList.splice(i, 1);
                }
            }
        }
    }

    return factList;
}

/* Returns a map where each...
 *      - key is a symbol that matched a var in a template of a fact in the derivTree
 *      - value is an array containing [the type of the symbol, the relation where it first appeared in the derivation]
 * 
 * 
 * Note: Need derivTree instead of factList to properly bind attributes to their classes.
 */
function constructSymbolTypeMap(derivTree, partialTypeMap, facts, rules, options) {
    if (! derivTree instanceof DerivationTree) {
        console.log("[Warning] constructSymbolTypeMap - first argument must be a DerivationTree.");
        return partialTypeMap;
    }

    

    // Get the types of each symbol that matched a var in the root.
    for (let [varStr, symbolStr] of derivTree.root.templateMatchedVars.entries()) {
        const symbolType = getSymbolType(symbolStr, facts, rules, options.typePredicate);

        if (symbolType !== false && !partialTypeMap.has(symbolStr)) {
            // Get the relation of the fact where the symbol was first introduced
            const relation = derivTree.root.getPredicateSymbol();
            partialTypeMap.set(symbolStr, [symbolType, relation]);
        }
    }

    // Recursively get the types of the symbols that matched vars in the children
    for (let i = 0; i < derivTree.children.length; i++) {
        partialTypeMap = constructSymbolTypeMap(derivTree.children[i], partialTypeMap, facts, rules, options);
    }

    return partialTypeMap;
}

/* Returns a factList where the varReplacementSeq of each fact is updated  
 * such that each symbol is replaced with its type as "the [type]".
 * If bindLocalConstants, the first instance of a symbol that is a class attribute is 
 * replaced with "the [attribute] of the [class]".
 *
 * factList is modified in-place.
 * 
*/
function replaceSymbolsWithTypes(factList, derivTree, facts, rules, metadata, options) {
    let symbolTypeMap = constructSymbolTypeMap(derivTree, new Map(), facts, rules, options);
    
    
    let updatedFactList = [];
    
    if (!Array.isArray(factList)) {
        console.log("[Warning] constructSymbolTypeMap - first argument must be an array of FactWrappers.");
        return updatedFactList;
    }


    // Replace each symbol with its type as "the [type]"
    // If bindLocalConstants, the first instance of a symbol that is a class attribute is 
    // replaced with "the [attribute] of the [class]".
    for (const [symbol, [type, bindingRelation]] of symbolTypeMap) {
        let seenSymbol = false;
        const boundInAttribute = isAttributeRelation(bindingRelation, facts, rules, metadata, options);
        let classOfAttribute = "";
        if (boundInAttribute) {
            classOfAttribute = getClassOfAttribute(bindingRelation, facts, rules, metadata, options)
        }
        for (let i = 0; i < factList.length; i++) {
            let fact = factList[i];
            for (let k = 0; k < fact.templateVarReplacementSeq.length; k++) {
                let [varStr, replacementStr] = fact.templateVarReplacementSeq[k];
                
                // Found an instance of the symbol in the explanation
                if (fact.templateMatchedVars.get(varStr) === symbol) {
                    let newReplacementStr = "the " + type;

                    // Verify that the symbol was bound in a relation class.attribute and isn't of type class
                    if (options.bindLocalConstants && !seenSymbol && boundInAttribute & classOfAttribute !== type) {
                        newReplacementStr += " of the " + getClassOfAttribute(bindingRelation, facts, rules, metadata, options);
                    }

                    //Update the replacement string in-place
                    factList[i].templateVarReplacementSeq[k] = [varStr, newReplacementStr];
                    seenSymbol = true;
                }
            }
        }
    }

    return factList;
}

// Return an HTML element linking to the page explaining the given fact, 
// with text equal to linkText
function factLinkElem (fact, linkText){
    if (! fact instanceof FactWrapper) {
        const errorMsg = "[Warning] factLinkElem - first arg must be a FactWrapper.";
        console.log(errorMsg);
        return errorMsg;
    }
    return"<a href='index.html?conclusion=" + fact.asString() + "'>" + linkText + "</a>"
}

//==============================================================================
// Template matching and processing - from MRG
//==============================================================================
//------------------------------------------------------------------------------
// simplematcher
// simplematch
// simplematchvar
// simplematchexp
// simplematchvalue
// simplevalue
// plugstring
//------------------------------------------------------------------------------
//==============================================================================

function simplematcher (x,y)
 {return simplematch(x,y,[])}

function simplematch (x,y,bl)
 {if (varp(x)) {return simplematchvar(x,y,bl)};
  if (symbolp(x)) {if (x===y) {return bl} else {return false}};
  return simplematchexp(x,y,bl)}

function simplematchvar (x,y,bl)
 {var dum = simplevalue(x,bl);
  if (dum!==false) {if (equalp(dum,y)) {return bl} else {return false}};
  bl.push([x,y]);
  return bl}

function simplematchexp(x,y,bl)
 {if (symbolp(y)) {return false};
  if (x.length!==y.length) {return false};
  for (var i=0; i<x.length; i++)
      {bl = simplematch(x[i],y[i],bl);
       if (bl===false) {return false}};
  return bl}

function simplevalue (x,al)
 {for (var i=0; i<al.length; i++)
      {if (x===al[i][0]) {return al[i][1]}};
  return false}

function plugstring (x,al)
{
   //console.log(x);
   //console.log('al', al);
   for (var i=0; i<al.length; i++)
      {var pattern = new RegExp('\\$' + al[i][0] + '\\$','g');
       x = x.replace(pattern,al[i][1])};
  return x}