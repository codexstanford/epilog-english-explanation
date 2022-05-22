//------------------------------------------------------------------------------
// calendars.js
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// date gotten by looking up date(calendar,X)
//------------------------------------------------------------------------------
populators = adjoin(populatecalendars,populators);

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

function updatecal (cal,date) {cal.style.display='block';  date = parsedate(date);  if(!date) {date = new Date()};  var month = date.getMonth()+1;  var year = date.getFullYear();  var day = date.getDate();  selectCell(year,month,day,cal)}
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
function moddate (widget) {var calendar = widget.closest('table').parentNode;
  var date = widget.id;
  fullreact(seq('select',calendar.id,date));
  return true}

//------------------------------------------------------------------------------// calendar widget//------------------------------------------------------------------------------

var gMonths = [{name: 'January', days: 31},  {name: 'February', days: 28},  {name: 'March', days: 31},  {name: 'April', days: 30},  {name: 'May', days: 31},  {name: 'June', days: 30},  {name: 'July', days: 31},  {name: 'August', days: 31},  {name: 'September', days: 30},  {name: 'October', days: 31},  {name: 'November', days: 30},  {name: 'December', days: 31}];

function prevMonth (elt,evt) {var cal = elt.closest('table');
  selectCell(cal.prevYear,cal.prevMonth, 0,cal)}function nextMonth (elt,evt) {var cal = elt.closest('table');
  selectCell(cal.nextYear,cal.nextMonth, 0,cal)}function parsedate (d) {d = d.split('_');   if (d.length!=3 || d[0].length!=4 || d[1].length==0 || d[1].length>2 || d[2].length==0 || d[2].length>2)
      {return null};   d[0] = d[0]*1;   d[1] = d[1]*1;   d[2] = d[2]*1;   if (isNaN(d[0]) || isNaN(d[1]) || isNaN(d[2])) {return null};
   if (d[1]<1 || d[1]>12 || d[2]<1 || d[2]>31) {return null};   return new Date(d[0],d[1]-1,d[2])}function selectCell (year,month,day,cal) {var monthIndex = month-1;  gMonths[1].days = ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? 29 : 28;  var prevYear = (month == 1) ? year - 1 : year;  var nextYear = (month == 12) ? year + 1 : year;  var prevMonth = (month == 1) ? 12 : month - 1;  var nextMonth = month % 12 + 1;  var firstDay = new Date ();  firstDay.setFullYear(year,monthIndex,1);  firstDay = firstDay.getDay();  var monthName = gMonths[monthIndex].name;  var numDays = gMonths[monthIndex].days;  var prevDays = gMonths[prevMonth-1].days;  var numPrevDays = (firstDay > 4) ? firstDay : firstDay + 7;

  cal.prevMonth = prevMonth;  cal.prevYear = prevYear;
  cal.nextMonth = nextMonth;  cal.nextYear = nextYear;

  cal.rows[0].cells[1].innerHTML = monthName + ' ' + year;  var d = prevDays - numPrevDays + 1;  var m = prevMonth;  var y = prevYear;  for (var r = 2; r < 9; r++)      {var row = cal.rows[r];       for (var c = 0; c < 7; c++)           {var cell = row.cells[c];            cell.innerHTML = d;            cell.id = y + '_' + normstring(m) + '_' + normstring(d);            cell.style.fontWeight = (m == month) ? 'bold' : '';            if (d == day && m == month && y == year)               {cell.style.backgroundColor = (c == 0 || c == 6) ? '#9bd' : '#ace'}            else {cell.style.backgroundColor = ''};       d++;       if (m == prevMonth && d > prevDays)          {m = month; d = 1; y = year}       else if (m == month && d > numDays)               {m = nextMonth; d = 1; y = nextYear}}}}function normalizedate (d) {d = d.split('_');  if(d.length != 3 || d[0].length == 0 || d[1].length == 0 || d[2].length == 0) return "";  d[0] = parseInt(d[0]);  d[1] = parseInt(d[1]);  d[2] = parseInt(d[2]);  if (isNaN(d[0]) || isNaN(d[1]) || isNaN(d[2])) return "";  if (d[1] < 1 || d[1] > 12 || d[2] < 1 || d[2] > 31) return "";  return d[0] + '_' + normstring(d[1]) + '_' + normstring(d[2])}function normstring (n) {if (n < 10) {return '0' + n}  else return '' + n}

//------------------------------------------------------------------------------//------------------------------------------------------------------------------//------------------------------------------------------------------------------
