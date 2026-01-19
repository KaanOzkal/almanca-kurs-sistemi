import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';

const StudentForm = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  
  // Form Verileri
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcIdentity: '',
    phone: '',
    classId: '' // Seçmeli
  });

  // Sınıfları çek (Dropdown için)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/classes');
        setClasses(res.data);
      } catch (error) {
        console.error("Sınıflar yüklenemedi", error);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.firstName || !formData.lastName || !formData.tcIdentity) {
        return toast.warn("Lütfen zorunlu alanları doldurun!");
    }

    try {
      // Öğrenciyi kaydet
      const res = await axios.post('http://127.0.0.1:3000/api/students', formData);
      
      // Eğer sınıf seçildiyse, o sınıfa da kaydet
      if(formData.classId) {
          await axios.post('http://127.0.0.1:3000/api/students/add-to-class', {
              studentId: res.data._id,
              classId: formData.classId
          });
      }

      toast.success('🎉 Öğrenci başarıyla kaydedildi!');
      navigate('/students'); // Listeye dön
    } catch (error) {
      toast.error('Kayıt başarısız! TC Kimlik veya numara çakışıyor olabilir.');
    }
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Geri Dön
      </button>

      <div className="card shadow border-0" style={{maxWidth: '600px', margin: '0 auto'}}>
        <div className="card-header bg-primary text-white py-3">
            <h5 className="mb-0 fw-bold"><FaUserPlus className="me-2"/> Yeni Öğrenci Kaydı</h5>
        </div>
        <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Ad *</label>
                        <input type="text" className="form-control" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName:e.target.value})} required/>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Soyad *</label>
                        <input type="text" className="form-control" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName:e.target.value})} required/>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">TC Kimlik No *</label>
                    <input type="text" maxLength="11" className="form-control" value={formData.tcIdentity} onChange={(e)=>setFormData({...formData, tcIdentity:e.target.value})} required/>
                </div>

                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Telefon Numarası</label>
                    <input type="text" className="form-control" placeholder="0555..." value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required/>
                </div>

                <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Sınıf Seçimi (Opsiyonel)</label>
                    <select className="form-select" value={formData.classId} onChange={(e)=>setFormData({...formData, classId:e.target.value})}>
                        <option value="">Sınıf Atama (Daha Sonra)</option>
                        {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.name} ({cls.level})</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success w-100 fw-bold py-2">KAYDET ✅</button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;