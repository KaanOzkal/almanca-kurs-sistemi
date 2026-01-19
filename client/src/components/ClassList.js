import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUsers, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClassList = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/api/classes');
      setClasses(res.data);
    } catch (error) {
      console.error("Hata", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Bu sınıfı silmek istediğine emin misin? İçindeki öğrenciler 'Sınıfsız' durumuna düşecek.")) {
        try {
            await axios.delete(`http://127.0.0.1:3000/api/classes/${id}`);
            toast.success("Sınıf silindi.");
            fetchClasses();
        } catch (error) { toast.error("Silinemedi."); }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 className="text-secondary fw-bold mb-0">Sınıf Yönetimi</h3>
            <small className="text-muted">Aktif sınıflar ve doluluk oranları</small>
        </div>
        <Link to="/add-class" className="btn btn-primary fw-bold">
            <FaPlus className="me-2"/> Yeni Sınıf Ekle
        </Link>
      </div>

      <div className="row">
        {classes.length > 0 ? (
            classes.map(cls => {
                // Doluluk Oranı Hesabı
                const studentCount = cls.students ? cls.students.length : 0;
                const capacity = cls.capacity || 15;
                const percent = Math.round((studentCount / capacity) * 100);
                let progressColor = "bg-success";
                if(percent > 50) progressColor = "bg-warning";
                if(percent >= 100) progressColor = "bg-danger";

                return (
                    <div key={cls._id} className="col-md-4 mb-4">
                        <div className="card shadow-sm h-100 border-0 border-top border-4 border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="card-title fw-bold text-dark">{cls.name}</h5>
                                    <span className="badge bg-dark">{cls.level}</span>
                                </div>
                                
                                <div className="d-flex align-items-center text-muted mb-3">
                                    <FaUsers className="me-2"/>
                                    <span>{studentCount} / {capacity} Öğrenci</span>
                                </div>

                                {/* Doluluk Çubuğu */}
                                <div className="progress mb-3" style={{height: '10px'}}>
                                    <div className={`progress-bar ${progressColor}`} style={{width: `${Math.min(percent, 100)}%`}}></div>
                                </div>

                                <div className="d-flex justify-content-between mt-3">
                                    <Link to={`/class/${cls._id}`} className="btn btn-outline-primary btn-sm w-100 me-2">
                                        <FaEye className="me-1"/> Detay & Yoklama
                                    </Link>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(cls._id)}>
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        ) : (
            <div className="text-center py-5 text-muted">
                <h4>Henüz hiç sınıf yok. 🏫</h4>
                <p>Yeni bir sınıf ekleyerek başlayın.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ClassList;