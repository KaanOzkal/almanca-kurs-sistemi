import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaEdit, FaSave, FaTimes, FaChalkboardTeacher, FaUsers, FaCheck, FaBan, FaNotesMedical, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Veri State'leri
  const [classData, setClassData] = useState(null);
  
  // Yoklama State'leri
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Bugünün tarihi (YYYY-MM-DD)
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' | 'excused' }
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Düzenleme Modu
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchClassData();
  }, [id]);

  // Sınıf verisi gelince veya tarih değişince yoklamayı çek
  useEffect(() => {
    if(classData) {
        fetchAttendanceData();
    }
  }, [selectedDate, classData]);

  const fetchClassData = async () => {
    try {
      const res = await axios.get(`/api/classes/${id}`);
      setClassData(res.data);
      
      setEditForm({
          name: res.data.name,
          level: res.data.level,
          capacity: res.data.capacity
      });
    } catch (error) { console.error("Hata", error); }
  };

  // --- YOKLAMA VERİSİNİ ÇEK ---
  const fetchAttendanceData = async () => {
    setLoadingAttendance(true);
    try {
        const res = await axios.get(`/api/attendance/${id}?date=${selectedDate}`);
        const records = res.data;
        
        // Gelen veriyi state formatına çevir
        const newAttendance = {};
        
        // Önce varsayılan olarak herkese "present" (Var) ata (Henüz kayıt yoksa kolaylık olsun)
        classData.students.forEach(s => newAttendance[s._id] = 'present');

        // Eğer veritabanından kayıt geldiyse onları işle
        if(records.length > 0) {
            records.forEach(r => {
                newAttendance[r.studentId] = r.status;
            });
        }
        
        setAttendance(newAttendance);
    } catch (error) {
        console.error(error);
    } finally {
        setLoadingAttendance(false);
    }
  };

  // --- YOKLAMA DURUMUNU DEĞİŞTİR ---
  const handleAttendanceChange = (studentId, status) => {
      setAttendance(prev => ({
          ...prev,
          [studentId]: status
      }));
  };

  // --- YOKLAMAYI KAYDET ---
  const saveAttendance = async () => {
      try {
          const records = Object.keys(attendance).map(studentId => ({
              studentId,
              status: attendance[studentId]
          }));

          await axios.post('/api/attendance', {
              classId: id,
              date: selectedDate,
              records
          });
          toast.success(`📅 ${new Date(selectedDate).toLocaleDateString('tr-TR')} Yoklaması Kaydedildi!`);
      } catch (error) {
          toast.error("Kaydedilemedi!");
      }
  };

  // --- SINIF GÜNCELLEME ---
  const handleUpdateClass = async () => {
    try {
        await axios.put(`/api/classes/${id}`, editForm);
        toast.success("✅ Sınıf Bilgileri Güncellendi!");
        setIsEditing(false);
        fetchClassData();
    } catch (error) { toast.error("Güncelleme başarısız!"); }
  };

  const handleDeleteClass = async () => {
    if (window.confirm("Bu sınıfı silmek istediğine emin misin?")) {
        try {
            await axios.delete(`/api/classes/${id}`);
            navigate('/'); 
        } catch (error) { toast.error("Silinemedi."); }
    }
  }

  const toggleEdit = () => {
      setIsEditing(!isEditing);
      if (classData) setEditForm({ name: classData.name, level: classData.level, capacity: classData.capacity });
  };

  if (!classData) return <div className="text-center mt-5">Yükleniyor...</div>;
  const { students } = classData;
  const occupancy = (students.length / editForm.capacity) * 100;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/" className="btn btn-outline-secondary">← Panele Dön</Link>
        <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteClass}><FaTrash /> Sınıfı Sil</button>
      </div>

      {/* --- SINIF BİLGİ KARTI --- */}
      <div className="card shadow mb-4 border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="m-0 font-weight-bold text-primary"><FaChalkboardTeacher className="me-2"/> Sınıf Detayları</h5>
            {!isEditing ? (
                <button className="btn btn-sm btn-light text-primary fw-bold" onClick={toggleEdit}><FaEdit /> Düzenle</button>
            ) : (
                <div>
                    <button className="btn btn-sm btn-success me-2" onClick={handleUpdateClass}><FaSave /> Kaydet</button>
                    <button className="btn btn-sm btn-danger" onClick={toggleEdit}><FaTimes /> İptal</button>
                </div>
            )}
        </div>

        <div className="card-body bg-light">
          {isEditing ? (
              <div className="row g-3">
                  <div className="col-md-6"><label className="small text-muted">Sınıf Adı</label><input type="text" className="form-control" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name:e.target.value})}/></div>
                  <div className="col-md-3"><label className="small text-muted">Seviye</label><select className="form-select" value={editForm.level} onChange={(e)=>setEditForm({...editForm, level:e.target.value})}><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option></select></div>
                  <div className="col-md-3"><label className="small text-muted">Kapasite</label><input type="number" className="form-control" value={editForm.capacity} onChange={(e)=>setEditForm({...editForm, capacity:e.target.value})}/></div>
              </div>
          ) : (
              <div className="row align-items-center">
                <div className="col-md-8"><h2 className="text-dark mb-1 fw-bold">{classData.name}</h2><span className="badge bg-dark fs-6 mt-1">{classData.level} Seviyesi</span></div>
                <div className="col-md-4 text-end"><h5 className="text-muted mb-0">Kontenjan</h5><h3 className="fw-bold text-primary"><FaUsers className="me-2 opacity-50"/> {students.length} / {classData.capacity}</h3></div>
              </div>
          )}
          <div className="progress mt-4" style={{height: '10px'}}><div className={`progress-bar ${occupancy >= 100 ? 'bg-danger' : 'bg-success'}`} style={{width: `${Math.min(occupancy, 100)}%`}}></div></div>
        </div>
      </div>

      {/* --- YOKLAMA BÖLÜMÜ (YENİ) --- */}
      <div className="card shadow mb-5 border-0">
        <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="m-0 fw-bold"><FaCalendarAlt className="me-2"/> Yoklama Defteri</h5>
            
            {/* TARİH SEÇİCİ */}
            <input 
                type="date" 
                className="form-control form-control-sm w-auto fw-bold" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>
        
        <div className="card-body p-0">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Öğrenci Adı</th>
                <th className="text-center">Durum</th>
                <th className="text-end pe-4">Profil</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map(student => (
                  <tr key={student._id} className={attendance[student._id] === 'absent' ? 'table-danger' : ''}>
                    <td className="ps-4 fw-bold text-dark">
                        {student.firstName} {student.lastName}
                    </td>
                    <td className="text-center">
                        <div className="btn-group" role="group">
                            {/* VAR BUTONU */}
                            <button 
                                type="button" 
                                className={`btn btn-sm ${attendance[student._id] === 'present' ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => handleAttendanceChange(student._id, 'present')}
                            >
                                <FaCheck /> Var
                            </button>
                            
                            {/* İZİNLİ BUTONU */}
                            <button 
                                type="button" 
                                className={`btn btn-sm ${attendance[student._id] === 'excused' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                                onClick={() => handleAttendanceChange(student._id, 'excused')}
                            >
                                <FaNotesMedical /> İzinli
                            </button>

                            {/* YOK BUTONU */}
                            <button 
                                type="button" 
                                className={`btn btn-sm ${attendance[student._id] === 'absent' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                onClick={() => handleAttendanceChange(student._id, 'absent')}
                            >
                                <FaBan /> Yok
                            </button>
                        </div>
                    </td>
                    <td className="text-end pe-4">
                      <Link to={`/student/${student._id}`} className="btn btn-sm btn-light text-dark border">Detay</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-4 text-muted">Bu sınıfta öğrenci yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* KAYDET BUTONU */}
        {students.length > 0 && (
            <div className="card-footer bg-white text-end p-3">
                <button className="btn btn-primary btn-lg fw-bold px-5" onClick={saveAttendance}>
                    YOKLAMAYI KAYDET ✅
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;