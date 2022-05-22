//------------------------------------------------------------------------------
// calendars.js
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// date gotten by looking up date(calendar,X)
//------------------------------------------------------------------------------


function populatecalendars ()
 {var charts = document.getElementsByTagName('calendar');
  for (var i=0; i<charts.length; i++)
      {populatecalendar(charts[i])};
  return true}

function populatecalendar (widget)
 {var calendar = widget.id;
  var date = compfindx('Date',seq('date',calendar,'Date'),lambda,library);
  if (!date) {date = '1998_11_24'};
  if (widget.childNodes.length===0) {widget.appendChild(makecalendar())};
  var cal = widget.childNodes[0];
  updatecal(cal,date);
  return true}

function updatecal (cal,date)
//------------------------------------------------------------------------------

function makecalendar ()
 {var table = document.createElement('table');
  table.setAttribute('style','margin-top:7px;background:#fff;text-align:center;font-family:Verdana;background:#fff;border-bottom:1px #A2BBDD solid;font-size:70%;cursor:pointer');
  table.setAttribute('cellspacing','0');
  table.setAttribute('cellpadding','4');

  var row = table.insertRow(0);
  row.setAttribute('style', 'cursor:default;background:#c3d9ff;color:#112ABB;font-weight:bold;vertical-align:middle');

  var cell = row.insertCell(0);
  cell.setAttribute('style','padding:2px;font-size:125%; padding-bottom:6px;text-align:right;cursor:pointer');
  cell.setAttribute('onclick','prevMonth(this,event)');
  cell.innerHTML = '&laquo;';

  cell = row.insertCell(1);
  cell.setAttribute('style','padding:2px;font:bold 100% Verdana,Sans-serif;padding-bottom:4px');
  cell.setAttribute('colspan','5');

  cell = row.insertCell(2);
  cell.setAttribute('style','padding:2px;font-size:125%; padding-bottom:6px;text-align:left;cursor:pointer');
  cell.setAttribute('onclick','nextMonth(this,event)');
  cell.innerHTML = '&raquo;';

  row = table.insertRow(1);
  row.setAttribute('style', 'cursor:default;background:#c3d9ff');
  cell = row.insertCell(0);
  cell.innerHTML = 'S';
  cell = row.insertCell(1);
  cell.innerHTML = 'M';
  cell = row.insertCell(2);
  cell.innerHTML = 'T';
  cell = row.insertCell(3);
  cell.innerHTML = 'W';
  cell = row.insertCell(4);
  cell.innerHTML = 'T';
  cell = row.insertCell(5);
  cell.innerHTML = 'F';
  cell = row.insertCell(6);
  cell.innerHTML = 'S';

  for (var i=2; i<9; i++)
      {row = table.insertRow(i);
       for (var j=0; j<7; j++)
           {cell = row.insertCell(j);
            cell.setAttribute('onclick','moddate(this)')}};

  return table}

//------------------------------------------------------------------------------
function moddate (widget)
  var date = widget.id;
  fullreact(seq('select',calendar.id,date));
  return true}

//------------------------------------------------------------------------------

var gMonths =

function prevMonth (elt,evt)
  selectCell(cal.prevYear,cal.prevMonth, 0,cal)}
  selectCell(cal.nextYear,cal.nextMonth, 0,cal)}
      {return null};
   if (d[1]<1 || d[1]>12 || d[2]<1 || d[2]>31) {return null};

  cal.prevMonth = prevMonth;
  cal.nextMonth = nextMonth;

  cal.rows[0].cells[1].innerHTML = monthName + ' ' + year;

//------------------------------------------------------------------------------