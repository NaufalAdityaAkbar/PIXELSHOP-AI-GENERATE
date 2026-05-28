const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'pixelshop', 'src');
const destDir = path.join(__dirname, 'src');

// Copy src directory
fs.cpSync(srcDir, destDir, { recursive: true });
console.log('Copied pixelshop/src to src');

// Read dependencies from pixelshop/package.json
const oldPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'pixelshop', 'package.json'), 'utf8'));
const newPkgPath = path.join(__dirname, 'package.json');
const newPkg = JSON.parse(fs.readFileSync(newPkgPath, 'utf8'));

const depsToAdd = ['lucide-react', 'motion', '@google/genai'];
if (!newPkg.dependencies) newPkg.dependencies = {};
depsToAdd.forEach(dep => {
    if (oldPkg.dependencies[dep]) {
        newPkg.dependencies[dep] = oldPkg.dependencies[dep];
    }
});

fs.writeFileSync(newPkgPath, JSON.stringify(newPkg, null, 2));
console.log('Updated package.json dependencies. Please run `npm install` after this.');
