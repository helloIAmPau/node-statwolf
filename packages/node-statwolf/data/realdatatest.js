var S = require('../lib/index');

var options = {
  userid: 'helloiampau',
  token: 'test123',
  host: 'http://127.0.0.1',
  port: 8080,
  testFiles: [
    './test.spec.js',
    './test2.spec.js',
  ]
};

var s = new S();
s.on('testsExecuted', function(report) {
  console.log(report);
});
s.runTests(options);
