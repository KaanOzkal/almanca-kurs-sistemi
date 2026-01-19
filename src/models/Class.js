const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Örn: "A1 Sabah"
  level: { type: String, required: true }, // Örn: "A1"
  capacity: { type: Number, default: 20 },
  startDate: { type: Date },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] // Sınıftaki öğrenciler
});

module.exports = mongoose.model('Class', ClassSchema);