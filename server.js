const express = require('express');
const axios = require('axios');
const qs = require('qs');
const dayjs = require("dayjs");
const fs = require("fs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const crypto = require('crypto');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta");


const app = express();
app.use(express.json());

const API_URL = 'https://app.orderkuota.com:443/api/v2';
const APP_VERSION_NAME = '25.03.14';
const APP_VERSION_CODE = '250314';
const APP_REG_ID = 'di309HvATsaiCppl5eDpoc:APA91bFUcTOH8h2XHdPRz2qQ5Bezn-3_TaycFcJ5pNLGWpmaxheQP9Ri0E56wLHz0_b1vcss55jbRQXZgc9loSfBdNa5nZJZVMlk7GS1JDMGyFUVvpcwXbMDg8tjKGZAurCGR4kDMDRJ';
const PHONE_UUID = 'evMfqwBaSn-rFDOk2ENacG';

const pinok = "280308";
const kunci = "new2010"; // ✅ API Key hardcoded
const FILE_PATH = "./json/apikeys.json";

//Functions import order Kuota
const {
  convertCRC16,
  generateTransactionId,
  generateExpirationTime,
  elxyzFile,
  generateQRIS,
  createQRIS,
  checkQRISStatus,
checkQRISStatusnew,
  checkQRISStatusnewsuli,  
createQRISnew
} = require('./func/orderKuota.js') 

// Middleware untuk mengizinkan akses ke file statis
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (req.url.includes('view-source') || ua.includes('view-source')) {
    return res.status(403).send('403 Forbidden');
  }
  next();
});
// 🔐 Middleware validasi API key
const validateApi = (req, res, next) => {
  const { apikey } = req.query;

  if (!apikey || apikey !== kunci) {
    return res.status(403).json({ error: 'Invalid or missing API key.' });
  }

  next();
};
// Middleware untuk mengizinkan akses ke file JSON hanya jika ada referer
app.use('/json', (req, res, next) => {
  if (req.headers.referer) {
    // Kalau file public dipanggil dari dalam website (ada referer), izinkan
    express.static(path.join(__dirname, 'json'))(req, res, next);
  } else {
    // Kalau langsung akses public/xxx di browser, kasih 404 keren
    res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background-color: #121212;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    
    .container {
      text-align: center;
      padding: 2rem;
      z-index: 10;
    }
    
    .error-code {
      font-size: 12rem;
      font-weight: 900;
      color: #fff;
      position: relative;
      margin-bottom: 1rem;
      text-shadow: 
        0 0 10px #00aaff,
        0 0 20px #00aaff,
        0 0 30px #00aaff,
        0 0 40px #ff00e0;
      animation: pulse 2s infinite;
      letter-spacing: 5px;
    }
    
    @keyframes pulse {
      0% {
        text-shadow: 
          0 0 10px #00aaff,
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #ff00e0;
      }
      50% {
        text-shadow: 
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #00aaff,
          0 0 50px #ff00e0,
          0 0 60px #ff00e0;
      }
      100% {
        text-shadow: 
          0 0 10px #00aaff,
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #ff00e0;
      }
    }
    
    .message {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #ffffff;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    .emoji {
      font-size: 3rem;
      display: inline-block;
      animation: spin 3s ease-in-out infinite;
      margin-left: 0.5rem;
    }
    
    .home-button {
      display: inline-block;
      background: linear-gradient(45deg, #ff00e0, #00aaff);
      color: white;
      font-weight: bold;
      padding: 1rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-size: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 170, 255, 0.4);
      position: relative;
      overflow: hidden;
    }
    
    .home-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 170, 255, 0.6);
    }
    
    .home-button::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: 0.5s;
    }
    
    .home-button:hover::before {
      left: 100%;
    }
    
    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.3;
      animation: move-particles 15s infinite linear;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(20deg);
      }
      50% {
        transform: rotate(0deg);
      }
      75% {
        transform: rotate(-20deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
    
    @keyframes move-particles {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
      }
      100% {
        transform: translateY(-1000px) translateX(500px) rotate(360deg);
      }
    }
    
    @media (max-width: 768px) {
      .error-code {
        font-size: 6rem;
      }
      
      .message {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="container">
    <h1 class="error-code">404</h1>
    <h2 class="message">Maaf Sekali Source Ini Gak Bisa Di Akses Hahahahaha<span class="emoji">🤨</span></h2>
    <a href="/" class="home-button">Balik ke Home</a>
  </div>
  
<script>
    // Create particles
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }
    
    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random particle properties
      const size = Math.random() * 5 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100 + 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      // Get random color from gradient
      const colors = ['#ff00e0', '#aa00ff', '#5500ff', '#0066ff', '#00aaff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = posX + '%';
      particle.style.top = posY + '%';
      particle.style.backgroundColor = color;
      particle.style.boxShadow = '0 0 ' + (size * 2) + 'px ' + color;
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = delay + 's';
      
      particlesContainer.appendChild(particle);
    }
</script>
</body>
</html>
    `);
  }
});

app.use('/module', (req, res, next) => {
  if (req.headers.referer) {
    // Kalau file public dipanggil dari dalam website (ada referer), izinkan
    express.static(path.join(__dirname, 'json'))(req, res, next);
  } else {
    // Kalau langsung akses public/xxx di browser, kasih 404 keren
    res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background-color: #121212;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    
    .container {
      text-align: center;
      padding: 2rem;
      z-index: 10;
    }
    
    .error-code {
      font-size: 12rem;
      font-weight: 900;
      color: #fff;
      position: relative;
      margin-bottom: 1rem;
      text-shadow: 
        0 0 10px #00aaff,
        0 0 20px #00aaff,
        0 0 30px #00aaff,
        0 0 40px #ff00e0;
      animation: pulse 2s infinite;
      letter-spacing: 5px;
    }
    
    @keyframes pulse {
      0% {
        text-shadow: 
          0 0 10px #00aaff,
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #ff00e0;
      }
      50% {
        text-shadow: 
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #00aaff,
          0 0 50px #ff00e0,
          0 0 60px #ff00e0;
      }
      100% {
        text-shadow: 
          0 0 10px #00aaff,
          0 0 20px #00aaff,
          0 0 30px #00aaff,
          0 0 40px #ff00e0;
      }
    }
    
    .message {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #ffffff;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    .emoji {
      font-size: 3rem;
      display: inline-block;
      animation: spin 3s ease-in-out infinite;
      margin-left: 0.5rem;
    }
    
    .home-button {
      display: inline-block;
      background: linear-gradient(45deg, #ff00e0, #00aaff);
      color: white;
      font-weight: bold;
      padding: 1rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-size: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(0, 170, 255, 0.4);
      position: relative;
      overflow: hidden;
    }
    
    .home-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 170, 255, 0.6);
    }
    
    .home-button::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: 0.5s;
    }
    
    .home-button:hover::before {
      left: 100%;
    }
    
    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.3;
      animation: move-particles 15s infinite linear;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(20deg);
      }
      50% {
        transform: rotate(0deg);
      }
      75% {
        transform: rotate(-20deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
    
    @keyframes move-particles {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
      }
      100% {
        transform: translateY(-1000px) translateX(500px) rotate(360deg);
      }
    }
    
    @media (max-width: 768px) {
      .error-code {
        font-size: 6rem;
      }
      
      .message {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="particles" id="particles"></div>
  
  <div class="container">
    <h1 class="error-code">404</h1>
    <h2 class="message">Maaf Sekali Source Ini Gak Bisa Di Akses Hahahahaha<span class="emoji">🤨</span></h2>
    <a href="/" class="home-button">Balik ke Home</a>
  </div>
  
<script>
    // Create particles
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }
    
    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random particle properties
      const size = Math.random() * 5 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100 + 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      // Get random color from gradient
      const colors = ['#ff00e0', '#aa00ff', '#5500ff', '#0066ff', '#00aaff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = posX + '%';
      particle.style.top = posY + '%';
      particle.style.backgroundColor = color;
      particle.style.boxShadow = '0 0 ' + (size * 2) + 'px ' + color;
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = delay + 's';
      
      particlesContainer.appendChild(particle);
    }
</script>
</body>
</html>
    `);
  }
});
// ✅ Middleware validasi API Key dari file JSON
const validateApiKey = (req, res, next) => {
  const { apikey } = req.query;
  if (!apikey) return res.status(403).json({ error: "API key tidak ada." });

  let keys = [];
  try {
    keys = JSON.parse(fs.readFileSync(FILE_PATH));
  } catch (err) {
    return res.status(500).json({ error: "Gagal baca file API key." });
  }

  const keyData = keys.find(k => k.apikey === apikey);
  if (!keyData) return res.status(403).json({ error: "API key tidak terdaftar." });

  const now = dayjs();
  const exp = dayjs(keyData.expired).tz();

  if (keyData.status !== "Active" || exp.isBefore(now)) {
    return res.status(403).json({ error: "API key tidak aktif atau sudah expired." });
  }

  next();
};

async function getMutasiQrisFromOrkut({
  username,
  authToken,
  type = '',
  page = 1,
  jumlah = '',
  dari_tanggal = '',
  ke_tanggal = '',
  keterangan = ''
}) {
  const HEADERS = {
    Host: 'app.orderkuota.com',
    'User-Agent': 'okhttp/4.10.0',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const payload = qs.stringify({
    auth_token: authToken,
    auth_username: username,
    [`requests[qris_history][jenis]`]: type,
    'requests[qris_history][jumlah]': jumlah,
    'requests[qris_history][page]': page,
    'requests[qris_history][dari_tanggal]': dari_tanggal,
    'requests[qris_history][ke_tanggal]': ke_tanggal,
    'requests[qris_history][keterangan]': keterangan,
    'requests[0]': 'account',
    app_version_name: APP_VERSION_NAME,
    app_version_code: APP_VERSION_CODE,
    app_reg_id: APP_REG_ID,
  });

  try {
    const { data } = await axios.get(`${API_URL}/get`, payload, {
      headers: HEADERS,
      timeout: 15000,
      validateStatus: () => true
    });

    return data;

  } catch (error) {
    console.error('Error fetching Orkut API:', error.message);
    return {
      success: false,
      qris_history: {
        success: false,
        message: `Error koneksi ke Orkut: ${error.message}`,
        results: []
      }
    };
  }
}
app.set('json spaces', 2);

// Endpoint untuk membuat QRIS
app.get('/api/orkut/createpayment', validateApiKey, async (req, res) => {
    const { amount, codeqr } = req.query;
    if (!amount) return res.json("Isi Parameter Amount.");
    if (!codeqr) return res.json("Isi Parameter CodeQr menggunakan qris code kalian.");

    try {
        const qrData = await createQRIS(amount, codeqr);

        // Notifikasi Telegram (async, non-blocking)
        const telegramBotToken = '7971448254:AAFaxNM4M23LIiKpqc2q84BOxBJSATv2vds';
        const chatId = '6682418964';
        const message = `
🚨 *Notifikasi Pembayaran Baru* 🚨

💰 *Jumlah Pembayaran*: Rp ${amount}
🔳 *Kode QR*: ${codeqr}

Pembayaran baru telah berhasil dibuat menggunakan kode QR Anda.`;

        // Kirim ke Telegram (tidak blocking response)
        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                photo: qrData.qrImageUrl,
                caption: message,
                parse_mode: 'Markdown'
            })
        }).catch(err => console.error("Telegram Error:", err));

        // Langsung kirim response ke client
        res.json({
            status: true,
            creator: "Wahyu - Store",
            result: qrData
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orkut/cekstatus', validateApiKey, async (req, res) => {
    const { username, authToken } = req.query;
    
    if (!username) {
        return res.json({ error: "Isi Parameter Username." });
    }
    if (!authToken) {
        return res.json({ error: "Isi Parameter Auth Token." });
    }
    
    try {
        const apiUrl = `https://qris-okeconnect-ws.vercel.app/api/mutasi?username=${username}&auth_token=${authToken}`;
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        // Check if data exists and get the latest transaction
        const latestTransaction = result.data;
        
        if (latestTransaction && result.status) {
            res.json({
                status: true,
                data: {
                    tanggal: latestTransaction.tanggal,
                    brand_name: latestTransaction.brand?.name || "UNKNOWN",
                    amount: latestTransaction.kredit,
                    keterangan: latestTransaction.keterangan,
                    balance: latestTransaction.saldo_akhir,
                    transaction_status: latestTransaction.status,
                    type: latestTransaction.type
                }
            });
        } else {
            res.json({ 
                status: false,
                message: result.message || "No transactions found." 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: false,
            error: error.message 
        });
    }
});

// Login awal untuk OTP
app.get('/api/login', validateApiKey, async (req, res) => {
  const { username, password } = req.query;

  const payload = qs.stringify({
    username,
    password,
    app_reg_id: APP_REG_ID,
    app_version_code: APP_VERSION_CODE,
    app_version_name: APP_VERSION_NAME,
  });

  try {
    const response = await axios.get(`${API_URL}/login`, payload, {
      headers: {
        Host: 'app.orderkuota.com',
        'User-Agent': 'okhttp/4.10.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      details: error.response?.data || null,
    });
  }
});

// Verifikasi OTP untuk mendapatkan token
app.get('/api/verify-otp', validateApiKey, async (req, res) => {
  const { username, otp } = req.query;

  const payload = qs.stringify({
    username,
    password: otp,
    app_reg_id: APP_REG_ID,
    app_version_code: APP_VERSION_CODE,
    app_version_name: APP_VERSION_NAME,
  });

  try {
    const response = await axios.get(`${API_URL}/login`, payload, {
      headers: {
        Host: 'app.orderkuota.com',
        'User-Agent': 'okhttp/4.10.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      details: error.response?.data || null,
    });
  }
});
// Endpoint untuk mendapatkan mutasi QRIS
// ✅ Endpoint API /api/mutasi
app.get('/api/mutasi', validateApiKey, async (req, res) => {
  try {
    const {
      username,
      auth_token,
      type = '',
      page = 1,
      jumlah = '',
      dari_tanggal = '',
      ke_tanggal = '',
      keterangan = ''
    } = req.query;

    if (!username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'Parameter username dan auth_token wajib diisi',
        data: null
      });
    }

    const result = await getMutasiQrisFromOrkut({
      username,
      authToken: auth_token,
      type,
      page: parseInt(page),
      jumlah,
      dari_tanggal,
      ke_tanggal,
      keterangan
    });

    const transaksi = result?.qris_history?.results;
    if (!Array.isArray(transaksi) || transaksi.length === 0) {
      return res.status(200).json({
        status: false,
        message: 'Tidak ada transaksi ditemukan',
        data: null
      });
    }

    // Ambil transaksi terbaru (urutan berdasarkan tanggal)
    const sorted = transaksi.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    const latest = sorted[0];

    // Format output JSON sesuai yang lu mau
    return res.status(200).json({
      status: true,
      data: {
        id: latest.id,
        debet: latest.debet || '0',
        kredit: latest.kredit || '0',
        saldo_akhir: latest.saldo_akhir || '0',
        keterangan: latest.keterangan?.trim() || '',
        tanggal: latest.tanggal,
        status: latest.status || '',
        fee: latest.fee || '',
        brand: {
          name: latest.brand?.name || '',
          logo: latest.brand?.logo || ''
        }
      }
    });

  } catch (error) {
    console.error('Internal error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Internal server error: ' + error.message,
      data: null
    });
  }
});


app.get('/api/cekharga-pulsa-telkomsel', validateApiKey, async (req, res) => {
  try {
    // Validasi parameter wajib
    const { auth_username, auth_token } = req.query;
    if (!auth_username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'auth_username dan auth_token diperlukan',
        data: []
      });
    }

    // Buat payload sesuai dengan yang diberikan
    const payload = qs.stringify({
      auth_token,
      auth_username,
      'requests[0]': 'account',
      'requests[vouchers][product]': 'pulsa',
      app_version_name: APP_VERSION_NAME,
      app_version_code: APP_VERSION_CODE,
      app_reg_id: APP_REG_ID,
    });

    // Panggilan ke API Orderkuota
    const response = await axios.get('https://app.orderkuota.com/api/v2/get', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    // Filter produk Telkomsel dari respons
    const telkomselProducts = response.data.vouchers?.results?.filter(product => 
      product.provider?.name?.toLowerCase().includes('telkomsel') && 
      product.name?.toLowerCase().includes('telkomsel') && 
      product.product_id === 'pulsa' && 
      product.status[0] === 1 // Hanya produk aktif
    ) || [];

    // Format respons
    const formattedProducts = telkomselProducts.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      price: {
        nominal: product.price,
        formatted: product.price_str
      },
      additional_validity: product.description?.match(/Masa Aktif[^<]+/)?.[0] || 'Tidak ada informasi masa aktif',
      status: product.status[1] || 'Aktif'
    }));

    // Cek apakah ada produk yang ditemukan
    if (formattedProducts.length > 0) {
      return res.json({
        status: true,
        message: 'Berhasil mengambil data harga pulsa Telkomsel',
        data: formattedProducts
      });
    } else {
      return res.status(404).json({
        status: false,
        message: 'Tidak ada data harga pulsa Telkomsel yang tersedia',
        data: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Gagal mengambil data harga pulsa: ${error.message}`,
      data: []
    });
  }
});

app.get('/api/cekharga-pulsa-indosat', validateApiKey,async (req, res) => {
  try {
    // Validasi parameter wajib
    const { auth_username, auth_token } = req.query;
    if (!auth_username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'auth_username dan auth_token diperlukan',
        data: []
      });
    }

    // Buat payload sesuai dengan yang diberikan
    const payload = qs.stringify({
      auth_token,
      auth_username,
      'requests[0]': 'account',
      'requests[vouchers][product]': 'pulsa',
      app_version_name: APP_VERSION_NAME,
      app_version_code: APP_VERSION_CODE,
      app_reg_id: APP_REG_ID,
    });

    // Panggilan ke API Orderkuota
    const response = await axios.get('https://app.orderkuota.com/api/v2/get', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    // Asumsi struktur respons: response.data.vouchers.results berisi daftar produk
    const indosatProducts = response.data.vouchers?.results?.filter(product => 
      product.provider?.name?.toLowerCase().includes('indosat') && 
      product.name?.toLowerCase().includes('indosat') && 
      product.product_id === 'pulsa' && 
      product.status[0] === 1 // Hanya produk aktif
    ) || [];

    // Format respons
    const formattedProducts = indosatProducts.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      price: {
        nominal: product.price,
        formatted: product.price_str
      },
      additional_validity: product.description?.match(/Tambahan Masa Aktif[^<]+/)?.[0] || 'Tidak ada informasi masa aktif',
      status: product.status[1] || 'Aktif'
    }));

    // Cek apakah ada produk yang ditemukan
    if (formattedProducts.length > 0) {
      return res.json({
        status: true,
        message: 'Berhasil mengambil data harga pulsa Indosat',
        data: formattedProducts
      });
    } else {
      return res.status(404).json({
        status: false,
        message: 'Tidak ada data harga pulsa Indosat yang tersedia',
        data: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Gagal mengambil data harga pulsa: ${error.message}`,
      data: []
    });
  }
});

app.get('/api/cekharga-pulsa-xl', validateApiKey, async (req, res) => {
  try {
    // Ambil parameter dari query
    const { auth_username, auth_token } = req.query;

    if (!auth_username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'auth_username dan auth_token diperlukan sebagai query parameter',
        data: []
      });
    }

    // Payload untuk API Orderkuota
    const payload = qs.stringify({
      auth_token,
      auth_username,
      'requests[0]': 'account',
      'requests[vouchers][product]': 'pulsa',
      app_version_name: APP_VERSION_NAME,
      app_version_code: APP_VERSION_CODE,
      app_reg_id: APP_REG_ID,
    });

    const response = await axios.get('https://app.orderkuota.com/api/v2/get', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    // Filter produk XL
    const xlProducts = response.data.vouchers?.results?.filter(product => 
      product.provider?.name?.toLowerCase().includes('xl') &&
      product.name?.toLowerCase().includes('xl') &&
      product.product_id === 'pulsa' &&
      product.status[0] === 1 // Aktif
    ) || [];

    // Format respons
    const formattedProducts = xlProducts.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      price: {
        nominal: product.price,
        formatted: product.price_str
      },
      additional_validity: product.description?.match(/Tambahan Masa Aktif[^<]+/)?.[0] || 'Tidak ada informasi masa aktif',
      status: product.status[1] || 'Aktif'
    }));

    if (formattedProducts.length > 0) {
      return res.json({
        status: true,
        message: 'Berhasil mengambil data harga pulsa XL',
        data: formattedProducts
      });
    } else {
      return res.status(404).json({
        status: false,
        message: 'Tidak ada data harga pulsa XL yang tersedia',
        data: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Gagal mengambil data harga pulsa: ${error.message}`,
      data: []
    });
  }
});
app.get('/api/cek-semua-produk', async (req, res) => {
  try {
    const { auth_username, auth_token } = req.query;

    if (!auth_username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'auth_username dan auth_token diperlukan sebagai query parameter',
        data: []
      });
    }

    const payload = qs.stringify({
      auth_token,
      auth_username,
      'requests[0]': 'account',
      'requests[vouchers][product]': '', // ambil semua produk
      app_version_name: APP_VERSION_NAME,
      app_version_code: APP_VERSION_CODE,
      app_reg_id: APP_REG_ID,
    });

    const response = await axios.get('https://app.orderkuota.com/api/v2/get', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    // Ambil semua produk yang status-nya aktif
    const allProducts = response.data.vouchers?.results?.filter(product =>
      product.status?.[0] === 1
    ) || [];

    // Format data
    const formattedProducts = allProducts.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      provider: product.provider?.name || 'Unknown',
      type: product.product_id, // jenis produk (pulsa, paket, dll)
      price: {
        nominal: product.price,
        formatted: product.price_str
      },
      additional_validity: product.description?.match(/Tambahan Masa Aktif[^<]+/)?.[0] || 'Tidak ada informasi masa aktif',
      status: product.status?.[1] || 'Aktif'
    }));

    if (formattedProducts.length > 0) {
      return res.json({
        status: true,
        message: 'Berhasil mengambil semua produk aktif',
        data: formattedProducts
      });
    } else {
      return res.status(404).json({
        status: false,
        message: 'Tidak ada produk aktif yang tersedia',
        data: []
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Gagal mengambil data produk: ${error.message}`,
      data: []
    });
  }
});

app.get('/api/cek-balance', validateApiKey, async (req, res) => {
  const { username, authToken } = req.query;

  const payload = qs.stringify({
    auth_token: authToken,
    auth_username: username,
    'requests[0]': 'account',
    app_version_name: APP_VERSION_NAME,
    app_version_code: APP_VERSION_CODE,
    app_reg_id: APP_REG_ID,
  });

  try {
    const { data } = await axios.get(`${API_URL}/get`, payload, {
      headers: {
        Host: 'app.orderkuota.com',
        'User-Agent': 'okhttp/4.10.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    const account = data?.account?.results;

    if (data?.account?.success && account) {
      return res.json({
        status: true,
        message: 'Berhasil mengambil data saldo',
        data: {
          name: account.name,
          username: account.username,
          email: account.email,
          phone: account.phone,
          balance: {
            nominal: account.balance,
            formatted: account.balance_str,
          },
          qris_balance: {
            nominal: account.qris_balance,
            formatted: account.qris_balance_str,
          },
          qrcode: account.qrcode,
          qris_url: account.qris,
          qris_name: account.qris_name
        }
      });
    }

    return res.json({
      status: false,
      message: data?.account?.message || 'Gagal mengambil data saldo',
      data: null
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
      data: null
    });
  }
});

app.get('/api/belikuota', validateApiKey, async (req, res) => {
  try {
    const {
      auth_username,
      auth_token,
      code_produk,
      phone,
      pin
    } = req.query;

    if (!auth_username || !auth_token || !code_produk || !phone || !pin) {
      return res.status(400).json({
        status: false,
        message: 'auth_username, auth_token, code_produk, phone, dan pin diperlukan',
        data: []
      });
    }

    // Ambil semua produk dari RumahAPI
    const produkRes = await axios.get('https://qris-okeconnect-ws.vercel.app/api/cek-semua-produk', {
      params: {
        auth_username,
        auth_token
      }
    });

    const allProducts = produkRes.data?.data || [];

    // Cari produk berdasarkan code
    const foundProduct = allProducts.find(p =>
      p.code?.toLowerCase() === code_produk.toLowerCase()
    );

    if (!foundProduct) {
      return res.status(404).json({
        status: false,
        message: `Produk dengan kode '${code_produk}' tidak ditemukan`,
        data: allProducts // Kirim semua produk yang tersedia
      });
    }

    // Payload untuk order (gantilah jika sistem order kamu bukan Orkut lagi)
    const orderPayload = qs.stringify({
      quantity: 1,
      app_reg_id: APP_REG_ID,
      phone_uuid: APP_REG_ID,
      pin,
      app_version_code: APP_VERSION_CODE,
      phone,
      auth_username,
      voucher_id: foundProduct.id, // Pakai id dari RumahAPI
      auth_token,
      app_version_name: APP_VERSION_NAME,
      payment: "balance"
    });

    const orderResponse = await axios.get(`${API_URL}/order`, orderPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'okhttp/4.12.0'
      }
    });

    const responseData = orderResponse.data;

    if (responseData.success && responseData.status) {
      return res.json({
        status: true,
        message: `Berhasil order '${foundProduct.name}' ke ${phone}`,
        data: responseData.results
      });
    } else {
      return res.status(400).json({
        status: false,
        message: responseData.message || 'Gagal melakukan pemesanan',
        data: responseData
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Terjadi error: ${error.message}`,
      data: []
    });
  }
});


app.get('/api/produkkuota', async (req, res) => {
  try {
    const { auth_username, auth_token } = req.query;

    if (!auth_username || !auth_token) {
      return res.status(400).json({
        status: false,
        message: 'auth_username dan auth_token wajib diisi',
        data: []
      });
    }

    // Panggil API Orkut buat ambil semua produk
    const produkRes = await axios.get(`${API_URL}/get`, {
      params: {
        auth_token,
        auth_username,
        'requests[0]': 'account',
        'requests[1]': 'vouchers',
        'requests[vouchers][product]': '', // kosongin = ambil semua
        app_version_name: APP_VERSION_NAME,
        app_version_code: APP_VERSION_CODE,
        app_reg_id: APP_REG_ID
      },
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept-Encoding': 'gzip'
      }
    });

    const allProducts = produkRes.data?.vouchers?.results || [];

    return res.json({
      status: true,
      message: 'Berhasil ambil semua produk',
      data: allProducts
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Gagal ambil produk: ${error.message}`,
      data: []
    });
  }
});


app.get('/api/qris-withdraw', validateApiKey, async (req, res) => {
  const { username, authToken, amount } = req.query;

  if (!username || !authToken || !amount) {
    return res.status(400).json({
      status: false,
      message: 'username, authToken, dan amount wajib diisi'
    });
  }

  const withdrawPayload = qs.stringify({
    auth_token: authToken,
    auth_username: username,
    [`requests[qris_withdraw][amount]`]: amount,
    app_version_name: APP_VERSION_NAME,
    app_version_code: APP_VERSION_CODE,
    app_reg_id: APP_REG_ID,
    phone_uuid: PHONE_UUID
  });

  try {
    // Step 1: Kirim request pencairan
    const withdrawResponse = await axios.get(`${API_URL}/get`, withdrawPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0'
      },
      timeout: 10000
    });

    const result = withdrawResponse.data?.qris_withdraw;

    if (!result?.success) {
      return res.json({
        status: false,
        message: result?.message || 'Pencairan gagal',
        data: null
      });
    }

    // Step 2: Ambil history QRIS untuk validasi
    const historyPayload = qs.stringify({
      auth_token: authToken,
      auth_username: username,
      'requests[qris_history][page]': 1,
      'requests[0]': 'account',
      'requests[qris_history][keterangan]': '',
      'requests[qris_history][jumlah]': '',
      'requests[qris_history][dari_tanggal]': '',
      'requests[qris_history][ke_tanggal]': '',
      app_version_name: APP_VERSION_NAME,
      app_version_code: APP_VERSION_CODE,
      app_reg_id: APP_REG_ID,
      phone_uuid: PHONE_UUID
    });

    const historyRes = await axios.get(`${API_URL}/get`, historyPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0'
      },
      timeout: 10000
    });

    const history = historyRes.data?.qris_history?.results || [];
    const latest = history.find(tx => tx.status === 'OUT' && tx.keterangan?.includes('Pencairan Saldo'));

    return res.json({
      status: true,
      message: result.message,
      data: {
        withdraw_id: latest?.id || null,
        nominal: latest?.debet || amount,
        waktu: latest?.tanggal || null,
        keterangan: latest?.keterangan || null,
        saldo_akhir: latest?.saldo_akhir || null
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
      data: null
    });
  }
});

// ✅ Endpoint POST /api/addapikey
app.get("/api/addapikey", validateApi, (req, res) => {
  const { nomor, username, expired } = req.query;
  if (!nomor || !username || !expired) {
    return res.status(400).json({ error: "nomor, username, expired wajib diisi." });
  }

  const now = dayjs();

  let exp;
  if (!isNaN(expired)) {
    // 🔢 expired = angka hari → tambahkan dari sekarang
    exp = now.add(parseInt(expired), "day");
  } else {
    // 🕒 expired = format manual
    exp = dayjs(expired).tz();
  }

  const status = exp.isAfter(now) ? "Active" : "Suspended";
  const newKey = {
    nomor,
    username,
    apikey: crypto.randomBytes(8).toString("hex"),
    expired: exp.format("YYYY-MM-DD HH:mm:ss"),
    status,
    created_at: now.format("YYYY-MM-DD HH:mm:ss")
  };

  let data = [];
  if (fs.existsSync(FILE_PATH)) {
    data = JSON.parse(fs.readFileSync(FILE_PATH));
  }

  data.push(newKey);
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    message: "API key berhasil ditambahkan.",
    data: newKey
  });
});

app.get("/api/update-expired", validateApi, (req, res) => {
  const { apikey_target, expired } = req.query;

  if (!apikey_target || !expired) {
    return res.status(400).json({ error: "apikey_target dan expired wajib diisi." });
  }

  const now = dayjs();

  let exp;
  if (!isNaN(expired)) {
    exp = now.add(parseInt(expired), "day");
  } else {
    exp = dayjs(expired).tz();
  }

  let data = [];
  if (fs.existsSync(FILE_PATH)) {
    data = JSON.parse(fs.readFileSync(FILE_PATH));
  }

  const index = data.findIndex(item => item.apikey === apikey_target);
  if (index === -1) {
    return res.status(404).json({ error: "API key tidak ditemukan." });
  }

  data[index].expired = exp.format("YYYY-MM-DD HH:mm:ss");
  data[index].status = exp.isAfter(now) ? "Active" : "Suspended";

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    message: "Expired berhasil di-update.",
    data: data[index]
  });
});

app.get("/api/update-apikey", validateApi, (req, res) => {
  const { username, apikey_baru } = req.query;

  if (!username || !apikey_baru) {
    return res.status(400).json({ error: "username dan apikey_baru wajib diisi." });
  }

  let data = [];
  if (fs.existsSync(FILE_PATH)) {
    data = JSON.parse(fs.readFileSync(FILE_PATH));
  }

  const duplicate = data.find(k => k.apikey === apikey_baru);
  if (duplicate) {
    return res.status(409).json({ error: "apikey_baru sudah dipakai user lain." });
  }

  const index = data.findIndex(k => k.username === username);
  if (index === -1) {
    return res.status(404).json({ error: "Username tidak ditemukan." });
  }

  data[index].apikey = apikey_baru;

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  return res.json({
    success: true,
    message: "API key berhasil diubah.",
    data: data[index]
  });
});
app.get("/api/list-apikeys", validateApi, (req, res) => {
  if (!fs.existsSync(FILE_PATH)) {
    return res.status(404).json({ error: "File apikey belum ada." });
  }

  const data = JSON.parse(fs.readFileSync(FILE_PATH));

  const active = data.filter(item => item.status === "Active");
  const suspended = data.filter(item => item.status === "Suspended");

  res.json({
    success: true,
    total: data.length,
    active_count: active.length,
    suspended_count: suspended.length,
    active,
    suspended
  });
});

app.get("/api/cekstatus-apikey", (req, res) => {
  const { apikey } = req.query;

  if (!apikey) {
    return res.status(400).json({ status: "error", message: "Parameter 'apikey' wajib diisi." });
  }

  if (!fs.existsSync(FILE_PATH)) {
    return res.status(404).json({ status: "error", message: "File apikey belum ada." });
  }

  const data = JSON.parse(fs.readFileSync(FILE_PATH));
  const targetKey = data.find(item => item.apikey === apikey);

  if (!targetKey) {
    return res.status(404).json({ status: "error", message: "API key tidak ditemukan." });
  }

  // Cek expired dan status
  const now = dayjs();
  const exp = dayjs(targetKey.expired).tz();
  if (targetKey.status !== "Active" || exp.isBefore(now)) {
    return res.status(403).json({ status: "error", message: "API key tidak aktif atau sudah expired." });
  }

  res.json({
    status: "success",
    message: "Status API key ditemukan.",
    data: {
      nomor: targetKey.nomor,
      username: targetKey.username,
      status: targetKey.status,
      expired: targetKey.expired,
      created_at: targetKey.created_at
    }
  });
});

app.get("/api/delete-apikey", validateApi, (req, res) => {
  const { apikey_target } = req.query;

  if (!apikey_target) {
    return res.status(400).json({ error: "apikey_target wajib diisi." });
  }

  if (!fs.existsSync(FILE_PATH)) {
    return res.status(404).json({ error: "API key tidak ditemukan." });
  }

  // ✅ Hapus hanya apikey, ubah status jadi Suspended
  data[index].apikey = "";
  data[index].status = "Suspended";

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    message: "API key berhasil dihapus (user tetap disimpan).",
    updated: data[index]
  });
});

// Jalankan server

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'module','index.html');
  console.log('Serving file from:', filePath); // 🔍 Tambahkan ini
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`✅ OrderKuota REST API running at http://localhost:${PORT}`);
  console.log('__dirname =', __dirname); // 🔍 Tambahkan ini
});
