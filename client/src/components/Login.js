import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend'e soruyoruz: "Bu şifre doğru mu?"
      const res = await axios.post('/api/login', { username, password });
      
      // Doğruysa bileti alıp kaydediyoruz
      localStorage.setItem('token', res.data.token);
      window.location.reload(); 
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Giriş Yap</h2>
        
        {error && <div style={{ color: 'white', background: '#ff4d4f', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Kullanıcı Adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '10px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px' }} />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;