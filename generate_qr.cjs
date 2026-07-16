const QRCode = require('qrcode');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ==================== KONFIGURASI UTAMA ====================
// Set ke true untuk generate QR Code ke Vercel (Production)
// Set ke false jika ingin melakukan testing di jaringan wifi lokal (Development)
const IS_PRODUCTION = true; 

const VERCEL_URL = 'https://warkop-demo.vercel.app';
const LOCAL_PORT = 5173;
const tables = ['01', '03', '05', '12'];
// ==========================================================

// Fungsi mendapatkan IP lokal (untuk kebutuhan testing/dev mode)
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

// Tentukan base URL berdasarkan status environment
const baseUrl = IS_PRODUCTION 
  ? VERCEL_URL 
  : `http://${localIp}:${LOCAL_PORT}`;

// Direktori penyimpanan gambar QR Code
const artifactDir = 'C:\\Users\\Hunter\\.gemini\\antigravity-ide\\brain\\2716162a-d2fc-406b-b12e-25a98beed686';
const publicDir = 'H:\\WEB PROJECT\\warkop-demo\\public\\qrcodes';

// Membuat folder jika belum ada
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log(`[ENV] Mode: ${IS_PRODUCTION ? 'PRODUCTION (Vercel)' : 'DEVELOPMENT (Lokal)'}`);
console.log(`[INFO] Menghasilkan QR Code mengarah ke: ${baseUrl}/?table=X\n`);

async function generateQRCodes() {
  for (const table of tables) {
    const url = `${baseUrl}/?table=${table}`;
    const filename = `meja_${table}.png`;
    
    const artifactPath = path.join(artifactDir, filename);
    const publicPath = path.join(publicDir, filename);

    try {
      // Membuat file QR Code
      await QRCode.toFile(artifactPath, url, {
        color: {
          dark: '#000000', // Warna QR Code
          light: '#ffffff' // Warna Background
        },
        width: 300
      });

      // Menyalin ke folder public web project agar bisa di-deploy kembali
      fs.copyFileSync(artifactPath, publicPath);

      console.log(`[BERHASIL] QR Code Meja ${table} selesai dibuat!`);
      console.log(`  - Link URL : ${url}`);
      console.log(`  - Salinan 1: ${artifactPath}`);
      console.log(`  - Salinan 2: ${publicPath}\n`);
    } catch (err) {
      console.error(`[GAGAL] Terjadi kesalahan saat membuat QR Code Meja ${table}:`, err);
    }
  }
  console.log('--- Seluruh QR Code berhasil diperbarui! ---');
}

generateQRCodes();