import * as english from '/src/englishExplanation.js';
import * as epilog from '/src/epilog.js';
import * as storage from '/src/storage.js';

const FACTS_FILE_SELECTOR_ID = "local_facts_file";
const RULES_FILE_SELECTOR_ID = "local_rules_file";
const METADATA_FILE_SELECTOR_ID = "local_metadata_file";
const TEMPLATES_FILE_SELECTOR_ID = "local_english_templates_file";

const defaultOptions =
                    {typePredicate: "type",
                    replaceWithType: true,
                    removeClassAttributes: false,
                    bindLocalConstants: true,
                    verifyDerivable: true,
                    useMetadata: true,
                    linkFromExplanation: true,
                    linkGivenFacts: true};

// Global to this file.
let facts, rules, metadata, english_templates;

document.addEventListener('DOMContentLoaded', function () {
    let widget = document.getElementById('explanation');

    createEventListeners();

    // Set options if they haven't been initialized.
    storage.setAllOptions(false, defaultOptions);

    // Don't load data unless this is the user's first visit to the page.
    storage.loadEpilogAndTemplates(false).then(() => {
        ({facts, rules, metadata, english_templates} = storage.getEpilogAndTemplates());

        const urlParameters = new URLSearchParams(window.location.search);

        const options = getOptions(urlParameters);

        setOptionCheckboxes(options);
        updateUsingUploadedDataIndicator();

        // No conclusion to explain
        if (!urlParameters.has('conclusion') || urlParameters.get('conclusion') === "") {
            widget.innerHTML = "<b>Explanation will be displayed here.</b>";
            return;
        }

        const conclusion = urlParameters.get('conclusion');

        //Keep the conclusion text in the input textarea
        document.getElementById('input_conclusion').innerHTML = conclusion;
        widget.innerHTML = "<pre>" + english.toEnglish(conclusion, facts, rules, metadata, english_templates, options) + "</pre>";
    });
});

function getOptions(urlParameters) {
    // Get all options from localstorage
    let options = storage.getAllOptions();

    console.log(options);

    // Override with options from url params.
    options.replaceWithType = getOptionFromParams("replaceWithType", urlParameters, options.replaceWithType);
    options.removeClassAttributes = getOptionFromParams("removeClassAttributes", urlParameters, options.removeClassAttributes);
    options.bindLocalConstants = getOptionFromParams("bindLocalConstants", urlParameters, options.bindLocalConstants);
    options.verifyDerivable = getOptionFromParams("verifyDerivable", urlParameters, options.verifyDerivable);
    options.linkFromExplanation = getOptionFromParams("linkFromExplanation", urlParameters, options.linkFromExplanation);
    options.linkGivenFacts = getOptionFromParams("linkGivenFacts", urlParameters, options.linkGivenFacts);

    // Update the options in localstorage
    storage.setAllOptions(true, options);

    return options;
}

// Assumes this is a boolean option.
function getOptionFromParams(optionName, urlParameters, defaultVal) {
    if (urlParameters.has(optionName)) {
        return (urlParameters.get(optionName) === 'true');
    }

    // If no url param for the option, return the default value.
    // localstorage only stores strings, so converting to boolean.
    return defaultVal === "true";
}

function setOptionCheckboxes(options) {
    console.log("setting removeclassattributes",options.removeClassAttributes);

    document.getElementById("replaceWithType").checked = options.replaceWithType;
    document.getElementById("removeClassAttributes").checked = options.removeClassAttributes;
    document.getElementById("bindLocalConstants").checked = options.bindLocalConstants;
    document.getElementById("verifyDerivable").checked = options.verifyDerivable;
    document.getElementById("linkFromExplanation").checked = options.linkFromExplanation;
    document.getElementById("linkGivenFacts").checked = options.linkGivenFacts;

    console.log("getting removeclassattributes",document.getElementById("removeClassAttributes").checked);
}

// Use whenever calling loadEpilogAndTemplates; defined and used here for MVC decomposition.
function updateUsingUploadedDataIndicator() {
    let widget = document.getElementById("uploaded_data_use_indicator");
    if (localStorage[storage.EPILOG_FACTS_KEY + storage.UPLOADED_FILENAME_KEY_SUFFIX] !== "null" ||
        localStorage[storage.EPILOG_RULES_KEY + storage.UPLOADED_FILENAME_KEY_SUFFIX] !== "null" ||
        localStorage[storage.EPILOG_METADATA_KEY + storage.UPLOADED_FILENAME_KEY_SUFFIX] !== "null" ||
        localStorage[storage.ENGLISH_TEMPLATES_KEY + storage.UPLOADED_FILENAME_KEY_SUFFIX] !== "null") {

        widget.style.display = "block";
    } else {
        widget.style.display = "none";
    }
}

// Set up listeners for file change events
function createEventListeners() {
    document.getElementById(FACTS_FILE_SELECTOR_ID).addEventListener("change", (event) => handleFileSelectedChange(event, FACTS_FILE_SELECTOR_ID));
    document.getElementById(RULES_FILE_SELECTOR_ID).addEventListener("change", (event) => handleFileSelectedChange(event, RULES_FILE_SELECTOR_ID));
    document.getElementById(METADATA_FILE_SELECTOR_ID).addEventListener("change", (event) => handleFileSelectedChange(event, METADATA_FILE_SELECTOR_ID));
    document.getElementById(TEMPLATES_FILE_SELECTOR_ID).addEventListener("change", (event) => handleFileSelectedChange(event, TEMPLATES_FILE_SELECTOR_ID));
}

//==============================================================================
// Event handlers
//==============================================================================

document.getElementById('button_explanation').addEventListener('click', function () {
    let widget = document.getElementById('input_conclusion');
    let newLocation = "./index.html?conclusion=" + widget.value;

    newLocation += "&replaceWithType=" + document.getElementById("replaceWithType").checked;
    newLocation += "&removeClassAttributes=" + document.getElementById("removeClassAttributes").checked;
    newLocation += "&bindLocalConstants=" + document.getElementById("bindLocalConstants").checked;
    newLocation += "&verifyDerivable=" + document.getElementById("verifyDerivable").checked;
    newLocation += "&linkFromExplanation=" + document.getElementById("linkFromExplanation").checked;
    newLocation += "&linkGivenFacts=" + document.getElementById("linkGivenFacts").checked;

    location = newLocation;
});

// Fill the conclusion input textarea with a random fact that matches a template.
// Not a uniformly random fact; a template is chosen uniformly at random, then a fact is chosen uniformly at random from those that matched the template.
document.getElementById('button_randomExample').addEventListener('click', function () {
    let input_textarea = document.getElementById('input_conclusion');

    if (facts.length === 0) {
        console.log("[Warning] No facts have been loaded.");
        input_textarea.value = "Could not generate example: No facts have been loaded.";
        return;
    }

    let english_templates_copy = [...english_templates];
    let randomFact = null;

    // Randomly pick templates until one can be found with matching facts.
    while (english_templates_copy.length > 0) {
        let randomIndex = Math.floor(Math.random()*english_templates_copy.length);
        let randomTemplate = english_templates_copy[randomIndex];

        let queryGoal = randomTemplate.getQueryAsList();

        let randomMatchedFacts = epilog.compfinds(queryGoal, queryGoal, facts, rules);

        // Found matching facts for the template
        if (randomMatchedFacts.length > 0) {
            randomFact = randomMatchedFacts[Math.floor(Math.random()*randomMatchedFacts.length)];
            break;
        }

        // Did not find matching fact, so remove template from the list and try again.
        english_templates_copy.splice(randomIndex, 1);
    }


    if (randomFact === null) {
        console.log("[Warning] No fact could be found that matched a template. Selecting random fact.");
        randomFact = facts[Math.floor(Math.random()*facts.length)];
    }

    // Update the conclusion input textarea
    input_textarea.value = epilog.grind(randomFact);
});

function toggleReadonlyTextareaVisibility(textareaWidgetId) {
    let textareaWidget = document.getElementById(textareaWidgetId);
    let labelWidget = document.getElementById(textareaWidgetId + "_label");
    if (textareaWidget.style.display !== "none") {
        textareaWidget.style.display = "none";
        labelWidget.style.display = "none";
        return;
    }

    textareaWidget.style.display = "block";
    labelWidget.style.display = "block";
}

document.getElementById('toggle_visibility_facts').addEventListener('click', function () {
    toggleReadonlyTextareaVisibility('facts');
});

document.getElementById('toggle_visibility_rules').addEventListener('click', function () {
    toggleReadonlyTextareaVisibility('rules');
});

document.getElementById('toggle_visibility_metadata').addEventListener('click', function () {
    toggleReadonlyTextareaVisibility('metadata');
});

document.getElementById('toggle_visibility_templates').addEventListener('click', function () {
    toggleReadonlyTextareaVisibility('templates');
});

document.getElementById('button_reload_default').addEventListener('click', function () {
    storage.setFactsFile(null);
    storage.setRulesFile(null);
    storage.setMetadataFile(null);
    storage.setTemplatesFile(null);

    storage.loadEpilogAndTemplates(true).then(() => {
        updateUsingUploadedDataIndicator();
    });
});

document.getElementById('button_upload_custom').addEventListener('click', function () {
    let factsFilesSelected = document.getElementById(FACTS_FILE_SELECTOR_ID).files;
    let rulesFilesSelected = document.getElementById(RULES_FILE_SELECTOR_ID).files;
    let metadataFilesSelected = document.getElementById(METADATA_FILE_SELECTOR_ID).files;
    let templatesFilesSelected = document.getElementById(TEMPLATES_FILE_SELECTOR_ID).files;

    // Currently, we use default data for those files that haven't been selected by the user.
    if (factsFilesSelected.length !== 0) {
        storage.setFactsFile(factsFilesSelected[0]);
    } else {
        //setFactsFile(new File([""], ""));
    }

    if (rulesFilesSelected.length !== 0) {
        storage.setRulesFile(rulesFilesSelected[0]);
    } else {
        //setRulesFile(new File([""], ""));
    }

    if (metadataFilesSelected.length !== 0) {
        storage.setMetadataFile(metadataFilesSelected[0]);
    } else {
        //setMetadataFile(new File([""], ""));
    }

    if (templatesFilesSelected.length !== 0) {
        storage.setTemplatesFile(templatesFilesSelected[0]);
    } else {
        //setTemplatesFile(new File([""], ""));
    }

    storage.loadEpilogAndTemplates(true).then(() => {
        updateUsingUploadedDataIndicator();
    });
});

function handleFileSelectedChange(event, fileSelectorWidgetId) {
    let filesSelected = document.getElementById(fileSelectorWidgetId).files;

    if (filesSelected.length === 0) {
        console.log("[Warning] No file selected for", fileSelectorWidgetId);
        return;
    }

    let selectedFileName = filesSelected[0].name;
    // Update the selected files
    switch (fileSelectorWidgetId) {
        case FACTS_FILE_SELECTOR_ID:
            document.getElementById("selected_facts_filename").innerHTML = selectedFileName;
            break;
        case RULES_FILE_SELECTOR_ID:
            document.getElementById("selected_rules_filename").innerHTML = selectedFileName;
            break;
        case METADATA_FILE_SELECTOR_ID:
            document.getElementById("selected_metadata_filename").innerHTML = selectedFileName;
            break;
        case TEMPLATES_FILE_SELECTOR_ID:
            document.getElementById("selected_templates_filename").innerHTML = selectedFileName;
            break;
    }
}
