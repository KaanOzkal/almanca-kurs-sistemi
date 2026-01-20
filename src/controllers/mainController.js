const Student = require('../models/Student');
const Class = require('../models/Class');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const Attendance = require('../models/Attendance');
const User = require('../models/User'); // Yeni oluşturduğumuz model
const bcrypt = require('bcryptjs');     // Şifre şifreleme
const jwt = require('jsonwebtoken');    // Giriş bileti (Token) üretme
// --- YARDIMCI FONKSİYON: Log Kaydetme ---
// Bu fonksiyonu aşağıda tekrar tekrar kullanacağız
const logActivity = async (action, description) => {
  try {
    await ActivityLog.create({ action, description });
  } catch (err) {
    console.error("Log hatası:", err);
  }
};

// 1. Yeni Sınıf Oluştur (GÜNCELLENMİŞ VERSİYON)
exports.createClass = async (req, res) => {
  try {
    // 1. Terminale gelen veriyi yazdıralım (Frontend ne gönderiyor görelim)
    console.log("📥 Frontend'den gelen sınıf verisi:", req.body);

    const { name, day, time, quota, price } = req.body;

    // 2. Manuel Kontrol: İsim var mı?
    if (!name) {
        console.log("❌ HATA: Sınıf adı boş geldi!");
        return res.status(400).json({ error: "Sınıf adı zorunludur!" });
    }

    // 3. Modeli Oluştur
    const newClass = new Class({
        name,
        day,
        time,
        quota,
        price
    });

    // 4. Kaydet
    await newClass.save();
    
    // Log Tut
    await logActivity('Sınıf Oluşturuldu', `${newClass.name} sınıfı sisteme eklendi.`);

    console.log("✅ Sınıf başarıyla veritabanına kaydedildi:", newClass);
    res.status(201).json(newClass);

  } catch (error) {
    // 5. HATAYI DETAYLI GÖSTER (Terminalde hatayı oku!)
    console.error("❌ Sınıf Oluşturma Hatası (Mongoose):", error);
    
    // Frontend'e hatanın tam sebebini gönder
    res.status(400).json({ 
        message: "Kayıt Başarısız", 
        error: error.message 
    });
  }
};

// 2. Öğrenci Kaydet (Ve Ödeme Planı Oluştur)
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, tcIdentity, phone, classId, totalFee, initialPayment } = req.body;

    // A. Öğrenciyi Kaydet
    const student = new Student({
      firstName, lastName, tcIdentity, phone, currentClass: classId
    });
    const savedStudent = await student.save();

    // B. Sınıfa Ekle
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $push: { students: savedStudent._id } });
    }

    // C. Ödeme Planını Oluştur
    const payment = new Payment({
      student: savedStudent._id,
      totalAmount: totalFee,
      paidAmount: initialPayment,
      history: [{ 
          amount: initialPayment, 
          date: new Date(), 
          note: 'Kayıt sırasında peşinat' 
      }]
    });
    await payment.save();

    // Log Tut
    await logActivity('Yeni Kayıt', `${firstName} ${lastName} sisteme kaydedildi.`);

    res.status(201).json({ message: 'Kayıt ve Ön Ödeme Başarılı' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Tüm Öğrencileri Listele
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('currentClass');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Tüm Sınıfları Listele
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Tek Bir Öğrenci Detayı
exports.getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('currentClass');
    const payment = await Payment.findOne({ student: req.params.id });
    res.status(200).json({ student, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Ödeme Ekle (Tahsilat)
exports.addPayment = async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const paymentRecord = await Payment.findOne({ student: studentId });
    
    if (!paymentRecord) return res.status(404).json({ message: 'Ödeme kaydı bulunamadı' });

    paymentRecord.paidAmount += Number(amount);
    paymentRecord.history.push({
      amount: Number(amount),
      date: new Date(),
      note: 'Taksit Ödemesi'
    });

    await paymentRecord.save();
    
    // Log Tut
    await logActivity('Ödeme Alındı', `Öğrenci ID: ${studentId} için ${amount} TL tahsil edildi.`);

    res.status(200).json(paymentRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Sınıf Detayını Getir
exports.getClassDetail = async (req, res) => {
  try {
    const classDetail = await Class.findById(req.params.id).populate('students');
    res.status(200).json(classDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Sınıf Değiştir (Transfer, Fiyat Güncelleme ve SIFIRLAMA)
exports.changeClass = async (req, res) => {
  try {
    const { studentId, newClassId, newTotalAmount, resetPayments } = req.body;

    // 1. Öğrenciyi Bul
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Öğrenci bulunamadı' });

    // 2. Sınıf Değişimi (Eskiden çık, yeniye gir)
    if (student.currentClass) {
      await Class.findByIdAndUpdate(student.currentClass, { $pull: { students: studentId } });
    }
    if (newClassId) {
      await Class.findByIdAndUpdate(newClassId, { $push: { students: studentId } });
      student.currentClass = newClassId;
    }
    await student.save();

    // 3. FİNANSAL İŞLEMLER
    if (resetPayments === true) {
        // A) Eski verileri alıp NOT olarak kaydet (Veri kaybını önlemek için)
        const oldPayment = await Payment.findOne({ student: studentId });
        if (oldPayment) {
            const archiveNote = `--- DÖNEM KAPATILDI ---\nEski Toplam Borç: ${oldPayment.totalAmount} TL\nEski Ödenen: ${oldPayment.paidAmount} TL\nTarih: ${new Date().toLocaleDateString('tr-TR')}`;
            
            // Öğrencinin notlarına ekle
            student.notes.push({ text: archiveNote, date: new Date() });
            await student.save();

            // B) Ödeme tablosunu SIFIRLA
            oldPayment.paidAmount = 0;
            oldPayment.history = []; // Geçmiş listesini temizle
            // Yeni fiyat varsa onu yaz, yoksa 0 yap (temiz sayfa)
            oldPayment.totalAmount = newTotalAmount ? Number(newTotalAmount) : 0;
            
            await oldPayment.save();
        }
    } else {
        // Sıfırlama istenmediyse sadece toplam fiyatı güncelle (Eski bakiye kalır)
        if (newTotalAmount && newTotalAmount > 0) {
            await Payment.findOneAndUpdate(
                { student: studentId },
                { totalAmount: Number(newTotalAmount) }
            );
        }
    }

    // Log Tut
    await logActivity('Sınıf/Kur Değişikliği', `${student.firstName} ${student.lastName} sınıf değiştirdi. (Finansal Sıfırlama: ${resetPayments ? 'EVET' : 'HAYIR'})`);

    res.status(200).json({ message: 'Değişiklik başarılı', student });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Öğrenci Sil
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ message: 'Öğrenci bulunamadı' });
    
    // İsmi kaydedelim ki log mesajında kullanalım
    const fullName = `${student.firstName} ${student.lastName}`;

    if (student.currentClass) {
      await Class.findByIdAndUpdate(student.currentClass, { $pull: { students: studentId } });
    }

    await Payment.findOneAndDelete({ student: studentId });
    await Student.findByIdAndDelete(studentId);

    // Log Tut
    await logActivity('Öğrenci Silindi', `${fullName} ve tüm verileri silindi.`);

    res.status(200).json({ message: 'Silme başarılı' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Sınıf Sil
exports.deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const classData = await Class.findById(classId); // İsmini almak için

    if(!classData) return res.status(404).json({message: "Sınıf bulunamadı"});

    // Öğrencileri boşa çıkar
    await Student.updateMany(
      { currentClass: classId },
      { $unset: { currentClass: "" } }
    );

    await Class.findByIdAndDelete(classId);

    // Log Tut
    await logActivity('Sınıf Silindi', `${classData.name} silindi, öğrenciler boşa çıkarıldı.`);

    res.status(200).json({ message: 'Sınıf silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 11. Dashboard Verilerini Getir (GELİŞMİŞ VERSİYON)
exports.getDashboardData = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const classCount = await Class.countDocuments();
    const classes = await Class.find().select('name capacity students'); 

    // --- FİNANSAL HESAPLAMA (Aggregation) ---
    // Payment tablosundaki 'totalAmount' (Toplam Ciro) ve 'paidAmount' (Net Gelir) sütunlarını topluyoruz.
    const financials = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }, // Tüm öğrencilerin toplam borcu (Beklenen Ciro)
          collectedRevenue: { $sum: "$paidAmount" } // Şu ana kadar ödenen (Net Gelir)
        }
      }
    ]);

    // Eğer hiç ödeme kaydı yoksa 0 ata
    const financeData = financials[0] || { totalRevenue: 0, collectedRevenue: 0 };

    // Son 5 Aktivite
    const activities = await ActivityLog.find().sort({ date: -1 }).limit(5);

    // Grafik Verisi
    const chartData = classes.map(cls => ({
      name: cls.name,
      ogrenci: cls.students.length
    }));

    res.status(200).json({
      stats: {
        totalStudents: studentCount,
        totalClasses: classCount,
        totalRevenue: financeData.totalRevenue,      // DÜZELTİLDİ: Gerçek toplam tutar
        collectedRevenue: financeData.collectedRevenue // YENİ: Kasadaki net para
      },
      chartData,
      activities
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 12. Öğrenci Bilgilerini Güncelle (Edit)
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updates = req.body; // Gönderilen yeni veriler (ad, soyad, tel vs.)

    // 1. Öğrenciyi bul ve güncelle
    const updatedStudent = await Student.findByIdAndUpdate(studentId, updates, { new: true });

    if (!updatedStudent) return res.status(404).json({ message: 'Öğrenci bulunamadı' });

    // 2. Log Tut
    await logActivity('Bilgi Güncelleme', `${updatedStudent.firstName} ${updatedStudent.lastName} bilgilerini güncelledi.`);

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 13. Sınıf Bilgilerini Güncelle
exports.updateClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const updates = req.body; // { name: 'Yeni Ad', capacity: 25 ... }

    // Sınıfı güncelle
    const updatedClass = await Class.findByIdAndUpdate(classId, updates, { new: true });

    if (!updatedClass) return res.status(404).json({ message: 'Sınıf bulunamadı' });

    // Log Tut
    await logActivity('Sınıf Güncellendi', `${updatedClass.name} sınıfının bilgileri değiştirildi.`);

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 14. Öğrenciye Özel Not Ekle
exports.addStudentNote = async (req, res) => {
  try {
    const { text } = req.body;
    const student = await Student.findById(req.params.id);
    
    // Notu ekle
    student.notes.push({ text, date: new Date() });
    await student.save();

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 15. Öğrenci Notunu Sil
exports.deleteStudentNote = async (req, res) => {
  try {
    const { studentId, noteId } = req.params;
    
    await Student.findByIdAndUpdate(studentId, {
      $pull: { notes: { _id: noteId } }
    });

    res.status(200).json({ message: "Not silindi" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 16. Yoklama Getir (Tarihe Göre)
exports.getAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query; // ?date=2024-01-20 şeklinde gelir

    // Gelen tarihi günün başına sabitle (Saat farkı olmasın)
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ 
        classId: classId, 
        date: queryDate 
    });

    res.status(200).json(attendance ? attendance.records : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 17. Yoklama Kaydet / Güncelle
exports.saveAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    // Tarihi ayarla
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    // Varsa güncelle, yoksa yeni oluştur (upsert)
    const updatedAttendance = await Attendance.findOneAndUpdate(
      { classId: classId, date: queryDate },
      { records: records },
      { new: true, upsert: true } // Upsert: Yoksa oluştur demektir
    );

    await logActivity('Yoklama Alındı', `${date} tarihli yoklama kaydedildi.`);
    res.status(200).json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- KULLANICI İŞLEMLERİ (AUTH) ---

// 1. Kayıt Ol (Sadece ilk kullanıcıyı oluşturmak için kullanacaksın)
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kullanıcı zaten var mı?
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış." });
        }

        // Şifreyi şifrele (Hash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcıyı kaydet
        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!" });

    } catch (error) {
        res.status(500).json({ message: "Kayıt hatası", error: error.message });
    }
};

// 2. Giriş Yap (Login)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Kullanıcı adı veya şifre hatalı!" });
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Kullanıcı adı veya şifre hatalı!" });
        }

        // Token oluştur (Bilet ver)
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET, // Render'a eklediğin o gizli anahtar
            { expiresIn: '1d' } // Token 1 gün geçerli olsun
        );

        res.json({
            message: "Giriş başarılı!",
            token: token,
            username: user.username
        });

    } catch (error) {
        res.status(500).json({ message: "Giriş hatası", error: error.message });
    }
};