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