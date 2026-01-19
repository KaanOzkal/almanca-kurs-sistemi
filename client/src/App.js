import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- BİLEŞENLER ---
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AddStudent from './components/AddStudent';
import ClassManager from './components/ClassManager'; // <-- YENİ DOSYA BU
import ClassDetail from './components/ClassDetail';
import StudentDetail from './components/StudentDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Ana Sayfa */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Öğrenci Listesi */}
          <Route path="/students" element={<StudentList />} />
          
          {/* Yeni Öğrenci Kaydı */}
          <Route path="/add" element={<AddStudent />} />
          
          {/* Sınıf Yönetimi (Eskiden AddClass idi, şimdi ClassManager oldu) */}
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