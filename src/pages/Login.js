import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const Login = ({ onLogin, currentUser, onSignUp }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    username: '',
    password: '',
    name: '',
    nis: '',
    kelas: ''
  });

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error saat user mengetik
  };

  const handleSignUpChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await onLogin(formData.username, formData.password);
    
    if (success) {
      setError('');
    } else {
      setError('❌ Username atau password salah!');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasi input
    if (!signUpData.username || !signUpData.password || !signUpData.name) {
      setError('❌ Username, password, dan nama wajib diisi!');
      setLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('❌ Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    // Panggil fungsi onSignUp dari App.js
    const result = await onSignUp(signUpData);
    
    if (result) {
      setSuccess('✅ Akun berhasil dibuat! Silakan login.');
      setError('');
      
      // Reset form dan kembali ke login setelah 2 detik
      setTimeout(() => {
        setIsSignUp(false);
        setFormData({ 
          username: signUpData.username, 
          password: signUpData.password 
        });
        setSignUpData({
          username: '',
          password: '',
          name: '',
          nis: '',
          kelas: ''
        });
        setSuccess('');
      }, 2000);
    } else {
      // Error sudah di-handle di App.js (alert)
      setError('❌ Gagal membuat akun. Username mungkin sudah terdaftar.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      {!isSignUp ? (
        // ========== FORM LOGIN ==========
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>🔐 Login Sistem Absensi</h2>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Masukkan username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Masukkan password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Loading...' : '🚀 Login'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Belum punya akun?
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccess('');
              }}
              style={{ 
                color: '#007bff', 
                textDecoration: 'underline', 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                font: 'inherit', 
                cursor: 'pointer' 
              }}
            >
              📝 Daftar Sekarang
            </button>
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <strong></strong>
            <div style={{ marginTop: '8px' }}>
              <div> <code></code><code></code></div>
              <div><code></code><code></code></div>
            </div>
          </div>
        </form>
      ) : (
        // ========== FORM SIGN UP ==========
        <form className="login-form" onSubmit={handleSignUp}>
          <h2>📝 Daftar Akun Baru</h2>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Username: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="username"
              value={signUpData.username}
              onChange={handleSignUpChange}
              required
              placeholder="Masukkan Username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="password"
              name="password"
              value={signUpData.password}
              onChange={handleSignUpChange}
              required
              placeholder="Masukkan Password"
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Nama Lengkap: <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="name"
              value={signUpData.name}
              onChange={handleSignUpChange}
              required
              placeholder="Contoh: Muhammaad Khoiruz Zaman"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>NIS</label>
            <input
              type="text"
              name="nis"
              value={signUpData.nis}
              onChange={handleSignUpChange}
              placeholder="Contoh: 2024001"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Kelas</label>
            <input
              type="text"
              name="kelas"
              value={signUpData.kelas}
              onChange={handleSignUpChange}
              placeholder="Contoh: XII RPL 2"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? '⏳ Mendaftar...' : '✅ Daftar'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccess('');
              }}
              disabled={loading}
              style={{ 
                color: '#007bff', 
                textDecoration: 'underline', 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                font: 'inherit', 
                cursor: 'pointer' 
                }}
            >
               ← Kembali ke Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;