import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTrash, FaEye, FaSearch, FaUserSlash, FaLayerGroup, FaChevronDown, FaChevronRight } from 'react-icons/fa'; // Ok ikonları eklendi
import { toast } from 'react-toastify';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hangi kutuların açık olduğunu tutan State (Örn: { 'classID_123': true })
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await axios.get('/api/students');
      const cRes = await axios.get('/api/classes');
      setStudents(sRes.data);
      setClasses(cRes.data);
    } catch (error) {
      console.error("Veri hatası:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`/api/students/${id}`);
        toast.success("Öğrenci silindi 👋");
        fetchData(); 
      } catch (error) { toast.error("Silme başarısız!"); }
    }
  };

  // --- KUTU AÇIP KAPATMA FONKSİYONU ---
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId] // Varsa kapat, yoksa aç (Tersi yap)
    }));
  };

  // Arama filtresi
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           student.tcIdentity.includes(searchTerm);
  });

  // --- TABLO ÇİZEN YARDIMCI (Ortak Kullanım) ---
  const renderTable = (studentList) => (
    <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
                <tr>
                <th style={{width:'30%'}}>Ad Soyad</th>
                <th style={{width:'20%'}}>TC Kimlik</th>
                <th style={{width:'20%'}}>Telefon</th>
                <th style={{width:'15%'}}>Kayıt</th>
                <th className="text-end" style={{width:'15%'}}>İşlem</th>
                </tr>
            </thead>
            <tbody>
                {studentList.map(student => (
                <tr key={student._id}>
                    <td className="fw-bold text-dark">
                        <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary me-2 border" style={{width:'35px', height:'35px', fontSize:'0.8rem'}}>
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </div>
                            {student.firstName} {student.lastName}
                        </div>
                    </td>
                    <td>{student.tcIdentity}</td>
                    <td>{student.phone}</td>
                    <td>{new Date(student.registrationDate).toLocaleDateString('tr-TR')}</td>
                    <td className="text-end">
                        <Link to={`/student/${student._id}`} className="btn btn-sm btn-outline-info me-1" title="Detay"><FaEye /></Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(student._id)} title="Sil"><FaTrash /></button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  // --- GRUP RENDER (AKORDİYON YAPISI) ---
  const renderClassAccordion = (cls) => {
    const classStudents = filteredStudents.filter(s => s.currentClass && s.currentClass._id === cls._id);
    if (classStudents.length === 0) return null;

    // Eğer arama yapılıyorsa otomatik aç, yoksa tıklamaya bak
    const isOpen = searchTerm ? true : expandedGroups[cls._id];

    return (
      <div key={cls._id} className="card shadow-sm mb-3 border-0">
        {/* TIKLANABİLİR BAŞLIK */}
        <div 
            className="card-header bg-white py-3 d-flex align-items-center justify-content-between cursor-pointer" 
            style={{cursor: 'pointer', borderLeft: '5px solid #0d6efd'}}
            onClick={() => toggleGroup(cls._id)}
        >
            <div className="d-flex align-items-center">
                {/* Ok İkonu (Açıksa Aşağı, Kapalıysa Sağa) */}
                {isOpen ? <FaChevronDown className="text-primary me-3"/> : <FaChevronRight className="text-muted me-3"/>}
                
                <h5 className="mb-0 text-dark fw-bold">
                    <FaLayerGroup className="me-2 text-primary opacity-50"/> {cls.name}
                </h5>
                <span className="badge bg-light text-dark border ms-3">{cls.level}</span>
            </div>
            
            <span className="badge bg-primary rounded-pill">
                {classStudents.length} Öğrenci
            </span>
        </div>

        {/* İÇERİK (SADECE AÇIKSA GÖSTER) */}
        {isOpen && (
            <div className="card-body p-0 border-top">
                {renderTable(classStudents)}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      
      {/* BAŞLIK VE ARAMA */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
            <h3 className="text-secondary fw-bold mb-0">Öğrenci Listesi</h3>
            <small className="text-muted">Sınıfları görüntülemek için kutulara tıklayın</small>
        </div>
        <div className="col-md-6">
            <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted"/></span>
                <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="İsim veya TC No ile hızlı arama..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* 1. SINIFLAR (AKORDİYON) */}
      {classes.map(cls => renderClassAccordion(cls))}

      {/* 2. SINIFSIZLAR (AKORDİYON) */}
      {(() => {
          const noClassStudents = filteredStudents.filter(s => !s.currentClass);
          if (noClassStudents.length > 0) {
              const isOpen = searchTerm ? true : expandedGroups['noclass'];
              return (
                <div className="card shadow-sm mb-5 border-0">
                    <div 
                        className="card-header bg-warning text-dark py-3 d-flex align-items-center justify-content-between"
                        style={{cursor: 'pointer', borderLeft: '5px solid #ffc107'}}
                        onClick={() => toggleGroup('noclass')}
                    >
                         <div className="d-flex align-items-center">
                            {isOpen ? <FaChevronDown className="me-3"/> : <FaChevronRight className="me-3"/>}
                            <h6 className="mb-0 fw-bold"><FaUserSlash className="me-2"/> Sınıfı Atanmamış Öğrenciler</h6>
                         </div>
                         <span className="badge bg-dark rounded-pill">{noClassStudents.length}</span>
                    </div>
                    
                    {isOpen && (
                        <div className="card-body p-0 border-top">
                            {renderTable(noClassStudents)}
                        </div>
                    )}
                </div>
              );
          }
      })()}

      {filteredStudents.length === 0 && (
          <div className="text-center py-5">
              <h4 className="text-muted opacity-50">Kayıt bulunamadı... 🔍</h4>
          </div>
      )}

    </div>
  );
};

export default StudentList;