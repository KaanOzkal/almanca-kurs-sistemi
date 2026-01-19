import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserPlus, FaChalkboardTeacher, FaUsers, FaMoneyBillWave } from 'react-icons/fa'; // İkonlar
import '../App.css'; // CSS'i dahil et

const Layout = ({ children }) => {
  const location = useLocation();

  // Menü Elemanları
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FaHome /> },
    { path: '/students', name: 'Öğrenci Listesi', icon: <FaUsers /> },
    { path: '/add', name: 'Yeni Kayıt', icon: <FaUserPlus /> },
    { path: '/create-class', name: 'Sınıf Yönetimi', icon: <FaChalkboardTeacher /> },
  ];

  return (
    <div className="d-flex">
      {/* SOL MENÜ (SIDEBAR) */}
      <div className="sidebar">
        <h3>BERLINER <span style={{color:'#3699ff'}}>CRM</span></h3>
        <div className="d-flex flex-column">
            {menuItems.map((item) => (
                <Link 
                    key={item.path} 
                    to={item.path} 
                    className={location.pathname === item.path ? 'active-link' : ''}
                >
                    {item.icon} {item.name}
                </Link>
            ))}
        </div>
        
        <div style={{position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', fontSize: '0.8rem', color: '#666'}}>
            v1.0.0 Pro
        </div>
      </div>

      {/* SAĞ TARAF (İÇERİK) */}
      <div className="main-content" style={{width: '100%'}}>
        {children}
      </div>
    </div>
  );
};

export default Layout;