//==============================================================================
// epilog_database.js
//==============================================================================
//==============================================================================
// Functions to answer questions about relations, rules,
// and facts in a given Epilog database.
//==============================================================================

//==============================================================================
// External Interface (functions intended to be public)
//==============================================================================
// isDerivableFact
// getSymbolType
// isClass
// isAttributeRelation
// isAttributeOfClass
// getClassOfAttribute
//==============================================================================

//==============================================================================
// Direct Dependencies
//==============================================================================
// {read, symbolp} from epilog.js
//==============================================================================

//==============================================================================
// functions about instantiated facts/rules
//==============================================================================
//------------------------------------------------------------------------------
// isDerivableFact
// getSymbolType
// isClass
// isAttributeRelation
// isAttributeOfClass
// getClassOfAttribute
//------------------------------------------------------------------------------

//Determine whether a groundAtom is derivable from the given facts and rules
function isDerivableFact(groundAtom, facts, rules) {
    if (typeof(groundAtom) === "string") {
        groundAtom = read(groundAtom);
    }
    
    //Must use compfindp, not basefindp. basefindp doesn't handle functions like evaluate
    return compfindp(groundAtom, facts, rules);
}

// Returns the type of the symbol if it exists, false otherwise
function getSymbolType(symbol, facts, rules, typePredicate) {
    if (!symbolp(symbol)) {
        console.log("[Warning] getSymbolType - first argument must be a symbol string.");
        return false;
    }

    const type = basefindx('T',read(typePredicate + '('+symbol+',T)'), facts, rules);

    return type;
}

// Determines whether relation is an attribute of className
function isAttributeOfClass(relation, className, facts, rules, metadata, options) {
    //Begin input validation
    if (typeof(relation) !== "string") {
        console.log("[Warning] isAttributeOfClass - first argument must be a string.");
        return false;
    }
    if (typeof(className) !== "string") {
        console.log("[Warning] isAttributeOfClass - second argument must be a string.");
        return false;
    }
    if (!isClass(className, facts, rules, metadata, options)) {
        console.log("[Warning] isAttributeOfClass - className must be a class.");
        return false;
    }
    //End Input validation

    let isAttribute = isAttributeRelation(relation, facts, rules, metadata, options);
    let belongsToClass = false;

    if (!isAttribute) {
        //console.log(relation,"is not an attribute relation.");
        return false;
    }

    if (options.useMetadata) {
        belongsToClass = basefindp(read('attribute(' + className + ',' + relation + ')'), metadata, []);
    } else {
        //TODO: Implement check without metadata

    }

    return belongsToClass;

}

// Determines whether the given relation is an attribute relation.
function isAttributeRelation(relation, facts, rules, metadata, options) {
    if (typeof(relation) !== "string") {
        console.log("[Warning] isAttributeRelation - first argument must be a string.");
        return false;
    }

    if (options.useMetadata) {
        return basefindp(read('type(' + relation + ',attributerelation)'), metadata, []);
    }

    //TODO: Implement check without metadata
    return false;
}

// Determines whether the given className is a class.
function isClass(className, facts, rules, metadata, options) {
    if (typeof(className) !== "string") {
        console.log("[Warning] isClass - first argument must be a string.");
        return false;
    }

    if (options.useMetadata) {
        return basefindp(read('type(' + className + ',class)'), metadata, []);
    }

    //TODO: Implement check without metadata
    return false;
}

// Gets the class that the given attributerelation belongs to
function getClassOfAttribute(relation, facts, rules, metadata, options) {
    if (typeof(relation) !== "string") {
        console.log("[Warning] getClassOfAttribute - first argument must be a string.");
        return false;
    }

    if (!isAttributeRelation(relation, facts, rules, metadata, options)) {
        console.log("[Warning] getClassOfAttribute -", relation, "is not an attributerelation.");
        return false;
    }

    if (options.useMetadata) {
        return basefindx('X',read('attribute(X,'+relation+')'), metadata, []);
    }

    //TODO: Implement check without metadata
    return false;
}