const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı Bağlantısı
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Veritabanına Bağlandı!'))
    .catch((err) => console.error('❌ Veritabanı Hatası:', err));

// --- 🚦 API ROTALARI (DÜZELTİLEN KISIM) ---
// Senin api.js dosyan her şeyi içerdiği için tek seferde yüklüyoruz.
try {
    // '/api' gelen her şeyi 'routes/api.js' dosyasına gönder
    // Sonuç: /api/students, /api/classes, /api/dashboard olarak çalışacak.
    app.use('/api', require('./routes/api')); 
    console.log("✅ Rotalar (api.js) başarıyla yüklendi.");

} catch (error) {
    console.error("⚠️ Rota dosyası 'routes/api.js' bulunamadı!", error.message);
}
// ---------------------------------------------


// --- 🌍 PRODUCTION (CANLI) AYARLARI ---
app.use(express.static(path.join(__dirname, '../client/build')));

// Diğer tüm istekleri React'e yönlendir
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// ----------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend Sunucusu ${PORT} portunda çalışıyor...`);
});