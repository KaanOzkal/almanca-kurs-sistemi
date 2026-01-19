const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // .env dosyasındaki şifreleri okur

const apiRoutes = require('./routes/api');

const app = express();

// --- MIDDLEWARE (Ara Yazılımlar) ---
app.use(cors()); // Frontend'in erişmesine izin ver
app.use(express.json()); // Gelen JSON verilerini oku

// --- ROTALAR ---
app.use('/api', apiRoutes);

// --- VERİTABANI BAĞLANTISI VE SUNUCU BAŞLATMA ---
const PORT = process.env.PORT || 3000;

// Mongoose ile bağlan
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Veritabanına Bağlandı!');
    // Sunucuyu sadece veritabanı bağlandıysa başlat
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
    });
  })
  .catch((err) => {
    console.error('❌ Veritabanı Bağlantı Hatası:', err);
  });
  // ... (Yukarıdaki kodlar aynı kalsın) ...

// --- 🌍 PRODUCTION (CANLI) AYARLARI ---
const path = require('path');

// 1. React'in "build" klasörünü statik olarak sun
// (Render önce React'i build edecek, çıkan dosyaları buradan sunacağız)
app.use(express.static(path.join(__dirname, '../client/build')));

// 2. Diğer tüm istekleri React'e yönlendir (Sayfa yenileyince 404 vermesin diye)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// ----------------------------------------

// (app.listen ve mongoose.connect kısmı burada kalsın...)