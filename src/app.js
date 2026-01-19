const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // Path kütüphanesini eklemeyi unutma!

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı Bağlantısı
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Veritabanına Bağlandı!'))
    .catch((err) => console.error('❌ Veritabanı Hatası:', err));

// Rotalar (Senin oluşturduğun rotalar buraya gelecek)
// app.use('/api/students', require('./routes/studentRoutes')); 
// (Buradaki rotalarını kendi dosyana göre düzenle veya olduğu gibi bırak)

// --- 🌍 PRODUCTION (CANLI) AYARLARI ---
// 1. React'in "build" klasörünü statik olarak sun
app.use(express.static(path.join(__dirname, '../client/build')));

// 2. Diğer tüm istekleri React'e yönlendir (Regex /.*/ kullanıyoruz!)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// ----------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend Sunucusu ${PORT} portunda çalışıyor...`);
});