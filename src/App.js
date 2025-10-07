import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardUser from './pages/DashboardUser';
import Rekap from './pages/Rekap';
import Login from './pages/Login';
import Capture from './pages/Capture';
import './App.css';

const API_URL = 'http://localhost:5001';

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

  // Fetch users (siswa) data
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchAbsensi();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setSiswaData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAbsensi = async () => {
    try {
      const response = await fetch(`${API_URL}/absensi`);
      const data = await response.json();
      setAbsensiData(data);
    } catch (error) {
      console.error('Error fetching absensi:', error);
    }
  };

  // Login dengan API
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // SignUp dengan API
const signUp = async (newUser) => {
  try {
    console.log('Mengirim request signup ke:', `${API_URL}/signup`);
    console.log('Data yang dikirim:', {
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      nis: newUser.nis || null,
      kelas: newUser.kelas || null
    });

    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUser.username,
        password: newUser.password,
        name: newUser.name,
        nis: newUser.nis || null,
        kelas: newUser.kelas || null
      })
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      alert('Akun berhasil dibuat!');
      return true;
    } else {
      alert('Error: ' + data.error);
      return false;
    }
  } catch (error) {
    console.error('SignUp error:', error);
    console.error('Error detail:', error.message);
    alert('Gagal mendaftar. Error: ' + error.message);
    return false;
  }
};

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSiswaData([]);
    setAbsensiData([]);
  };

  const addSiswa = async (siswa) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: siswa.nis, // gunakan NIS sebagai username
          password: 'default123', // password default
          name: siswa.name,
          nis: siswa.nis,
          kelas: siswa.kelas
        })
      });

      if (response.ok) {
        fetchUsers(); // refresh data
        return true;
      } else {
        const data = await response.json();
        alert(data.error);
        return false;
      }
    } catch (error) {
      console.error('Add siswa error:', error);
      alert('Gagal menambah siswa');
      return false;
    }
  };

  const addAbsensi = async (absensi) => {
    try {
      const response = await fetch(`${API_URL}/absensi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(absensi)
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchAbsensi(); // refresh data absensi
        return true;
      } else {
        alert(data.error);
        return false;
      }
    } catch (error) {
      console.error('Add absensi error:', error);
      alert('Gagal menambah absensi');
      return false;
    }
  };

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
              <Rekap 
                siswaData={siswaData}
                absensiData={absensiData}
              />
            } 
          />

          <Route 
            path="/capture" 
            element={
              <Capture 
                currentUser={currentUser} 
                onSuccess={(payload) => {
                  fetchAbsensi(); // refresh absensi setelah capture
                }}
              />
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}


export default App;