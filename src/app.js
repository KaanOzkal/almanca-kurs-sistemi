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

// --- 🚦 API ROTALARI (BURASI ÇOK ÖNEMLİ) ---
// Senin routes klasöründeki dosya isimlerin neyse onları buraya yazmalısın.
// Örnek: routes/students.js, routes/classes.js gibi...

try {
    // Öğrenci İşlemleri için:
    app.use('/api/students', require('./routes/studentRoutes')); 
    
    // Sınıf İşlemleri için (Eğer dosya adın classRoutes.js ise):
    app.use('/api/classes', require('./routes/classRoutes')); 

    // Yoklama veya diğerleri varsa onları da ekle:
    // app.use('/api/attendance', require('./routes/attendanceRoutes'));

} catch (error) {
    console.error("⚠️ Rota dosyaları bulunamadı! Lütfen './src/routes' klasörünü kontrol et.", error.message);
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