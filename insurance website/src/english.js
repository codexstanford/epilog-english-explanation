//==============================================================================
// english.js
//==============================================================================
//==============================================================================
// Simplistic translator from ground rules in Epilog to English.
// Uses atomic templates for relations.  See example at end.
//==============================================================================

function englishrules (rules,facts)
 {exp = '';
  for (var i=0; i<rules.length; i++)
      {exp += englishifyrule(rules[i],facts) + '\n\n'};
  return exp}

function englishify (p,facts)
 {if (symbolp(p)) {return englishatom(p,facts)};
  if (p[0]==='and') {return englishand(p,facts)};
  if (p[0]==='rule') {return englishifyrule(p,facts)};
  return englishatom(p,facts)}

function englishifyrule (p,facts)
 {if (symbolp(p) || p[0]!=='rule') {return "It is given that " + english(p,facts)};
  if (p.length===1) {return 'false'};
  if (p.length===2) {return english(p[1],facts)};
  if (p.length===3)
     {return english(p[1],facts) + ' because ' + english(p[2],facts)};
  result = english(p[1],facts) + ' because\n';
  result = result + '  ' +english(p[2],facts);
  for (var i=3; i<p.length; i++)
      {result = result + ' and\n  ' + english(p[i],facts)};
  return result}

function english (p,facts)
 {if (symbolp(p)) {return englishatom(p,facts)};
  if (p[0]==='and') {return englishand(p,facts)};
  if (p[0]==='rule') {return englishrule(p,facts)};
  return englishatom(p,facts)}

function englishand (p,facts)
 {if (p.length===1) {return 'true'};
  var result = english(p[1],facts);
  for (var i=2; i<p.length; i++)
      {result = result + ' and ' + english(p[i],facts)};
  return result}

function englishrule (p,facts)
 {if (symbolp(p) || p[0]!=='rule')
     {return "It is given that " + english(p,facts)};
  if (p.length===1) {return 'false'};
  if (p.length===2) {return english(p[1],facts)};
  var body = maksand(p.slice(2));
  return english(p[1],facts) + ' because ' + english(body,facts)}

function englishatom (p,facts)
 {var al = [];
  for (var i=0; i<facts.length; i++)
      {var al = simplematcher(facts[i][1],p);
       if (al) {
        console.log("facts:", facts[i][1]);
        console.log("p:", p);
        console.log("al:",al);
         return plugstring(stripquotes(facts[i][2]),al)}};
  return grind(p)}

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

//==============================================================================
// Example
//==============================================================================
//
// var berlitz = [read('english(p(X,Y,Z),"$Y$ is between $X$ and $Z$")'),
//                read('english(m(X,Y),"$X$ is left of $Y$")')]
//
// englishrule(read('p(X,Y,Z) :- m(X,Y) & m(Y,Z)'),berlitz)
// b is between a and c because a is left of and b is left of c
//
//==============================================================================
//==============================================================================
//==============================================================================
