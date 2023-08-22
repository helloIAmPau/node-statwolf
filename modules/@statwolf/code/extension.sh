#!/usr/bin/env bash

set -e

mkdir -p ../../../dist
rm -rfv ../../../dist/statwolf-code.vsix ../../../dist/statwolf-code-no-deps.vsix ../../../dist/temp 

npm run build

npx vsce package --out='../../../dist/statwolf-code-no-deps.vsix' --no-dependencies

CWD="$(pwd)"
PRESET="$(npm list @babel/preset-env -w @statwolf/babel | grep @babel/preset-env | awk '{ print $2 }')"

cd ../../../dist/
unzip statwolf-code-no-deps.vsix -d temp/
cd temp/extension
npm install "$PRESET"
cd ..
zip -r ../statwolf-code.vsix * 
cd ..

cd "$CWD"
