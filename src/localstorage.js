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
// setFactsFile
// setRulesFile
// setMetadataFile
// setTemplatesFile
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
// loadEpilogAndTemplates (async)
// getEpilogAndTemplates
//
// setFactsFile
// setRulesFile
// setMetadataFile
// setTemplatesFile
//
// loadEpilogFacts (async)
// loadEpilogRules (async)
// loadEpilogMetadata (async)
// loadEnglishTemplates (async)
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

const EPILOG_FACTS_KEY = "facts";
const EPILOG_RULES_KEY = "rules";
const EPILOG_METADATA_KEY = "metadata";
const ENGLISH_TEMPLATES_KEY = "english_templates";

const UPLOADED_FILENAME_KEY_SUFFIX = "_uploaded_filename";

// These specify from which files to load facts, rules, metadata, and templates.
// When these are null, we load from hidden divs on the webpage.
// Can be set by the user to a file on their local machine.
var epilogFactsFile = null;
var epilogRulesFile = null;
var epilogMetadataFile = null;
var englishTemplatesFile = null;

// Note: To keep track of whether uploaded data is being used between page loads/refreshes, 
// we set localStorage[SOME_KEY_CONST + "_selected_filename"] to the name of the uploaded file.
// If using default data, the corresponding localStorage[SOME_KEY_CONST + "_selected_filename"] is set to "null".


// Loads data into localStorage for global access and persistence between sessions.
async function loadEpilogAndTemplates(overwriteExisting) {
    await loadEpilogFacts(overwriteExisting);
    await loadEpilogRules(overwriteExisting)
    await loadEpilogMetadata(overwriteExisting)
    await loadEnglishTemplates(overwriteExisting);
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


function setFactsFile(factsFile) {
    epilogFactsFile = factsFile;
}

function setRulesFile(rulesFile) {
    epilogRulesFile = rulesFile;
}

function setMetadataFile(metadataFile) {
    epilogMetadataFile = metadataFile;
}

function setTemplatesFile(templatesFile) {
    englishTemplatesFile = templatesFile;
}

async function loadEpilogFacts(overwriteExisting) {
    if (!overwriteExisting && isEpilogFactsLoaded()) {
        return;
    }

    let factsTextData = "";
    let factsSelectedFileName = "";

    // Default facts
    if (epilogFactsFile === null) {
        factsTextData = document.getElementById(EPILOG_FACTS_KEY).textContent;
        factsSelectedFileName = "null";
    } else {
        // Uploaded by user
        factsTextData = await epilogFactsFile.text();
        factsSelectedFileName = epilogFactsFile.name;
    }

    localStorage[EPILOG_FACTS_KEY] = factsTextData;
    localStorage[EPILOG_FACTS_KEY + UPLOADED_FILENAME_KEY_SUFFIX] = factsSelectedFileName;
}

async function loadEpilogRules(overwriteExisting) {
    if (!overwriteExisting && isEpilogRulesLoaded()) {
        return;
    }
    
    let rulesTextData = "";
    let rulesSelectedFileName = "";

    if (epilogRulesFile === null) {
        rulesTextData = document.getElementById(EPILOG_RULES_KEY).textContent;
        rulesSelectedFileName = "null";
    } else {
        rulesTextData = await epilogRulesFile.text();
        rulesSelectedFileName = epilogRulesFile.name;
    }

    localStorage[EPILOG_RULES_KEY] = rulesTextData;
    localStorage[EPILOG_RULES_KEY + UPLOADED_FILENAME_KEY_SUFFIX] = rulesSelectedFileName;
}

async function loadEpilogMetadata(overwriteExisting) {
    if (!overwriteExisting && isEpilogMetadataLoaded()) {
        return;
    }
    
    let metadataTextData = "";
    let metadataSelectedFileName = "";

    if (epilogMetadataFile === null) {
        metadataTextData = document.getElementById(EPILOG_METADATA_KEY).textContent;
        metadataSelectedFileName = "null";
    } else {
        metadataTextData = await epilogMetadataFile.text();
        metadataSelectedFileName = epilogMetadataFile.name;
    }

    localStorage[EPILOG_METADATA_KEY] = metadataTextData;
    localStorage[EPILOG_METADATA_KEY + UPLOADED_FILENAME_KEY_SUFFIX] = metadataSelectedFileName;
}

async function loadEnglishTemplates(overwriteExisting) {
    if (!overwriteExisting && isEnglishTemplatesLoaded()) {
        return;
    }
    
    let englishTemplatesTextData = "";
    let englishTemplatesSelectedFileName = "";

    console.log("test");

    if (englishTemplatesFile === null) {
        englishTemplatesTextData = document.getElementById(ENGLISH_TEMPLATES_KEY).textContent;
        englishTemplatesSelectedFileName = "null";
    } else {
        englishTemplatesTextData = await englishTemplatesFile.text();
        englishTemplatesSelectedFileName = englishTemplatesFile.name;
    }

    localStorage[ENGLISH_TEMPLATES_KEY] = englishTemplatesTextData;
    localStorage[ENGLISH_TEMPLATES_KEY + UPLOADED_FILENAME_KEY_SUFFIX] = englishTemplatesSelectedFileName;
}

function isEpilogFactsLoaded() {
    return localStorage.getItem(EPILOG_FACTS_KEY) !== null;
}

function isEpilogRulesLoaded() {
    return localStorage.getItem(EPILOG_RULES_KEY) !== null;
}

function isEpilogMetadataLoaded() {
    return localStorage.getItem(EPILOG_METADATA_KEY) !== null;
}

function isEnglishTemplatesLoaded() {
    return localStorage.getItem(ENGLISH_TEMPLATES_KEY) !== null;
}

//Parses the Epilog fact string from localStorage into an Epilog fact set 
function getEpilogFacts() {
    return definemorefacts([], readdata(localStorage[EPILOG_FACTS_KEY]));
}

//Parses Epilog rules string from localStorage into an Epilog rule set
function getEpilogRules() {
    return definemorerules([], readdata(localStorage[EPILOG_RULES_KEY]));
}

//Parses Epilog metadata string from localStorage into an Epilog fact set
function getEpilogMetadata() {
    return definemorefacts([], readdata(localStorage[EPILOG_METADATA_KEY]));
}

class TemplateWrapper {
    /* Arguments:
    *   queryGoal: an Epilog query goal as a string or list.
    *   templateString: the unfilled template string for that query goal.
    *   varSequence: an array containing the variables in the template that appear in the query goal, 
    *                            ordered as they appear in the template.
    * 
    * This format is extremely useful for operations performed in english_explanation.js.
    */
   
    constructor(queryGoal, templateString, varSequence) {
        if (typeof(queryGoal) === "string") {
            queryGoal = read(queryGoal);
        }
        this.queryGoal = queryGoal;
        this.templateString = templateString;
        this.varSequence = varSequence;
    }

    getQueryAsList() {
        return this.queryGoal;
    }
}

/* Parses input string of english templates into an array.
 * If no argument provided, parses string data from localStorage[ENGLISH_TEMPLATES_KEY].
 * 
 * Expected format of string data in localStorage[ENGLISH_TEMPLATES_KEY]:
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
 * e.g. if localStorage[ENGLISH_TEMPLATES_KEY] is the two-line string "(claim.policy(C,P),"the policy of $C$ is $P$") \n (policy.startdate(P,S),"$P$ began on $S$")",
        returns [new TemplateWrapper("claim.policy(C,P)", "the policy of $C$ is $P$", ["C", "P"]),
                 new TemplateWrapper("policy.startdate(P,S)", "$P$ began on $S$", ["P", "S"])]
*/

function getEnglishTemplates(englishTemplateStr = null) {
    if (englishTemplateStr === null) {
        if (!isEnglishTemplatesLoaded()) {
            console.log("[Warning] getEnglishTemplates: templates have not been loaded into localStorage.");
            return false;
        }

        englishTemplateStr = localStorage[ENGLISH_TEMPLATES_KEY];
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
        console.log("[Warning] getEnglishTemplates: no templates parsed from string.");
        return false;
    }

    return templates;
}


//==============================================================================
//==============================================================================
//==============================================================================
