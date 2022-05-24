//==============================================================================
// localstorage.js
//==============================================================================
//==============================================================================
// Worksheets modifications:
// initialize changed to call listen
// fullreact changed to call autosavelambda
// listen defined and calls autoloadlambda
// lambda stored in localstorage
//==============================================================================

var room = 'lambda';
var broadcast = false;
var reception = false;

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

function fullreact (event)
 {var deltas = compexecute(event,lambda,library);
  //console.log("fullreact - (localstorage)");
  populatesheet();
  for (var i=0; i<deltas.length; i++) {execute(deltas[i])};
  if (broadcast) {autosavelambda()};
  return true}

function listen ()
 {var newdata = false;
  if (reception) {newdata = autoloadlambda()};
  if (newdata) {populatesheet()};
  if (reception) {setTimeout(listen,1000)};
  return true}

//==============================================================================
// manual saving and loading on remote server
//==============================================================================

function dosavedata ()
 {return savelambda()}

function savelambda ()
 {var widget = document.getElementById('lambda');
  var room = parameters['room'];
  if (!room) {return false};
  var nwt = putdata(room,lambda);
  widget.writetime = nwt;
  return true}

//------------------------------------------------------------------------------

function doloaddata ()
 {if (!parameters['room']) {return false};
  loadlambda();
  populatesheet();
  return true}

function loadlambda ()
 {var widget = document.getElementById('lambda');
  var room = parameters['room'];
  if (!room) {return false};
  var nwt = getwritetime(room);
  if (nwt===widget.writetime) {return false};
  widget.writetime = nwt;
  lambda = [];
  definefacts(lambda,getdata(room));
  return true}

//==============================================================================
// automatic saving and loading in local storage
//==============================================================================

function dobroadcast ()
 {broadcast = true;
  autosavelambda();
  return true}

function dounbroadcast ()
 {broadcast = false;
  return true}

function doreceive ()
 {reception = true;
  listen();
  return true}

function dounreceive ()
 {reception = false;
  return true}

function doconnect ()
 {broadcast = true;
  reception = true;
  autosavelambda();
  listen();
  return true}

function dodisconnect ()
 {broadcast = false;
  reception = false;
  return true}

//------------------------------------------------------------------------------

function autosavelambda ()
 {var room = parameters['room'];
  if (!room) {return false};
  putdata(room,lambda);
  console.log('lambda saved');
  return true}

function autoloadlambda ()
 {var room = parameters['room'];
  if (!room) {return false};
  lambda = [];
  definefacts(lambda,getdata(room));
  console.log('lambda loaded');
  return true}

//==============================================================================
// Local Storage
//==============================================================================

function getdata (room)
 {return readdata(localStorage[room])}

function putdata (room,data)
 {
   localStorage[room] = grindem(data);
  localStorage['time'] = timestamp();
  return localStorage['time']}

function getwritetime (dataset)
 {return localStorage['time']}

//==============================================================================
//==============================================================================
//==============================================================================
