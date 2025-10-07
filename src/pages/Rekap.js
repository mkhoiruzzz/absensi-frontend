import React, { useState } from 'react';

const Rekap = ({ siswaData, absensiData }) => {
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  const getKelasList = () => {
    return [...new Set(siswaData.map(siswa => siswa.kelas))];
  };

  const getFilteredAbsensi = () => {
    let filtered = absensiData;

    if (filterTanggal) {
      filtered = filtered.filter(abs => abs.tanggal === filterTanggal);
    }

    if (filterKelas) {
      const siswaIds = siswaData
        .filter(siswa => siswa.kelas === filterKelas)
        .map(siswa => siswa.id);
      filtered = filtered.filter(abs => siswaIds.includes(abs.siswaId));
    }

    return filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };

  const getSiswaById = (id) => {
    return siswaData.find(siswa => siswa.id === id);
  };

  const getAbsensiStats = () => {
    const filtered = getFilteredAbsensi();
    return {
      total: filtered.length,
      hadir: filtered.filter(abs => abs.status === 'hadir').length,
      izin: filtered.filter(abs => abs.status === 'izin').length,
      sakit: filtered.filter(abs => abs.status === 'sakit').length
    };
  };

  const stats = getAbsensiStats();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Rekap Absensi Siswa</h1>
        <p>Laporan dan statistik kehadiran siswa</p>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>🔍 Filter Data</h3>
        <div className="form-inline">
          <div className="form-group">
            <label>Filter Tanggal:</label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Filter Kelas:</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '5px'
              }}
            >
              <option value="">Semua Kelas</option>
              {getKelasList().map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button 
              onClick={() => {
                setFilterTanggal('');
                setFilterKelas('');
              }}
              className="btn btn-warning"
            >
              🔄 Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>📈 Statistik Absensi</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '20px', 
          marginTop: '20px' 
        }}>
          <div style={{ textAlign: 'center', padding: '20px', background: '#e9ecef', borderRadius: '10px' }}>
            <h2 style={{ color: '#495057', margin: 0 }}>{stats.total}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#495057' }}>Total</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#d4edda', borderRadius: '10px' }}>
            <h2 style={{ color: '#155724', margin: 0 }}>{stats.hadir}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#155724' }}>Hadir</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#fff3cd', borderRadius: '10px' }}>
            <h2 style={{ color: '#856404', margin: 0 }}>{stats.izin}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#856404' }}>Izin</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8d7da', borderRadius: '10px' }}>
            <h2 style={{ color: '#721c24', margin: 0 }}>{stats.sakit}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#721c24' }}>Sakit</p>
          </div>
        </div>
      </div>

      {/* Tabel Rekap */}
      <div className="card">
        <h3>📋 Data Absensi Detail</h3>
        
        {getFilteredAbsensi().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <h3>Tidak ada data absensi</h3>
            <p>Coba ubahz filter atau tambahkan data absensi terlebih dahulu</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>NIS</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAbsensi().map((absensi, index) => {
                  const siswa = getSiswaById(absensi.siswaId);
                  return (
                    <tr key={absensi.id}>
                      <td>{index + 1}</td>
                      <td>
                        {new Date(absensi.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td>{siswa?.nis || '-'}</td>
                      <td>{siswa?.name || 'Siswa tidak ditemukan'}</td>
                      <td>{siswa?.kelas || '-'}</td>
                      <td>
                        <span className={`status-badge status-${absensi.status}`}>
                          {absensi.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {absensi.foto ? (
                          <img src={absensi.foto} alt="Absensi" width={40} height={40} style={{ objectFit: 'cover', borderRadius: '6px' }} />
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rekap;