const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  totalAmount: { type: Number, required: true }, // Toplam Kurs Ücreti (Örn: 20.000)
  paidAmount: { type: Number, default: 0 },      // Şu ana kadar ödenen (Örn: 5.000)
  
  // Ödeme Geçmişi (Tarihçesi)
  history: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      note: String // Örn: "Peşinat", "2. Taksit" vs.
    }
  ]
});

module.exports = mongoose.model('Payment', PaymentSchema);