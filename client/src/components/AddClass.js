import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddClass = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    capacity: 20
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/create-class', formData);
      alert('✅ Sınıf Başarıyla Oluşturuldu!');
      navigate('/'); // Listeye dön
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow border-0">
        <div className="card-header bg-dark text-white">
          <h4>Yeni Sınıf / Kur Oluştur</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Sınıf Adı (Örn: A1 Sabah Grubu)</label>
              <input type="text" className="form-control" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label>Seviye</label>
              <select className="form-select" onChange={(e) => setFormData({...formData, level: e.target.value})}>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Kontenjan</label>
              <input type="number" className="form-control" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
            </div>
            <button className="btn btn-dark w-100">Sınıfı Oluştur</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClass;