const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  // 1. Temel Bilgiler
  name: { type: String, required: true }, // Örn: "A1 Sabah Grubu"
  
  // 'level' alanını zorunlu olmaktan çıkardım çünkü controller göndermiyor.
  // İstersen sonra formuna eklersin.
  level: { type: String }, 

  // 2. Controller'dan Gelen Yeni Alanlar (Bunlar EKSIKTI)
  day: { type: String },   // Örn: "Pazartesi - Çarşamba"
  time: { type: String },  // Örn: "18:00 - 21:00"
  
  // Controller 'quota' dediği için burayı da 'quota' yaptık (Eskiden capacity idi)
  quota: { type: Number, default: 20 }, 
  
  price: { type: Number, default: 0 }, // Sınıf ücreti

  startDate: { type: Date, default: Date.now },

  // 3. İlişkiler
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] 
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);