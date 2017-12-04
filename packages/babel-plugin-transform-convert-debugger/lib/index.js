"use strict";

module.exports = function(config) {
  const t = config.types;

  return {
    name: "transform-convert-debugger",
    visitor: {
      DebuggerStatement(path) {
        if(path.node.swdebugger === true) {
          return;
        }

        let left = t.binaryExpression('===', t.unaryExpression('typeof', t.identifier('$swdebugger')), t.stringLiteral('undefined'));
        let right = t.binaryExpression('==', t.identifier('$swdebugger'), t.nullLiteral());
        left = t.logicalExpression('||', left, right);
        right = t.binaryExpression('===', t.callExpression(t.identifier('$swdebugger'), []), t.booleanLiteral(true));

        const convertedDebugger = t.debuggerStatement();
        convertedDebugger.swdebugger = true;

        const condition = t.logicalExpression('||', left, right);
        const code = t.ifStatement(condition, convertedDebugger);

        path.replaceWith(code);
      }
    }
  };
};
