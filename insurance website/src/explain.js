//==============================================================================
// explain.js
//==============================================================================
//==============================================================================
// First argument p is a ground atom derivable from facts and rules.
// Value is a ground version of a rule used to derive the first argument.
// Can be applied recursively to get explanations for subgoals of that rule.
//==============================================================================

function explain (p,facts,rules)
 {//console.log("Explain: ", p);
  if (symbolp(p)) {return explainatom(p,facts,rules)}
  if (p[0]==='same') {return p}
  if (p[0]==='distinct') {return p}
  if (p[0]==='not') {return explainnot(p,facts,rules)}
  if (basep(p[0],rules)) {return explainbase(p,facts,rules)};
  return explainview(p,facts,rules)}

function explainatom (p,facts,rules)
 {if (p==='true') {return 'true'};
  if (p==='false') {return false};
  if (basep(p,rules)) {return explainbase(p,facts,rules)};
  return explainview(p,facts,rules)}

function explainnot (p,facts,rules)
 {return p}

function explainbase (p,facts,rules)
 {var data = lookupfacts(p,facts);
 //console.log('looked p',p);
 //console.log('looked facts',facts);
 //console.log('looked data',data);
 
  for (var i=0; i<data.length; i++)
      {if (equalp(data[i],p)) {
        //console.log("equaled:", data[i]);
        return p}};
  return p}

function explainview (p,facts,rules)
 {
  //Find potentially-applicable rules
  var data = lookuprules(p,rules);
  //console.log("explainview: ", data);
  //Check through each possible rule to find one valid explanation of p
  for (var i=0; i<data.length; i++)
      {//If valid explanation found, return it
        var result = explainviewrule(p,data[i],facts,rules);
        if (result) {
         //console.log("rule result: ", result);
         return result
        }};
  return p}

function explainviewrule (p,rule,facts,rules)
 { //Check if the rule applies to this conclusion
   var al = simplematcher(rule[1],p);
  if (al===false) {return false};
  //console.log("rule1: ", rule, al);
  //console.log('same',rule[1],p);
  //console.log([seq('same',rule[1],p)]);
  //console.log([seq('same',rule[1],p)].concat(rule.slice(2)));
  //Combines the fact that the conclusion and the rule are the same with the facts that define the rule
  //Note: Still not sure exactly what maksand is for. Adding 'and' to the front?
  var body = maksand([seq('same',rule[1],p)].concat(rule.slice(2)));
  //console.log('slice: ', rule.slice(2));
  //console.log('explainviewrule: ', body);

  var finalresult = compfindx(rule,body,facts,rules);

  //console.log("Finalresult: ",finalresult);
  return finalresult;
  //return compfindx(rule,body,facts,rules)
}

//==============================================================================

function simpleplug (x,bl)
 {if (varp(x)) {return simpleplugvar(x,bl)};
  if (symbolp(x)) {return x};
  return simpleplugexp(x,bl)}

function simpleplugvar (x,bl)
 {var dum = simplevalue(x,bl);
  if (dum===false) {return x};
  return dum}

function simpleplugexp (x,bl)
 {var exp = new Array(x.length);
  for (var i=0; i<x.length; i++)
      {exp[i] = simpleplug(x[i],bl)};
  return exp}

//==============================================================================
//==============================================================================
//==============================================================================
