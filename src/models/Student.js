const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  tcIdentity: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  registrationDate: { type: Date, default: Date.now },
  
  // Hangi sınıfta olduğunu tutar (Class tablosuna referans)
  currentClass: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },

  // --- YENİ EKLENEN KISIM: ÖZEL NOTLAR ---
  notes: [
    {
      text: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
  // ---------------------------------------
});

module.exports = mongoose.model('Student', StudentSchema);