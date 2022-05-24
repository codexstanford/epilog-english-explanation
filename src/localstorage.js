//==============================================================================
// localstorage.js
//==============================================================================
//==============================================================================
// A simplified and modified version of MRG's localstorage.js.
// Only contains methods used in loading and storing epilog facts, rules, 
// templates, and metadata for english explanations.
//==============================================================================
//==============================================================================
// Dependencies
//==============================================================================
// {readdata} from epilog.js
//==============================================================================


//==============================================================================
// localStorage data loading
//==============================================================================
//------------------------------------------------------------------------------
// loadEpilogAndTemplates
//
// loadEpilogFacts
// loadEpilogRules
// loadEpilogMetadata
// loadEpilogEnglishTemplates
//
// getAsEpilogList
//------------------------------------------------------------------------------

// These specify from which files to load facts, rules, metadata, and templates.
// When these are null, we load from hidden divs on the webpage.
// Can be set by the user to a file on their local machine.
var epilogFactsFile = null;
var epilogRulesFile = null;
var epilogMetadataFile = null;
var epilogEnglishTemplatesFile = null;

// Loads data into localStorage for global access and persistence between sessions.
function loadEpilogAndTemplates(overwriteExisting) {
    // Force loading data 
    if (overwriteExisting) {
        loadEpilogFacts();
        loadEpilogRules();
        loadEpilogMetadata();
        loadEpilogEnglishTemplates();
        return;
    }

    // Only load if data isn't present
    if (localStorage.getItem("facts") === null) {
        loadEpilogFacts();
    }

    if (localStorage.getItem("rules") === null) {
        loadEpilogRules();
    }

    if (localStorage.getItem("metadata") === null) {
        loadEpilogMetadata();
    }

    if (localStorage.getItem("english_templates") === null) {
        loadEpilogEnglishTemplates();
    }

    //TODO: Read each from localstorage into variables
}


function loadEpilogFacts() {
    if (epilogFactsFile === null) {
        let widget = document.getElementById('facts');
        localStorage["facts"] = widget.textContent;
    }
}

function loadEpilogRules() {
    if (epilogRulesFile === null) {
        let widget = document.getElementById('rules');
        localStorage["rules"] = widget.textContent;
    }
}

function loadEpilogMetadata() {
    if (epilogMetadataFile === null) {
        let widget = document.getElementById('metadata');
        localStorage["metadata"] = widget.textContent;
    }
}

function loadEpilogEnglishTemplates() {
    if (epilogEnglishTemplatesFile === null) {
        let widget = document.getElementById('english_templates');
        localStorage["english_templates"] = widget.textContent;
    }
    
    //TODO: call read(english(tuple_line)) on each line of the templates when loading to variable
    //console.log(localStorage["english_templates"].trim().split("\n"));
}

//Parses epilog data from localStorage[localStorageKey] into Epilog list form
function getAsEpilogList(localStorageKey) {
    return readdata(localStorage[localStorageKey]);
}

/*
function initialize ()
 {
   //console.log("initialize - (localstorage)");
   //getparameters is From worksheet.js
   parameters = getparameters();

  var widget = document.getElementById('library');  
  library = [];
  definemorerules(library,readdata(widget.textContent));

  widget = document.getElementById('lambda');
  broadcast = widget.getAttribute('broadcast')==='true';
  reception = widget.getAttribute('reception')==='true';
  var room = parameters['room'];
  if (room) {definefacts(lambda,getdata(room))}
     else {definefacts(lambda,readdata(widget.textContent))};

  var widgets = document.getElementsByTagName('dataset');
  for (var i=0; i<widgets.length; i++)
      {var theory = [];
       definefacts(theory,readdata(widgets[i].textContent));
       datasets[widgets[i].id] = theory};

  widgets = document.getElementsByTagName('channel');
  for (var i=0; i<widgets.length; i++)
      {channels[widgets[i].id] = readdata(widgets[i].textContent)};

  fullreact('load');
  listen();
  return true}

  */
//==============================================================================
//==============================================================================
//==============================================================================
