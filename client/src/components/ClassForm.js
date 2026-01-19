import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';

const ClassForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    capacity: 15
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:3000/api/classes', formData);
      toast.success('🎉 Yeni sınıf oluşturuldu!');
      navigate('/'); // Ana sayfaya dön
    } catch (error) {
      toast.error('Sınıf oluşturulamadı.');
    }
  };

  return (
    <div className="container mt-4">
       <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Geri Dön
      </button>

      <div className="card shadow border-0" style={{maxWidth: '500px', margin: '0 auto'}}>
        <div className="card-header bg-warning text-dark py-3">
            <h5 className="mb-0 fw-bold"><FaChalkboardTeacher className="me-2"/> Yeni Sınıf Aç</h5>
        </div>
        <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Sınıf Adı</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Örn: A1 Sabah Grubu" 
                        value={formData.name} 
                        onChange={(e)=>setFormData({...formData, name:e.target.value})} 
                        required
                    />
                </div>

                <div className="row mb-4">
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Seviye</label>
                        <select className="form-select" value={formData.level} onChange={(e)=>setFormData({...formData, level:e.target.value})}>
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="C1">C1</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">Kontenjan</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            value={formData.capacity} 
                            onChange={(e)=>setFormData({...formData, capacity:e.target.value})} 
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-dark w-100 fw-bold py-2">SINIFI OLUŞTUR</button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ClassForm;