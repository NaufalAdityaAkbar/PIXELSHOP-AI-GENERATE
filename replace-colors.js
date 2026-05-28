const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /#1c1410/gi, replace: '#090e1a' },
  { regex: /#261e14/gi, replace: '#111a2e' },
  { regex: /#332518/gi, replace: '#1e293b' },
  { regex: /#B4753A/gi, replace: '#ca8a04' },
  { regex: /#D4956A/gi, replace: '#facc15' },
  { regex: /#47301c/gi, replace: '#1e293b' },
  { regex: /#4d3621/gi, replace: '#334155' },
  { regex: /#F27D26/gi, replace: '#3b82f6' }
];

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
};

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(__dirname, 'app');

const processFile = (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replace);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated theme colors in: ${path.relative(__dirname, filePath)}`);
    }
  }
};

console.log('Starting global color theme replacement (Brown/Amber -> Blue/Yellow)...');
if (fs.existsSync(srcDir)) walkDir(srcDir, processFile);
if (fs.existsSync(appDir)) walkDir(appDir, processFile);
console.log('Theme replacement complete!');
