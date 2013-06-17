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

  return { n: n, d: d, program: program };
}


/**
 * Ensure the workspace exists and the db datafile is empty
 */
module.exports.prepareDb = function (filename, cb) {
  customUtils.ensureDirectoryExists(path.dirname(filename), function () {
    fs.exists(filename, function (exists) {
      if (exists) {
        fs.unlink(filename, cb);
      } else { return cb(); }
    });
  });
};


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
 * Insert a certain number of documents for testing
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
      executeAsap(function () {
        runFrom(i + 1);
      });
  }
  runFrom(0);
};


/**
 * Find documents with find
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

    d({ docNumber: order[i] }).count();
      executeAsap(function () {
        runFrom(i + 1);
      });
  }
  runFrom(0);
};


/**
 * Find documents with findOne
 */
module.exports.findOneDocs = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("FindingOne " + n + " documents");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (findOne) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished finding ' + n + ' docs');
      return cb();
    }

    d.findOne({ docNumber: order[i] }, function (err, doc) {
      if (!doc || doc.docNumber !== order[i]) { return cb('One find didnt work'); }
      executeAsap(function () {
        runFrom(i + 1);
      });
    });
  }
  runFrom(0);
};


/**
 * Update documents
 * options is the same as the options object for update
 */
module.exports.updateDocs = function (options, d, n, profiler, cb) {
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

    // Will not actually modify the document but will take the same time
    d({ docNumber: order[i] }).update({ docNumber: order[i] });
      executeAsap(function () {
        runFrom(i + 1);
      });
  }
  runFrom(0);
};


/**
 * Remove documents
 * options is the same as the options object for update
 */
module.exports.removeDocs = function (options, d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("Removing " + n + " documents");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT (remove) ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished removing ' + n + ' docs');
      return cb();
    }

    d({ docNumber: order[i] }).remove();
      d.insert({ docNumber: order[i] });
                                                           // So actually we're calculating the average time taken by one insert + one remove
        executeAsap(function () {
          runFrom(i + 1);
        });
  }
  runFrom(0);
};


/**
 * Load database
 */
module.exports.loadDatabase = function (d, n, profiler, cb) {
  var beg = new Date()
    , order = getRandomArray(n)
    ;

  profiler.step("Loading the database " + n + " times");

  function runFrom(i) {
    if (i === n) {   // Finished
      console.log("===== RESULT ===== " + Math.floor(1000* n / profiler.elapsedSinceLastStep()) + " ops/s");
      profiler.step('Finished loading a database' + n + ' times');
      return cb();
    }

    d.loadDatabase(function (err) {
      executeAsap(function () {
        runFrom(i + 1);
      });
    });
  }
  runFrom(0);
};




