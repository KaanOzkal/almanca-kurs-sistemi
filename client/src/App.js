import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- BİLEŞENLER ---
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AddStudent from './components/AddStudent';
import ClassManager from './components/ClassManager'; 
import ClassDetail from './components/ClassDetail';
import StudentDetail from './components/StudentDetail';
import Login from './components/Login'; // YENİ: Login bileşenini ekledik

function App() {
  // 1. GİRİŞ DURUMU (State)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 2. SAYFA YÜKLENİNCE KONTROL ET
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // 3. GİRİŞ YAPILINCA ÇALIŞACAK FONKSİYON
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // 4. ÇIKIŞ YAPILINCA ÇALIŞACAK FONKSİYON
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // --- EĞER GİRİŞ YAPILMAMIŞSA SADECE LOGIN GÖSTER ---
  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Login onLoginSuccess={handleLogin} />
      </>
    );
  }

  // --- GİRİŞ YAPILMIŞSA SİSTEMİ GÖSTER ---
  return (
    <Router>
      {/* Layout'a çıkış fonksiyonunu gönderiyoruz ki Navbar'da buton koyabilesin */}
      <Layout onLogout={handleLogout}>
        <Routes>
          {/* Ana Sayfa */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Öğrenci Listesi */}
          <Route path="/students" element={<StudentList />} />
          
          {/* Yeni Öğrenci Kaydı */}
          <Route path="/add" element={<AddStudent />} />
          
          {/* Sınıf Yönetimi */}
          <Route path="/create-class" element={<ClassManager />} />
          
          {/* Detay Sayfaları */}
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
      </Layout>
      
      {/* Bildirim Kutusu */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;