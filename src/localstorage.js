//==============================================================================
// localstorage.js
//==============================================================================
//==============================================================================
// A simplified and modified version of MRG's localstorage.js.
// Only contains methods used in loading and storing epilog facts, rules, 
// templates, and metadata for english explanations.
//==============================================================================

//==============================================================================
// External Interface (functions intended to be public)
//==============================================================================
// loadEpilogAndTemplates
// getEpilogAndTemplates
//
// getEpilogFacts
// getEpilogRules
// getEpilogMetadata
// getEnglishTemplates
//
// isEpilogFactsLoaded
// isEpilogRulesLoaded
// isEpilogMetadataLoaded
// isEnglishTemplatesLoaded
//==============================================================================

//==============================================================================
// Dependencies
//==============================================================================
// {read, readdata, definemorefacts, definemorerules, varp} from epilog.js
//==============================================================================

//==============================================================================
// localStorage data loading
//==============================================================================
//------------------------------------------------------------------------------
// loadEpilogAndTemplates
// getEpilogAndTemplates
//
// loadEpilogFacts
// loadEpilogRules
// loadEpilogMetadata
// loadEnglishTemplates
//
// isEpilogFactsLoaded
// isEpilogRulesLoaded
// isEpilogMetadataLoaded
// isEnglishTemplatesLoaded
//
// TemplateWrapper (class)
// getEpilogFacts
// getEpilogRules
// getEpilogMetadata
// getEnglishTemplates
//------------------------------------------------------------------------------

const epilogFactsKey = "facts";
const epilogRulesKey = "rules";
const epilogMetadataKey = "metadata";
const englishTemplatesKey = "english_templates";

// These specify from which files to load facts, rules, metadata, and templates.
// When these are null, we load from hidden divs on the webpage.
// Can be set by the user to a file on their local machine.
var epilogFactsFile = null;
var epilogRulesFile = null;
var epilogMetadataFile = null;
var englishTemplatesFile = null;


// Loads data into localStorage for global access and persistence between sessions.
function loadEpilogAndTemplates(overwriteExisting) {

    // Force loading data 
    if (overwriteExisting) {
        loadEpilogFacts();
        loadEpilogRules();
        loadEpilogMetadata();
        loadEnglishTemplates();
        return;
    }

    // Only load if data isn't present
    if (!isEpilogFactsLoaded()) {
        loadEpilogFacts();
    }

    if (!isEpilogRulesLoaded()) {
        loadEpilogRules();
    }

    if (!isEpilogMetadataLoaded) {
        loadEpilogMetadata();
    }

    if (!isEnglishTemplatesLoaded()) {
        loadEnglishTemplates();
    }
}

// Reads string data from localStorage into a usable format:
// Epilog facts and rules, and an array of templates. The template format is described above getTemplates())
function getEpilogAndTemplates() {
    return {
        facts: getEpilogFacts(),
        rules: getEpilogRules(),
        metadata: getEpilogMetadata(),
        english_templates: getEnglishTemplates()
    };
}


function loadEpilogFacts() {
    if (epilogFactsFile === null) {
        let widget = document.getElementById(epilogFactsKey);
        localStorage[epilogFactsKey] = widget.textContent;
    }
}

function loadEpilogRules() {
    if (epilogRulesFile === null) {
        let widget = document.getElementById(epilogRulesKey);
        localStorage[epilogRulesKey] = widget.textContent;
    }
}

function loadEpilogMetadata() {
    if (epilogMetadataFile === null) {
        let widget = document.getElementById(epilogMetadataKey);
        localStorage[epilogMetadataKey] = widget.textContent;
    }
}

function loadEnglishTemplates() {
    if (englishTemplatesFile === null) {
        let widget = document.getElementById(englishTemplatesKey);
        localStorage[englishTemplatesKey] = widget.textContent;
    }
}

function isEpilogFactsLoaded() {
    return localStorage.getItem(epilogFactsKey) !== null;
}

function isEpilogRulesLoaded() {
    return localStorage.getItem(epilogRulesKey) !== null;
}

function isEpilogMetadataLoaded() {
    return localStorage.getItem(epilogMetadataKey) !== null;
}

function isEnglishTemplatesLoaded() {
    return localStorage.getItem(englishTemplatesKey) !== null;
}

//Parses the Epilog fact string from localStorage into an Epilog fact set 
function getEpilogFacts() {
    return definemorefacts([], readdata(localStorage[epilogFactsKey]));
}

//Parses Epilog rules string from localStorage into an Epilog rule set
function getEpilogRules() {
    return definemorerules([], readdata(localStorage[epilogRulesKey]));
}

//Parses Epilog metadata string from localStorage into an Epilog fact set
function getEpilogMetadata() {
    return definemorefacts([], readdata(localStorage[epilogMetadataKey]));
}

class TemplateWrapper {
    /* Arguments:
    *   queryGoal: an Epilog query goal as a string.
    *   templateString: the unfilled template string for that query goal.
    *   varSequence: an array containing the variables in the template that appear in the query goal, 
    *                            ordered as they appear in the template.
    * 
    * This format is extremely useful for operations performed in english_explanation.js.
    */
   
    constructor(queryGoal, templateString, varSequence) {
        this.queryGoal = queryGoal;
        this.templateString = templateString;
        this.varSequence = varSequence;
    }
}

/* Parses input string of english templates into an array.
 * If no argument provided, parses string data from localStorage[englishTemplatesKey].
 * 
 * Expected format of string data in localStorage[englishTemplatesKey]:
 *      - A series of template pairs of the form (epilog_query_goal,"string containing an English template").
    *      - Each template pair should be on its own line.
    *      - The epilog_query_goal can contain variables, as in standard Epilog.
    *      - The template string can (and should) contain the same variables used in the epilog_query_goal.
    *           - Variables in the template should be surrounded by '$' characters. (e.g. "These are variables: $V$ and $VAR2$")
    *      - The template string should not contain variables that don't appear in the epilog_query_goal.
    *      - The template string should be surrounded with double quotes.
 * 
 * Returns an array containing one TemplateWrapper for each template.
 * If invalid argument or templates haven't been loaded into localStorage, returns false.
 * 
 * e.g. if localStorage[englishTemplatesKey] is the two-line string "(claim.policy(C,P),"the policy of $C$ is $P$") \n (policy.startdate(P,S),"$P$ began on $S$")",
        returns [new TemplateWrapper("claim.policy(C,P)", "the policy of $C$ is $P$", ["C", "P"]),
                 new TemplateWrapper("policy.startdate(P,S)", "$P$ began on $S$", ["P", "S"])]
*/

function getEnglishTemplates(englishTemplateStr = null) {
    if (englishTemplateStr === null) {
        if (!isEnglishTemplatesLoaded()) {
            console.log("[Warning] getEnglishTemplates: templates have not been loaded into localStorage.");
            return false;
        }

        englishTemplateStr = localStorage[englishTemplatesKey];
    }
    else if (typeof(englishTemplateStr) !== "string") {
        console.log("[Warning] getEnglishTemplates: input must be a string.");
        return false;
    }

    let templatePairStrings = englishTemplateStr.trim().split('\n');

    let templates = [];

    for (const pairStr of templatePairStrings) {
        //Convert to an epilog string to delegate parsing to epilog.js
        const [queryGoal, templateStr] = read("english" + pairStr.trim()).slice(1);

        //Get the variables from the goal
        const varSet = vars(queryGoal);
        
        //Scan the templateStr for instances of the vars, if any are present in the goal
        let varSequence = [];
        if (varSet.length !== 0) {
            let re = new RegExp('\\$' + varSet.join('\\$|\\$') + '\\$', 'g');
            varSequence = templateStr.match(re);

            if (varSequence === null) {
                varSequence = [];
            }

            //Remove the '$' symbols
            varSequence.forEach((matchedStr, index) => {
                varSequence[index] = matchedStr.slice(1, matchedStr.length-1);
            });
        }

        templates.push(new TemplateWrapper(queryGoal, templateStr, varSequence));
    } 

    //Return false if no templates parsed from input
    if (templates.length === 0) {
        return false;
    }

    return templates;
}


//==============================================================================
//==============================================================================
//==============================================================================
