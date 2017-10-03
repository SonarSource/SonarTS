var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function fromWithString(suite) {
  var args = new Set();
  for (var i = 0; i < 25; i++) {
    args.add(i);
  }

  // add tests
  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old from (iterable) with current thread scheduler', function () {
      RxOld.Observable.from(args, null, null, RxOld.Scheduler.currentThread).subscribe(_next, _error, _complete);
    })
    .add('new from (iterable) with current thread scheduler', function () {
      RxNew.Observable.from(args, null, null, RxNew.Scheduler.queue).subscribe(_next, _error, _complete);
    });
};