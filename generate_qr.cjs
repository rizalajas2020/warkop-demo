const QRCode = require('qrcode');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Get local network IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // fallback
}

const localIp = getLocalIpAddress();
const port = 5173;
const tables = ['01', '03', '05', '12'];

// Directories
const artifactDir = 'C:\\Users\\Hunter\\.gemini\\antigravity-ide\\brain\\2716162a-d2fc-406b-b12e-25a98beed686';
const publicDir = 'H:\\WEB PROJECT\\warkop-demo\\public\\qrcodes';

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log(`Local IP detected: ${localIp}`);
console.log(`Generating QR Codes pointing to: http://${localIp}:${port}/?table=X\n`);

async function generateQRCodes() {
  for (const table of tables) {
    const url = `http://${localIp}:${port}/?table=${table}`;
    const filename = `meja_${table}.png`;
    
    const artifactPath = path.join(artifactDir, filename);
    const publicPath = path.join(publicDir, filename);

    try {
      await QRCode.toFile(artifactPath, url, {
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: 300
      });

      fs.copyFileSync(artifactPath, publicPath);

      console.log(`[SUCCESS] Generated QR code for Meja ${table}`);
      console.log(`  - URL: ${url}`);
      console.log(`  - Saved to artifact: ${artifactPath}`);
      console.log(`  - Saved to public web folder: ${publicPath}\n`);
    } catch (err) {
      console.error(`[ERROR] Failed to generate QR code for Meja ${table}:`, err);
    }
  }
}

generateQRCodes();
