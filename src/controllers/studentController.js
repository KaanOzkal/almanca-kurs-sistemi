const Student = require('../models/Student');
const Class = require('../models/Class');
const Payment = require('../models/Payment');

// 1. Yeni Öğrenci Kaydı ve Sınıfa Atama
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, tcIdentity, email, phone, address, classId, totalFee } = req.body;

    // A. Öğrenciyi Oluştur
    const newStudent = new Student({
      firstName, lastName, tcIdentity, email, phone, address, 
      currentClass: classId // Seçilen sınıfa ata
    });
    
    const savedStudent = await newStudent.save();

    // B. Sınıfın kontenjanına öğrenciyi ekle
    if (classId) {
        await Class.findByIdAndUpdate(classId, { $push: { students: savedStudent._id } });
    }

    // C. Ödeme Planı Oluştur (Örnek: Tek seferde borçlandırma)
    const newPayment = new Payment({
        student: savedStudent._id,
        totalAmount: totalFee,
        installments: [{ dueDate: new Date(), amount: totalFee }] // Peşin varsayımı (geliştirilebilir)
    });
    await newPayment.save();

    res.status(201).json({ message: 'Öğrenci başarıyla kaydedildi.', student: savedStudent });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Kur Atlama / Sınıf Değiştirme
exports.upgradeStudentLevel = async (req, res) => {
  try {
    const { studentId, newClassId, newLevel } = req.body;

    // Eski sınıftan öğrenciyi çıkar
    const student = await Student.findById(studentId);
    if(student.currentClass) {
        await Class.findByIdAndUpdate(student.currentClass, { $pull: { students: studentId } });
    }

    // Yeni sınıfa öğrenciyi ekle
    await Class.findByIdAndUpdate(newClassId, { $push: { students: studentId } });

    // Öğrenci profilini güncelle
    student.currentClass = newClassId;
    student.level = newLevel; // Örn: A1'den A2'ye geçti
    await student.save();

    res.status(200).json({ message: 'Öğrenci sınıfı ve seviyesi güncellendi.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ... önceki kodların altına ekle:

// 3. Yeni Sınıf Oluşturma (Test için gerekli)
exports.createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};