import React, { useState, useEffect } from 'react';

const DashboardAdmin = ({ siswaData, onAddSiswa }) => {
  const [formSiswa, setFormSiswa] = useState({
    name: '',
    nis: '',
    kelas: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [modalFoto, setModalFoto] = useState(null);
  const [absensiData, setAbsensiData] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'xii-rpl1', 'xii-rpl2', 'xii-rpl3'

  useEffect(() => {
    fetch("http://localhost:5001/absensi")
      .then(res => res.json())
      .then(data => setAbsensiData(data))
      .catch(err => console.error("Gagal fetch absensi:", err));
  }, []);

  const handleInputChange = (e) => {
    setFormSiswa({
      ...formSiswa,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSiswa(formSiswa);
    setFormSiswa({ name: '', nis: '', kelas: '' });
    setShowForm(false);
    setMessage('Siswa berhasil ditambahkan!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Filter siswa berdasarkan kelas yang aktif
  const getFilteredSiswa = () => {
    switch (activeTab) {
      case 'xii-rpl1':
        return siswaData.filter(siswa => siswa.kelas === 'XII RPL 1');
      case 'xii-rpl2':
        return siswaData.filter(siswa => siswa.kelas === 'XII RPL 2');
      case 'xii-rpl3':
        return siswaData.filter(siswa => siswa.kelas === 'XII RPL 3');
      default:
        return siswaData;
    }
  };

  // Filter absensi berdasarkan kelas yang aktif
  const getFilteredAbsensi = () => {
    switch (activeTab) {
      case 'xii-rpl1':
        return absensiData.filter(abs => abs.kelas === 'XII RPL 1');
      case 'xii-rpl2':
        return absensiData.filter(abs => abs.kelas === 'XII RPL 2');
      case 'xii-rpl3':
        return absensiData.filter(abs => abs.kelas === 'XII RPL 3');
      default:
        return absensiData;
    }
  };

  const getAbsensiToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return getFilteredAbsensi().filter(abs => abs.tanggal === today);
  };

  const getStatusCount = (status) => {
    return getAbsensiToday().filter(abs => abs.status === status).length;
  };

  const filteredSiswa = getFilteredSiswa();
  const filteredAbsensi = getFilteredAbsensi();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👨‍💼 Dashboard Admin</h1>
        <p>Kelola data siswa dan pantau absensi harian</p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <div className="tabs" style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e9ecef' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`tab-btn ${activeTab === 'all' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'all' ? '#007bff' : 'transparent',
              color: activeTab === 'all' ? 'white' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Semua Kelas
          </button>
          <button
            onClick={() => setActiveTab('xii-rpl1')}
            className={`tab-btn ${activeTab === 'xii-rpl1' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'xii-rpl1' ? '#28a745' : 'transparent',
              color: activeTab === 'xii-rpl1' ? 'white' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            👥 XII RPL 1
          </button>
          <button
            onClick={() => setActiveTab('xii-rpl2')}
            className={`tab-btn ${activeTab === 'xii-rpl2' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'xii-rpl2' ? '#ffc107' : 'transparent',
              color: activeTab === 'xii-rpl2' ? '#212529' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            👥 XII RPL 2
          </button>
          <button
            onClick={() => setActiveTab('xii-rpl3')}
            className={`tab-btn ${activeTab === 'xii-rpl3' ? 'tab-active' : ''}`}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'xii-rpl3' ? '#dc3545' : 'transparent',
              color: activeTab === 'xii-rpl3' ? 'white' : '#666',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            👥 XII RPL 3
          </button>
        </div>
      </div>

      {/* Statistik Absensi Hari Ini */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>📈 Statistik Absensi Hari Ini - {getTabTitle()}</h3>
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#28a745', color: 'white', borderRadius: '8px', flex: 1 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{getStatusCount('hadir')}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>✅ Hadir</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#ffc107', color: '#212529', borderRadius: '8px', flex: 1 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{getStatusCount('izin')}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>📝 Izin</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#dc3545', color: 'white', borderRadius: '8px', flex: 1 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{getStatusCount('sakit')}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>🤒 Sakit</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#6c757d', color: 'white', borderRadius: '8px', flex: 1 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{filteredSiswa.length - getAbsensiToday().length}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>❌ Belum Absen</p>
          </div>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="card">
        <h3>👥 Daftar Siswa {getTabTitle()} ({filteredSiswa.length} siswa)</h3>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ marginBottom: '20px' }}
        >
          {showForm ? '❌ Batal' : '➕ Tambah Siswa'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
            <div className="form-inline">
              <div className="form-group">
                <label>Nama Lengkap:</label>
                <input
                  type="text"
                  name="name"
                  value={formSiswa.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                />
              </div>
              <div className="form-group">
                <label>NIS:</label>
                <input
                  type="text"
                  name="nis"
                  value={formSiswa.nis}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: 2024001"
                />
              </div>
              <div className="form-group">
                <label>Kelas:</label>
                <select
                  name="kelas"
                  value={formSiswa.kelas}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ffffffff' }}
                >
                  <option value="">Pilih Kelas</option>
                  <option value="XII RPL 1">XII RPL 1</option>
                  <option value="XII RPL 2">XII RPL 2</option>
                  <option value="XII RPL 3">XII RPL 3</option>
                </select>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success">
                  💾 Simpan
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Status Hari Ini</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((siswa, index) => {
                const absensiHariIni = getAbsensiToday().find(abs => abs.user_id === siswa.id);
                return (
                  <tr key={siswa.id}>
                    <td>{index + 1}</td>
                    <td>{siswa.nis}</td>
                    <td>{siswa.name}</td>
                    <td>{siswa.kelas}</td>
                    <td>
                      {absensiHariIni ? (
                        <span className={`status-badge status-${absensiHariIni.status}`}>
                          {absensiHariIni.status.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>BELUM ABSEN</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Absensi Semua Siswa */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3>📋 Daftar Absensi Siswa {getTabTitle()}</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Jenis</th>
                <th>Status</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsensi.map((abs, index) => (
                <tr key={abs.id || index}>
                  <td>{index + 1}</td>
                  <td>{new Date(abs.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{abs.nis}</td>
                  <td>{abs.name}</td>
                  <td>{abs.kelas}</td>
                  <td>
                    <span className={`badge ${abs.jenis_absensi === 'masuk' ? 'badge-primary' : 'badge-secondary'}`}>
                      {abs.jenis_absensi?.toUpperCase() || 'MASUK'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${abs.status}`}>
                      {abs.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {abs.foto ? (
                      <img 
                        src={abs.foto} 
                        alt="Absensi" 
                        width={40} 
                        height={40} 
                        style={{ cursor: 'pointer', borderRadius: '4px' }}
                        onClick={() => setModalFoto(abs.foto)}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAbsensi.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Tidak ada data absensi untuk {getTabTitle()}
            </div>
          )}
        </div>
      </div>

      {/* Modal Foto */}
      {modalFoto && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setModalFoto(null)}
        >
          <img 
            src={modalFoto} 
            alt="Foto Absensi" 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              borderRadius: '12px', 
              boxShadow: '0 0 20px #000',
              border: '3px solid white'
            }} 
          />
        </div>
      )}
    </div>
  );

  // Helper function untuk mendapatkan judul tab
  function getTabTitle() {
    switch (activeTab) {
      case 'xii-rpl1':
        return '(XII RPL 1)';
      case 'xii-rpl2':
        return '(XII RPL 2)';
      case 'xii-rpl3':
        return '(XII RPL 3)';
      default:
        return '(Semua Kelas)';
    }
  }
};

export default DashboardAdmin;