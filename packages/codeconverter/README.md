## Code converter
This script can be used to convert the Statwolf bundled codebase into a proper code filesystem representation.

### How to run it
Before running either of the 2 scripts, please execute `npm install` in order to pull all the required dependencies.

#### compress.js
This script expects as input a configuration file and a json file containing an array of all edited file that should be bundled. A typical input could be:

```
[
  "Statwolf/Config/Routes/Routes.js",
  "Statwolf/Controls/OAuth/Receiver/OAuthLandingModel/OAuthLandingModel.json",
  "Statwolf/Controls/swTable/swTable.js",
  "Statwolf/Toolboxes/Algorithms/ControlCharts/SelfStarting/SelfStarting.r"
]
```

A simple way to call the script is:

```
node compress.js config.json myChangeset.json
```

When the input is provided, a `bundle.json` file will be generated as output.

#### expand.js
This script expects as input a configuration file and a json file representing the bundled version of a particular filesystem tree.

Execute it with:

```
node expand.js config.json bundle.json
```

A filesystem tree will be generated according to the content of the provided bundle.
