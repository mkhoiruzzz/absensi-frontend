import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardUser from './pages/DashboardUser';
import Rekap from './pages/Rekap';
import Login from './pages/Login';
import Capture from './pages/Capture';
import './App.css';

// Gunakan URL dari .env atau fallback ke localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [siswaData, setSiswaData] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user dari localStorage saat app dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch data user & absensi kalau sudah login
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchAbsensi();
    }
  }, [currentUser]);

  // ✅ Ambil semua user (admin)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setSiswaData(res.data);
    } catch (error) {
      console.error('❌ Error fetch users:', error.message);
    }
  };

  // ✅ Ambil semua absensi
  const fetchAbsensi = async () => {
    try {
      const res = await axios.get(`${API_URL}/absensi`);
      setAbsensiData(res.data);
    } catch (error) {
      console.error('❌ Error fetch absensi:', error.message);
    }
  };

  // ✅ Login ke server
  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      const user = res.data.user;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Login gagal');
      return false;
    }
  };

  // ✅ Sign up (daftar user baru)
  const signUp = async (newUser) => {
    try {
      console.log('📤 Mendaftar ke:', `${API_URL}/signup`);
      const res = await axios.post(`${API_URL}/signup`, {
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        nis: newUser.nis || null,
        kelas: newUser.kelas || null,
      });
      alert('Akun berhasil dibuat!');
      return true;
    } catch (error) {
      console.error('SignUp error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Gagal mendaftar');
      return false;
    }
  };

  // ✅ Logout user
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSiswaData([]);
    setAbsensiData([]);
  };

  // ✅ Tambah siswa baru (oleh admin)
  const addSiswa = async (siswa) => {
    try {
      await axios.post(`${API_URL}/signup`, {
        username: siswa.nis,
        password: 'default123',
        name: siswa.name,
        nis: siswa.nis,
        kelas: siswa.kelas,
      });
      fetchUsers();
      return true;
    } catch (error) {
      console.error('Add siswa error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Gagal menambah siswa');
      return false;
    }
  };

  // ✅ Tambah absensi (oleh user)
  const addAbsensi = async (absensi) => {
    try {
      const res = await axios.post(`${API_URL}/absensi`, absensi);
      alert(res.data.message);
      fetchAbsensi();
      return true;
    } catch (error) {
      console.error('Add absensi error:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Gagal menambah absensi');
      return false;
    }
  };

  // Saat masih loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={login}
              currentUser={currentUser}
              onSignUp={signUp}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <Layout currentUser={currentUser} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              currentUser?.role === 'admin' ? (
                <DashboardAdmin
                  siswaData={siswaData}
                  absensiData={absensiData}
                  onAddSiswa={addSiswa}
                />
              ) : (
                <DashboardUser
                  currentUser={currentUser}
                  absensiData={absensiData}
                  onAddAbsensi={addAbsensi}
                />
              )
            }
          />

          <Route
            path="/rekap"
            element={
              <Rekap siswaData={siswaData} absensiData={absensiData} />
            }
          />

          <Route
            path="/capture"
            element={
              <Capture
                currentUser={currentUser}
                onSuccess={() => fetchAbsensi()}
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
