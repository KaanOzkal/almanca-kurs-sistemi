import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
  const navigate = useNavigate();
  
  // 1. Form Verileri (Eski 'price' kaldırıldı, yeniler eklendi)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcIdentity: '',
    phone: '',
    classId: '',
    totalFee: '',       // Yeni: Toplam Tutar
    initialPayment: ''  // Yeni: Peşinat
  });

  // Sınıfları tutacak liste
  const [classes, setClasses] = useState([]);

  // 2. Sayfa açılınca sınıfları çek
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/classes');
        setClasses(res.data);
      } catch (error) {
        console.error("Sınıflar alınamadı");
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register-student', formData);
      alert('✅ Öğrenci ve Ödeme Bilgisi Kaydedildi!');
      navigate('/');
    } catch (error) {
      console.error('Hata:', error);
      alert('❌ Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8"> {/* Genişliği biraz artırdım (col-md-8) */}
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Yeni Öğrenci Kaydı 📝</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                
                {/* Kişisel Bilgiler */}
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>Ad</label>
                        <input type="text" name="firstName" className="form-control" required onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Soyad</label>
                        <input type="text" name="lastName" className="form-control" required onChange={handleChange} />
                    </div>
                </div>

                <div className="mb-3">
                    <label>TC Kimlik</label>
                    <input type="text" name="tcIdentity" className="form-control" required onChange={handleChange} />
                </div>
                
                <div className="mb-3">
                    <label>Telefon</label>
                    <input type="text" name="phone" className="form-control" required onChange={handleChange} />
                </div>
                
                {/* Sınıf Seçimi */}
                <div className="mb-3">
                  <label>Sınıf Seç</label>
                  <select name="classId" className="form-select" onChange={handleChange}>
                    <option value="">Sınıf Seçiniz...</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} ({cls.level}) - {cls.capacity} Kişilik
                      </option>
                    ))}
                  </select>
                </div>

                <hr />

                {/* --- SENİN İSTEDİĞİN YENİ ÜCRET ALANLARI --- */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold">Toplam Kurs Ücreti (TL)</label>
                    <input type="number" name="totalFee" className="form-control" placeholder="Örn: 20000" required onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-success">Alınan Peşinat (TL)</label>
                    <input type="number" name="initialPayment" className="form-control" placeholder="Örn: 5000" required onChange={handleChange} />
                    <small className="text-muted">Hiç ödeme almadıysanız 0 yazın.</small>
                  </div>
                </div>
                {/* ------------------------------------------- */}

                <button type="submit" className="btn btn-primary w-100 mt-3">Kaydet</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;