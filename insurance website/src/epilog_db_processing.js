var db_metadata = [];

function isDerivableFact(groundAtom, facts, rules) {
    //Must use compfindp, not basefindp. basefindp doesn't handle functions like evaluate
    return compfindp(groundAtom, facts, rules);
}

function loadMetadata() {
    let metadataWidget = document.getElementById('db_metadata');  
    db_metadata = [];
    definefacts(db_metadata,readdata(metadataWidget.textContent));
}


/*  
* Determine whether typeSymbol is a type in the database
* Does so by checking whether something in the database has typeSymbol as a type
* Arguments: 
    * typeSymbol: the symbol to evaluate
    * facts: the ground facts of the database
    * rules: the rules of the database
    * typePredicate (optional): the binary predicate in the database indicating that a symbol *has* a type 
        * e.g. type(alan_arrogant, person)
        * Note: not unary predicate indicating that a symbol *is* a type.
*/
function isAType(typeSymbol, facts, rules, typePredicate) {
    return basefindp(read(typePredicate + '(X,' + typeSymbol + ')'), facts, rules);
}

//Return the type of the symbol if it exists, false otherwise
function getSymbolType(symbol,facts,rules, typePredicate) {
    if (!symbolp(symbol)) {
        return false;
    }

    let type = basefindx('T',read(typePredicate + '('+symbol+',T)'), facts, rules);

    return type;
}

function getAttributeClass_withMetadata(relation) {
    if (!isAttribute_relation_withMetadata(relation)) {
        console.log(relation," is not a class attribute");
        return false;
    }
    return basefindx('X',read('attribute(X,'+relation+')'), db_metadata, []);
}

function isAttribute_relation_withMetadata(relation) {
    return basefindp(read('type(' + relation + ',attributerelation)'), db_metadata, []);
}

/* 
* Determines if the relation is a class attribute
* If no instances of the relation exist, returns false (vacuously false)
* Arguments: 
    * relation: the relation to evaluate
    * facts: the ground facts of the database
    * rules: the rules of the database
    * typePredicate: the binary predicate in the database indicating that a symbol has a type 
        * e.g. type(alan_arrogant, person)
 * 
 * 
 * returns: a boolean
*/
function isAttributeOfClass_relation(relation, className, facts, rules, typePredicate) 
{
    if (!symbolp(relation)) {
        console.log("Not a symbol:", relation);
        return false;
    }
    
    //Use metadata if we have it
    if (db_metadata !== []) {
        let isAttribute = isAttribute_relation_withMetadata(relation);

        if (!isAttribute) {
            console.log(relation,"is not an attribute");
            return false;
        }

        let belongsToClass = basefindp(read('attribute(' + className + ',' + relation + ')'), db_metadata, []);

        if (!belongsToClass) {
            console.log(relation,"is not an attribute of",className);
        }


        return isAttribute && belongsToClass;
    }

    //Check if splitting by "." yields exactly two symbols/strings 
    let splitRelation = relation.split(".");
    if (splitRelation.length !== 2) {
        console.log("Not in class attribute form:", relation);
        return false;
    }

    className = splitRelation[0];

    //Check if the first symbol is a type
    if (!isAType(className, facts, rules, typePredicate)) {
        console.log(className, "is not a type.");
        return false;
    }


    //Get every instance of the attribute from the database
        //The attribute is required to be a binary relation
    let allAttributeInstances = basefinds(read('answer(X,Y)'), read(relation + '(X,Y)'), facts, rules)
                                    .map(instanceArr => instanceArr.slice(1));
    //If there are no instances of the attribute, return false
    if (allAttributeInstances.length === 0) {
        console.log("No instances of", relation + ", or is not binary.");
        return false;
    }

    let domainType = getSymbolType(allAttributeInstances[0][0], facts, rules, typePredicate);
    let rangeType = getSymbolType(allAttributeInstances[0][1], facts, rules, typePredicate);
    
    //The symbols must be typed
    if (domainType === false || rangeType === false) {
        console.log("Some symbol in the domain or range isn\'t typed.", allAttributeInstances[0][0], allAttributeInstances[0][1]);
        return false;
    }
    
    
    //Check if the first argument of the relation is always the same type (domain)
    //Check if the second argument of the relation is always the same type (range)
    for (let i = 1; i < allAttributeInstances.length; i++) {
        let domainInstance = allAttributeInstances[i][0];
        let rangeInstance = allAttributeInstances[i][1];
        
        if (getSymbolType(domainInstance, facts, rules, typePredicate) !== domainType) {
            console.log("Not all elements of the domain are the same type.")
            return false;
        }
        
        if (getSymbolType(rangeInstance, facts, rules, typePredicate) !== rangeType) {
            console.log("Not all elements of the range are the same type.")
            return false;
        }
    }
    
    //Arrow function from https://stackoverflow.com/a/34979219
    const arrayColumn = (arr, n) => arr.map(x => x[n]);
    
    // Note: The implementation of these checks is specific to this representation of the relation instances.
        // Will generalize/decompose, but this implementation is rather efficient for now.

    //Check if unique
    if (new Set(arrayColumn(allAttributeInstances, 0)).size !== allAttributeInstances.length) {
        console.log("The relation", relation, "is not unique.");
        return false;
    }

    //Check if total (each element in the class of the domain appears in an instance of the predicate)
    let allDomainElems = basefinds('X', read(typePredicate + '(X,' + domainType + ')'), facts, rules);
    if (allDomainElems.length !== allAttributeInstances.length) {
        console.log("The relation", relation, "is not total.");
        return false;
    }


    console.log(relation, "is a class attribute!");
    return true;

}

/* Test cases:
 * person.policy
    * should determine that person.policy is a class attribute, 
    * unless there someone in the database that is uninsured or multiply-insured
*/