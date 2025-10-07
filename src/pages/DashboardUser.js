import React, { useState, useRef, useEffect } from 'react';
import Webcam from "react-webcam";

const DashboardUser = ({ currentUser, absensiData, onAddAbsensi }) => {
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [message, setMessage] = useState('');
  const [jenisAbsensi, setJenisAbsensi] = useState('masuk');
  const [loading, setLoading] = useState(false);
  const [localAbsensiData, setLocalAbsensiData] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const webcamRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    setLocalAbsensiData(absensiData);
  }, [absensiData]);

  console.log("📊 ABSENSI DATA:", absensiData);
  console.log("📊 LOCAL ABSENSI DATA:", localAbsensiData);
  console.log("👤 CURRENT USER ID:", currentUser?.id);
  console.log("📅 TODAY:", today);

  const hasAbsensiMasukToday = localAbsensiData.some(abs => {
    const isMatch = abs.user_id === currentUser?.id && 
                   abs.tanggal === today && 
                   abs.jenis_absensi === 'masuk';
    console.log("🔍 Check masuk - User:", abs.user_id, "Tanggal:", abs.tanggal, "Jenis:", abs.jenis_absensi, "Match:", isMatch);
    return isMatch;
  });

  const hasAbsensiPulangToday = localAbsensiData.some(abs => {
    const isMatch = abs.user_id === currentUser?.id && 
                   abs.tanggal === today && 
                   abs.jenis_absensi === 'pulang';
    console.log("🔍 Check pulang - User:", abs.user_id, "Tanggal:", abs.tanggal, "Jenis:", abs.jenis_absensi, "Match:", isMatch);
    return isMatch;
  });

  const todayAbsensiMasuk = localAbsensiData.find(
    abs => abs.user_id === currentUser?.id && abs.tanggal === today && abs.jenis_absensi === 'masuk'
  );

  const todayAbsensiPulang = localAbsensiData.find(
    abs => abs.user_id === currentUser?.id && abs.tanggal === today && abs.jenis_absensi === 'pulang'
  );

  console.log("✅ HAS MASUK:", hasAbsensiMasukToday, "DATA:", todayAbsensiMasuk);
  console.log("✅ HAS PULANG:", hasAbsensiPulangToday, "DATA:", todayAbsensiPulang);

  // 📍 Fungsi untuk mendapatkan lokasi
  const getLocation = () => {
    setGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setGettingLocation(false);
        console.log("📍 Lokasi berhasil didapat:", latitude, longitude);
      },
      (error) => {
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request lokasi timeout.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat mengambil lokasi.';
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
        console.error("❌ Error lokasi:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 📸 Buka kamera dan ambil lokasi
  const openCamera = () => {
    setShowCamera(true);
    getLocation();
  };

  // 📸 Ambil foto dari kamera
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFoto(imageSrc);
    setShowCamera(false);
  };

  const handleAbsensi = async (status) => {
    if (loading) return;
    
    // Validasi lokasi
    if (!location) {
      alert("⚠️ Lokasi belum didapatkan. Mohon tunggu atau coba buka kamera lagi.");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("📤 Mengirim absensi:", { 
        user_id: currentUser.id, 
        status, 
        jenisAbsensi,
        hasFoto: !!foto,
        location 
      });

      const absensiPayload = {
        user_id: currentUser.id,
        status,
        keterangan: keterangan || null,
        foto: foto || null,
        jenis_absensi: jenisAbsensi,
        latitude: location.latitude,
        longitude: location.longitude
      };

      console.log("📤 Data yang dikirim:", absensiPayload);

      const response = await fetch("http://localhost:5001/absensi", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(absensiPayload),
      });

      const data = await response.json();
      
      console.log("📥 Response dari server:", data);

      if (response.ok) {
        alert("✅ " + data.message);
        // Reset form setelah berhasil
        setKeterangan('');
        setFoto(null);
        setLocation(null);
        
        // Tambahkan data baru ke local state untuk immediate update
        const newAbsensi = {
          id: data.id || Date.now(),
          user_id: currentUser.id,
          status,
          keterangan: keterangan || null,
          foto: foto || null,
          tanggal: today,
          jenis_absensi: jenisAbsensi,
          latitude: location.latitude,
          longitude: location.longitude,
          created_at: new Date().toISOString()
        };
        
        setLocalAbsensiData(prev => [newAbsensi, ...prev]);
        
        // Refresh data dari parent setelah 1 detik
        setTimeout(() => {
          if (onAddAbsensi) {
            onAddAbsensi(newAbsensi);
          }
        }, 1000);
        
      } else {
        alert("❌ Gagal absen: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Terjadi kesalahan saat mengirim absensi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecentAbsensi = () => {
    const userAbsensi = localAbsensiData.filter(abs => abs.user_id === currentUser?.id);
    console.log("📋 User absensi:", userAbsensi);
    
    return userAbsensi
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 7);
  };

  // Fungsi untuk menentukan apakah tombol absensi harus disabled
  const isAbsensiDisabled = () => {
    if (loading) return true;
    if (!location) return true; // Disable jika lokasi belum didapat
    if (jenisAbsensi === 'pulang' && !hasAbsensiMasukToday) return true;
    return false;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👋 Selamat Datang, {currentUser?.name}!</h1>
        <p>NIS: {currentUser?.nis} | Kelas: {currentUser?.kelas}</p>
        <p>📅 {todayFormatted}</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="dashboard-content">
        {/* Form Absensi */}
        <div className="card">
          <h3>✏️ Absensi Hari Ini</h3>
          
          {/* Tampilkan form jika belum absen untuk jenis yang dipilih */}
          {!hasAbsensiMasukToday || !hasAbsensiPulangToday ? (
            <div>
              {/* Kolom Masuk dan Pulang */}
              <div className="form-group">
                <label>Jenis Absensi:</label>
                <div className="absensi-type-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setJenisAbsensi('masuk')}
                    className={`btn ${jenisAbsensi === 'masuk' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ 
                      flex: 1, 
                      padding: '10px',
                      border: jenisAbsensi === 'masuk' ? '2px solid #007bff' : '1px solid #ddd',
                      backgroundColor: jenisAbsensi === 'masuk' ? '#007bff' : 'white',
                      color: jenisAbsensi === 'masuk' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: (loading || hasAbsensiMasukToday) ? 'not-allowed' : 'pointer',
                      opacity: (loading || hasAbsensiMasukToday) ? 0.6 : 1
                    }}
                    disabled={loading || hasAbsensiMasukToday}
                  >
                    🏠 Masuk {hasAbsensiMasukToday && '✓'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setJenisAbsensi('pulang')}
                    className={`btn ${jenisAbsensi === 'pulang' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ 
                      flex: 1, 
                      padding: '10px',
                      border: jenisAbsensi === 'pulang' ? '2px solid #007bff' : '1px solid #ddd',
                      backgroundColor: jenisAbsensi === 'pulang' ? '#007bff' : 'white',
                      color: jenisAbsensi === 'pulang' ? 'white' : '#333',
                      borderRadius: '5px',
                      cursor: (loading || !hasAbsensiMasukToday || hasAbsensiPulangToday) ? 'not-allowed' : 'pointer',
                      opacity: (loading || !hasAbsensiMasukToday || hasAbsensiPulangToday) ? 0.6 : 1
                    }}
                    disabled={loading || !hasAbsensiMasukToday || hasAbsensiPulangToday}
                  >
                    🏠 Pulang {hasAbsensiPulangToday && '✓'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {jenisAbsensi === 'pulang' && !hasAbsensiMasukToday && (
                    <span style={{ color: '#dc3545' }}>
                      ⚠️ Anda harus absen masuk terlebih dahulu sebelum absen pulang
                    </span>
                  )}
                  {jenisAbsensi === 'pulang' && hasAbsensiPulangToday && (
                    <span style={{ color: '#28a745' }}>
                      ✅ Anda sudah absen pulang hari ini
                    </span>
                  )}
                </div>
              </div>

              {/* Info Lokasi */}
              {location && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#d4edda', 
                  border: '1px solid #c3e6cb',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  <strong>📍 Lokasi Terdeteksi:</strong>
                  <br />
                  Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                </div>
              )}

              {locationError && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#f8d7da', 
                  border: '1px solid #f5c6cb',
                  borderRadius: '5px',
                  fontSize: '14px',
                  color: '#721c24'
                }}>
                  <strong>⚠️ Error Lokasi:</strong>
                  <br />
                  {locationError}
                </div>
              )}

              {gettingLocation && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#d1ecf1', 
                  border: '1px solid #bee5eb',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  📍 Mengambil lokasi...
                </div>
              )}

              {/* Kamera */}
              <div className="form-group">
                {!foto && !showCamera && (
                  <button 
                    onClick={openCamera} 
                    style={{ marginTop: '10px', background: 'blue', color: 'white', padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                    disabled={loading}
                  >
                    📷 Buka Kamera & Ambil Lokasi
                  </button>
                )}

                {showCamera && (
                  <div style={{ marginTop: '10px' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={250}
                      videoConstraints={{ facingMode: "user" }}
                    />
                    <br />
                    <button 
                      onClick={capturePhoto} 
                      style={{ marginTop: '10px', background: 'green', color: 'white', padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      📸 Ambil Foto
                    </button>
                  </div>
                )}

                {foto && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={foto} alt="Preview" width={120} height={120} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                    <br />
                    <button 
                      onClick={() => {
                        setFoto(null);
                        setLocation(null);
                      }} 
                      style={{ marginTop: '10px', background: 'gray', color: 'white', padding: '6px 12px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      🔄 Ulangi Foto & Lokasi
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol Absensi */}
              <div className="absensi-buttons" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => handleAbsensi('hadir')} 
                  className="btn btn-success"
                  disabled={isAbsensiDisabled()}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '5px', 
                    border: 'none', 
                    cursor: isAbsensiDisabled() ? 'not-allowed' : 'pointer',
                    opacity: isAbsensiDisabled() ? 0.6 : 1,
                    backgroundColor: '#28a745',
                    color: 'white'
                  }}
                >
                  {loading ? '⏳ Mengirim...' : '✅ HADIR'}
                </button>
                <button 
                  onClick={() => handleAbsensi('izin')} 
                  className="btn btn-warning"
                  disabled={isAbsensiDisabled()}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '5px', 
                    border: 'none', 
                    cursor: isAbsensiDisabled() ? 'not-allowed' : 'pointer',
                    opacity: isAbsensiDisabled() ? 0.6 : 1,
                    backgroundColor: '#ffc107',
                    color: '#212529'
                  }}
                >
                  {loading ? '⏳ Mengirim...' : '📝 IZIN'}
                </button>
                <button 
                  onClick={() => handleAbsensi('sakit')} 
                  className="btn btn-danger"
                  disabled={isAbsensiDisabled()}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '5px', 
                    border: 'none', 
                    cursor: isAbsensiDisabled() ? 'not-allowed' : 'pointer',
                    opacity: isAbsensiDisabled() ? 0.6 : 1,
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}
                >
                  {loading ? '⏳ Mengirim...' : '🤒 SAKIT'}
                </button>
              </div>             
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h2>✅ Absensi Hari Ini Selesai</h2>
              <p>Anda sudah melakukan absensi masuk dan pulang hari ini.</p>
            </div>
          )}
        </div>

        {/* Riwayat Absensi */}
        <div className="card">
          <h3>📋 Riwayat Absensi (7 Hari Terakhir)</h3>
          {getRecentAbsensi().length > 0 ? (
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Jenis</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Foto</th>
                </tr>
              </thead>
              <tbody>
                {getRecentAbsensi().map((abs, index) => (
                  <tr key={abs.id || index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {new Date(abs.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: abs.jenis_absensi === 'masuk' ? '#007bff' : '#6c757d',
                        color: 'white'
                      }}>
                        {abs.jenis_absensi?.toUpperCase() || 'MASUK'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: 
                          abs.status === 'hadir' ? '#28a745' : 
                          abs.status === 'izin' ? '#ffc107' : '#dc3545',
                        color: abs.status === 'izin' ? '#212529' : 'white'
                      }}>
                        {abs.status?.toUpperCase() || 'HADIR'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {abs.foto ? (
                        <img src={abs.foto} alt="Absensi" width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Tidak ada riwayat absensi
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;