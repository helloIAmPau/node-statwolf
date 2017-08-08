# node-statwolf

Statwolf npm module

## API

```javascript
var input = {
  "userid": "user",
  "token": "lgjhlshflsdklsdf",
  "host": "0.0.0.0",
  "port": 9999,
  "basedir": "/test/path",
  "changes": [
    "file1.js"
  ]
}

var commandInput = {
  "userid": "user",
  "token": "lgjhlshflsdklsdf",
  "host": "0.0.0.0",
  "port": 9999,
  "command": "return 10"
}

// API
statwolf.push(input);
statwolf.runCommand(commandInput);

// Events
pushDone(error);
runRemoteCommandDone(data, error);
```
