import { transformAsync } from '@babel/core';
import preset from '@babel/preset-env';

export default function(code) {
  return transformAsync(code, {
    sourceType: 'script',
    compact: false,
    parserOpts: {
      allowReturnOutsideFunction: true
    },
    presets: [
      preset
    ]
  });
};
