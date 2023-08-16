import { transformAsync } from '@babel/core';

export default function(code) {
  return transformAsync(code, {
    sourceType: 'script',
    compact: false,
    parserOpts: {
      allowReturnOutsideFunction: true
    },
    presets: [
      '@babel/preset-env'
    ]
  });
};
