//
// Minifies given JS file
// usage: minify -i <inputFile> -o <outputFile> [--es5=true]
//

const argv = require('yargs').argv;
const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const { prepack } = require('prepack');

// Define file names
//==================
const input = path.resolve(process.cwd(), argv.i);
const inputMap = `${input}.map`;
const output = path.resolve(process.cwd(), argv.o);
const outputMap = `${output}.map`;

console.info(`MINIFY: ${path.basename(input)}`);


// Read input code
//================
const inputCode = fs.readFileSync(input, { encoding: 'utf8' });

// Prepack everything
//===================
const prepacked = prepack(`__assumeDataProperty(global, "window", undefined);${inputCode}`, {
  inputSourceMapFilename: inputMap,
  sourceMaps: true,
});

// Write output files (prepack)
//=============================
fs.writeFileSync(output, prepacked.code);
fs.writeFileSync(outputMap, JSON.stringify(prepacked.map));


// Generate options
//=================
const options = {
  presets: ['babili', !!argv.es5 && ['es2015', { modules: false }], 'stage-2'],
  comments: false,
  minified: true,
  compact: true,
  sourceMaps: true,
  inputSourceMap: prepacked.map,
};

options.presets = options.presets.filter(a => !!a);

// Transform code
//===============
const result = babel.transform(prepacked.code, options);

// Add sourcemap URL to transformed code
const outputCode = `${result.code}\n\n//# sourceMappingURL=${path.basename(outputMap)}`;

// Write output files (babel-minify)
//==================================
fs.writeFileSync(output, outputCode);
fs.writeFileSync(outputMap, JSON.stringify(result.map));
