// src/pages/Capture.js
import React, { useState, useEffect } from "react";

export default function Capture({ currentUser, onSuccess }) {
  const [status, setStatus] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [foto, setFoto] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung browser Anda");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => setError("Harap aktifkan lokasi untuk capture absensi")
    );
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return alert("Status wajib diisi");
    if (!userLocation) return alert("Lokasi belum tersedia");
    if (!currentUser?.id) return alert("User tidak terdeteksi, silakan login kembali");

    const payload = {
      user_id: currentUser.id,
      status,
      keterangan: keterangan || "-",
      foto,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    try {
      setSending(true);
      const res = await fetch("http://localhost:5000/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Absensi berhasil dikirim!");
        onSuccess(payload); // update UI
        setStatus("");
        setKeterangan("");
        setFoto("");
      } else {
        alert("Gagal: " + (data.error || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim absensi.");
    } finally {
      setSending(false);
    }
  };

  if (error) return <div className="card">{error}</div>;
  if (!userLocation) return <div className="card">Meminta izin lokasi...</div>;

  return (
    <div className="card" style={{ maxWidth: 720, margin: "20px auto" }}>
      <h2>Absen {currentUser?.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">Pilih status</option>
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
          </select>
        </div>

        <div className="form-group">
          <label>Keterangan (opsional):</label>
          <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Foto (opsional):</label>
          <input type="file" accept="image/*" onChange={handleFotoChange} />
        </div>

        <button type="submit" disabled={sending}>{sending ? "Mengirim..." : "Kirim Absensi"}</button>
      </form>

      {foto && <div style={{ marginTop: 12 }}><img src={foto} alt="Preview" style={{ width: "100%", borderRadius: 6 }} /></div>}

      <div style={{ marginTop: 12 }}>
        <p><strong>Lokasi:</strong></p>
        <p>Latitude: {userLocation.latitude}</p>
        <p>Longitude: {userLocation.longitude}</p>
      </div>
    </div>
  );
}
