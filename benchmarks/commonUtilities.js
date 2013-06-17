/**
 * Functions that are used in several benchmark tests
 */

var customUtils = require('../lib/customUtils')
  , fs = require('fs')
  , path = require('path')
  , TAFFY = require('../taffy').taffy
  , executeAsap   // process.nextTick or setImmediate depending on your Node version
  ;

try {
  executeAsap = setImmediate;
} catch (e) {
  executeAsap = process.nextTick;
}


/**
 * Configure the benchmark
 */
module.exports.getConfiguration = function () {
  var d, n
    , program = require('commander')
    ;

  program
    .option('-n --number [number]', 'Size of the collection to test on', parseInt)
    .parse(process.argv);

  n = program.number || 10000;

  console.log("----------------------------");
  console.log("Test with " + n + " documents");
  console.log("----------------------------");

  d = new TAFFY();

  return { n: n, d: d };
}


/**
 * Return an array with the numbers from 0 to n-1, in a random order
 * Uses Fisher Yates algorithm
 * Useful to get fair tests
 */
function getRandomArray (n) {
  var res = []
    , i, j, temp
    ;

  for (i = 0; i < n; i += 1) { res[i] = i; }

  for (i = n - 1; i >= 1; i -= 1) {
    j = Math.floor((i + 1) * Math.random());
    temp = res[i];
    res[i] = res[j];
    res[j] = temp;
  }

  return res;
};
module.exports.getRandomArray = getRandomArray;


/**
 * Insert documents
 */
module.exports.insertDocs = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step('Begin inserting ' + n + ' docs');

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (insert) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished inserting ' + n + ' docs');
      return cb();
    }

    d.insert({ docNumber: order[i] });
    executeAsap(function () { runFrom(i + 1); });
  }
  runFrom(0);
};


/**
 * Find documents
 */
module.exports.findDocs = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("Finding " + n + " documents");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (find) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished finding ' + n + ' docs');
      return cb();
    }

    d({ docNumber: order[i] }).count();  // Call count to make sure the docs were actually found, shouldn't impact the benchmark result
    executeAsap(function () { runFrom(i + 1); });
  }
  runFrom(0);
};


/**
 * Update documents
 */
module.exports.updateDocs = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("Updating " + n + " documents");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (update) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished updating ' + n + ' docs');
      return cb();
    }

    // Will not actually modify the document but this would take the same time if we were
    d({ docNumber: order[i] }).update({ docNumber: order[i] });
    executeAsap(function () { runFrom(i + 1); });
  }
  runFrom(0);
};


/**
 * Remove documents
 */
module.exports.removeDocs = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("Removing " + n + " documents");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (1 remove + 1 insert) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      console.log("====== IMPORTANT: Please note that this is the time that was needed to perform " + n + " removes and " + n + " inserts");
      console.log("====== The extra inserts are needed to keep collection size at " + n + " items for the benchmark to make sense");
      console.log("====== Use the insert speed logged above to calculate the actual remove speed");
      profiler.step('Finished removing ' + n + ' docs');
      return cb();
    }

    d({ docNumber: order[i] }).remove();
    d.insert({ docNumber: order[i] });
    executeAsap(function () { runFrom(i + 1); });
  }
  runFrom(0);
};


