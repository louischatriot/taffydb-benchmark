var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , execTime = require('exec-time')
  , profiler = new execTime('FIND BENCH')
  , commonUtilities = require('./commonUtilities')
  , config = commonUtilities.getConfiguration()
  , d = config.d
  , n = config.n
  , TAFFY = require('../taffy').taffy
  ;

async.waterfall([
  function (cb) { profiler.beginProfiling(); return cb(); }
, async.apply(commonUtilities.insertDocs, d, n, profiler)
, async.apply(commonUtilities.findDocs, d, n, profiler)
], function (err) {
  profiler.step("Benchmark finished");

  if (err) { return console.log("An error was encountered: ", err); }
});


  //var d = TAFFY();

  //d.insert({ name: "NYC" });
  //d.insert({ name: "Boston" });
  //d.insert({ name: "SF" });
  //d.insert({ name: "Boston" });

  //console.log(d({ name: "Boston" }).count());
  //console.log(d({ name: "Texas" }).count());


//d({ name: "Boston" }).update({ name: "Texas" });

  //console.log(d({ name: "Boston" }).count());
  //console.log(d({ name: "Texas" }).count());
