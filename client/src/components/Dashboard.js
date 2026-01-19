import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUserGraduate, FaChalkboard, FaMoneyBillWave, FaLiraSign, FaHistory } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalRevenue: 0,    // Toplam Ciro (Alacaklar Dahil)
    collectedRevenue: 0 // Net Gelir (Kasa)
  });
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true); // Yüklenme durumu eklendi

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // DİKKAT: localhost veya 127.0.0.1 YAZMIYORUZ.
      // Sadece /api/... yazıyoruz ki Render'da çalışsın.
      const res = await axios.get('/api/dashboard');
      
      // Gelen veride stats yoksa patlamasın diye kontrol ekliyoruz
      if (res.data) {
          setStats(res.data.stats || { totalStudents: 0, totalClasses: 0, totalRevenue: 0, collectedRevenue: 0 });
          setChartData(res.data.chartData || []);
          setActivities(res.data.activities || []);
      }
      
    } catch (error) { 
        console.error("Dashboard veri hatası:", error);
        // Hata olsa bile kullanıcıya boş dashboard gösterelim, beyaz ekran vermesin.
    } finally {
        setLoading(false);
    }
  };

  // Para formatı için yardımcı fonksiyon (10000 -> 10.000 ₺)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
  };

  if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
            </div>
        </div>
      );
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4 text-secondary">📊 Genel Bakış ve Finans</h2>
      
      {/* İSTATİSTİK KARTLARI (4 ADET) */}
      <div className="row mb-4">
        
        {/* 1. Öğrenci Sayısı */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2 border-0 border-start border-4 border-primary">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Toplam Öğrenci</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats?.totalStudents || 0}</div>
                </div>
                <div className="col-auto">
                  <FaUserGraduate size={30} className="text-gray-300 text-primary opacity-50"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Aktif Sınıflar */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2 border-0 border-start border-4 border-info">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Aktif Sınıflar</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats?.totalClasses || 0}</div>
                </div>
                <div className="col-auto">
                  <FaChalkboard size={30} className="text-gray-300 text-info opacity-50"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TOPLAM CİRO (Beklenen) */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2 border-0 border-start border-4 border-warning">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Toplam Ciro (Sözleşme)</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatCurrency(stats?.totalRevenue)}</div>
                </div>
                <div className="col-auto">
                  <FaMoneyBillWave size={30} className="text-gray-300 text-warning opacity-50"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. NET GELİR (Kasa) */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2 border-0 border-start border-4 border-success">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Net Gelir (Kasa)</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatCurrency(stats?.collectedRevenue)}</div>
                </div>
                <div className="col-auto">
                  <FaLiraSign size={30} className="text-gray-300 text-success opacity-50"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* GRAFİK ALANI */}
        <div className="col-lg-8 mb-4">
            <div className="card shadow border-0" style={{height: '450px'}}>
                <div className="card-header bg-white py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Sınıf Doluluk Oranları</h6>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ogrenci" fill="#4e73df" name="Öğrenci Sayısı" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        
        {/* SON AKTİVİTELER */}
        <div className="col-lg-4 mb-4">
             <div className="card shadow border-0" style={{height: '450px'}}>
                <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-dark">Son İşlemler</h6>
                    <FaHistory className="text-muted"/>
                </div>
                <div className="card-body p-0" style={{overflowY: 'auto'}}>
                    <ul className="list-group list-group-flush">
                        {activities.length > 0 ? (
                            activities.map((act) => (
                                <li key={act._id} className="list-group-item d-flex justify-content-between align-items-start py-3">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>{act.action}</div>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{act.description}</small>
                                    </div>
                                    <span className="badge bg-light text-secondary rounded-pill" style={{fontSize: '0.7rem'}}>
                                        {new Date(act.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-center py-5 text-muted">
                                Henüz kayıtlı işlem yok.
                            </li>
                        )}
                    </ul>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;