import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUserGraduate, FaChalkboard, FaMoneyBillWave, FaLiraSign, FaHistory } from 'react-icons/fa';

const Dashboard = () => {
  // Başlangıç değerlerini GARANTİ array [] yapıyoruz
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalRevenue: 0,
    collectedRevenue: 0
  });
  const [chartData, setChartData] = useState([]); // Başlangıç boş liste
  const [activities, setActivities] = useState([]); // Başlangıç boş liste
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      
      if (res.data) {
          // Gelen veriyi kontrol et, eğer liste değilse boş liste ata (Crash önleyici)
          setStats(res.data.stats || {});
          
          setChartData(Array.isArray(res.data.chartData) ? res.data.chartData : []);
          
          setActivities(Array.isArray(res.data.activities) ? res.data.activities : []);
      }
      
    } catch (error) { 
        console.error("Dashboard veri hatası:", error);
    } finally {
        setLoading(false);
    }
  };

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
      
      {/* İSTATİSTİK KARTLARI */}
      <div className="row mb-4">
        {/* Kartlar buraya aynen geliyor, stats?. ile korumalı */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2 border-0 border-start border-4 border-primary">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Toplam Öğrenci</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats?.totalStudents || 0}</div>
                </div>
                <div className="col-auto"><FaUserGraduate size={30} className="text-gray-300 text-primary opacity-50"/></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2 border-0 border-start border-4 border-info">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Aktif Sınıflar</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats?.totalClasses || 0}</div>
                </div>
                <div className="col-auto"><FaChalkboard size={30} className="text-gray-300 text-info opacity-50"/></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2 border-0 border-start border-4 border-warning">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Toplam Ciro</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatCurrency(stats?.totalRevenue)}</div>
                </div>
                <div className="col-auto"><FaMoneyBillWave size={30} className="text-gray-300 text-warning opacity-50"/></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2 border-0 border-start border-4 border-success">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Net Gelir</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{formatCurrency(stats?.collectedRevenue)}</div>
                </div>
                <div className="col-auto"><FaLiraSign size={30} className="text-gray-300 text-success opacity-50"/></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* GRAFİK ALANI - Data Array Kontrolü */}
        <div className="col-lg-8 mb-4">
            <div className="card shadow border-0" style={{height: '450px'}}>
                <div className="card-header bg-white py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Sınıf Doluluk Oranları</h6>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* KORUMA: chartData bir Array ise grafiği çiz, değilse boş dizi ver */}
                        <BarChart data={Array.isArray(chartData) ? chartData : []}>
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
        
        {/* SON AKTİVİTELER - Map Kontrolü */}
        <div className="col-lg-4 mb-4">
             <div className="card shadow border-0" style={{height: '450px'}}>
                <div className="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                    <h6 className="m-0 font-weight-bold text-dark">Son İşlemler</h6>
                    <FaHistory className="text-muted"/>
                </div>
                <div className="card-body p-0" style={{overflowY: 'auto'}}>
                    <ul className="list-group list-group-flush">
                        {/* KORUMA: activities bir Array mi ve dolu mu? */}
                        {Array.isArray(activities) && activities.length > 0 ? (
                            activities.map((act, index) => (
                                <li key={act._id || index} className="list-group-item d-flex justify-content-between align-items-start py-3">
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>{act.action}</div>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{act.description}</small>
                                    </div>
                                    <span className="badge bg-light text-secondary rounded-pill" style={{fontSize: '0.7rem'}}>
                                        {act.date ? new Date(act.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : ''}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-center py-5 text-muted">
                                Henüz kayıtlı işlem yok veya veri alınamadı.
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