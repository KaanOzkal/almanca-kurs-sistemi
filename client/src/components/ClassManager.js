import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUsers, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    capacity: 20
  });

  // Sayfa yüklendiğinde çalışacak kısım
  useEffect(() => {
    console.log("📢 ClassManager Sayfası Yüklendi! Veri çekiliyor..."); // KONSOL KONTROLÜ
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // 1. Veriyi çekmeye çalışıyoruz
      console.log("📡 İstek gönderiliyor: http://localhost:3000/api/classes");
      
      const res = await axios.get('http://localhost:3000/api/classes');
      
      // 2. Veri geldi mi?
      console.log("✅ Veri Geldi:", res.data);
      setClasses(res.data);
      
    } catch (error) {
      // 3. Hata varsa yakala
      console.error("❌ Veri Çekme Hatası:", error);
      toast.error("Sınıflar yüklenemedi! Konsola bak.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/create-class', formData);
      toast.success('✅ Sınıf Başarıyla Oluşturuldu!');
      setFormData({ ...formData, name: '' }); // Formu temizle
      fetchClasses(); // Listeyi yenile
    } catch (error) {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 text-secondary">🏫 Sınıf Yönetimi</h2>

      <div className="row">
        {/* SOL: LİSTE */}
        <div className="col-md-8">
          <div className="row">
            {classes.length > 0 ? (
                classes.map(cls => (
                <div key={cls._id} className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 className="card-title text-primary fw-bold mb-1">{cls.name}</h5>
                                <span className="badge bg-dark mb-2">{cls.level} Seviyesi</span>
                            </div>
                            <FaChalkboardTeacher size={24} className="text-muted"/>
                        </div>
                        <p className="text-muted small mt-2">
                            <FaUsers className="me-1"/> Kapasite: {cls.capacity} Kişi
                        </p>
                        <Link to={`/class/${cls._id}`} className="btn btn-outline-primary btn-sm w-100 mt-2">
                            Yönet & Öğrenciler ➡️
                        </Link>
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="col-12">
                    <div className="alert alert-warning">
                        Sınıf listesi boş veya yüklenemedi. (Konsolu kontrol et)
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* SAĞ: EKLEME FORMU */}
        <div className="col-md-4">
          <div className="card shadow border-0 bg-white">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><FaPlusCircle className="me-2"/>Yeni Sınıf</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label>Sınıf Adı</label>
                  <input type="text" className="form-control" placeholder="Örn: A1 Akşam" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label>Seviye</label>
                  <select className="form-select" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
                <div className="mb-3">
                    <label>Kapasite</label>
                    <input type="number" className="form-control" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
                </div>
                <button className="btn btn-success w-100">Oluştur</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassManager;