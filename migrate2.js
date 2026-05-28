const fs = require('fs');
const path = require('path');

const copyIfExists = (src, dest) => {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`Copied directory: ${path.basename(src)}`);
    } else {
      fs.copyFileSync(src, dest);
      console.log(`Copied file: ${path.basename(src)}`);
    }
  }
};

const oldDir = path.join(__dirname, 'pixelshop');

// Copy Prisma
copyIfExists(path.join(oldDir, 'prisma'), path.join(__dirname, 'prisma'));

// Copy Firebase Config if any
copyIfExists(path.join(oldDir, 'firebase-applet-config.json'), path.join(__dirname, 'firebase-applet-config.json'));

// Copy .env or .env.example
copyIfExists(path.join(oldDir, '.env'), path.join(__dirname, '.env'));
copyIfExists(path.join(oldDir, '.env.example'), path.join(__dirname, '.env.example'));

console.log('Selesai memindahkan Prisma dan config files!');
