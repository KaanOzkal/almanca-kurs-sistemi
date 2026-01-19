const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Örn: "Yeni Kayıt"
  description: { type: String, required: true }, // Örn: "Ahmet Demir sisteme eklendi."
  date: { type: Date, default: Date.now } // İşlem zamanı
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);