import React, { useState, useEffect } from 'react'; // State ve Effect ekledik
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

// --- YENİ EKLENEN: Login Bileşeni ---
import Login from './components/Login';

function App() {
  // 1. KONTROL: Başlangıçta cebimizde bilet (Token) var mı bakıyoruz.
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Çıkış yapma fonksiyonu (Bunu Layout'a gönderebiliriz)
  const handleLogout = () => {
    localStorage.removeItem('token'); // Bileti yırt
    setToken(null); // State'i boşalt
    window.location.href = '/'; // Ana sayfaya at (Login ekranı gelir)
  };

  // 2. MANTIK: Eğer Token YOKSA, siteyi gösterme, sadece Login ekranını göster.
  if (!token) {
    return <Login />;
  }

  // 3. EĞER TOKEN VARSA: Asıl siteyi göster 
  return (
    <Router>
      {/* Layout'a onLogout özelliğini gönderiyoruz ki oraya çıkış butonu koyabilesin */}
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