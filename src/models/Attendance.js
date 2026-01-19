const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true }, // Hangi günün yoklaması?
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      status: { 
        type: String, 
        enum: ['present', 'absent', 'excused'], // Var, Yok, İzinli
        default: 'present' 
      },
      note: { type: String } // "Geç geldi" vb. notlar
    }
  ]
});

// Aynı sınıf için aynı tarihte sadece 1 yoklama kağıdı olabilir (Tekrarı önler)
AttendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);