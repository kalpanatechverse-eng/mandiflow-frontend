import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const BACKEND_URL = "https://mandiflow-backend.onrender.com"; // <-- Unga Render URL-ah inga paste pannunga

export default function App() {
  const [commodity, setCommodity] = useState("Paddy");
  const [bags, setBags] = useState(50);
  const [khasra, setKhasra] = useState("KH-8821/A");
  const [farmerName, setFarmerName] = useState("Gurpreet Singh Gill");
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const verifyLand = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-land`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ khasra_no: khasra, commodity })
      });
      const data = await res.json();
      setQuotaInfo(data);
    } catch (err) {
      setError("Failed to connect to backend server.");
    }
    setLoading(false);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/book-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: farmerName,
          phone: "9876543210",
          aadhaar_id: "UIDAI-TOKEN-OK",
          khasra_no: khasra,
          commodity,
          quantity_bags: Number(bags)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Booking failed");
      setPass(data);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <header style={{ backgroundColor: '#064e3b', color: 'white', padding: '16px 24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>🌾 MandiFlow Prototype</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '14px' }}>Smart Queue & Dynamic Quota Management</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Booking Form */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a' }}>1. Slot Booking & Quota Check</h2>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Farmer Name</label>
            <input value={farmerName} onChange={e => setFarmerName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Khasra / Land Record No.</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={khasra} onChange={e => setKhasra(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <button onClick={verifyLand} style={{ backgroundColor: '#065f46', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? "Checking..." : "Verify Land"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Crop Commodity</label>
            <select value={commodity} onChange={e => { setCommodity(e.target.value); setQuotaInfo(null); }} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="Paddy">Paddy (Cap: 100 bags/acre)</option>
              <option value="Wheat">Wheat (Cap: 60 bags/acre)</option>
              <option value="Mustard">Mustard (Cap: 24 bags/acre)</option>
              <option value="Groundnut">Groundnut (Cap: 36 bags/acre)</option>
            </select>
          </div>

          {quotaInfo && (
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 'bold', fontSize: '14px' }}>
                <ShieldCheck size={18} /> Verified: {quotaInfo.certified_acres} Certified Acres
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#047857' }}>
                Max allowable yield for {commodity}: <strong>{quotaInfo.max_bags} Bags</strong>
              </p>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Number of Bags (50kg each)</label>
            <input type="number" value={bags} onChange={e => setBags(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '4px', color: '#991b1b', marginBottom: '12px', fontSize: '13px' }}>
              <AlertTriangle size={16} style={{ display: 'inline', marginRight: '4px' }} /> {error}
            </div>
          )}

          <button onClick={handleBooking} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm & Issue Transit Pass
          </button>

          {pass && (
            <div style={{ marginTop: '16px', backgroundColor: '#f0fdf4', border: '2px dashed #22c55e', padding: '16px', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 8px', color: '#15803d', fontSize: '16px' }}>✓ Transit Pass Generated</h3>
              <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Token ID:</strong> {pass.token_id}</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Window:</strong> {pass.arrival_window}</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Produce:</strong> {pass.quantity_bags} Bags ({pass.commodity})</p>
            </div>
          )}
        </div>

        {/* Database Roster */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>2. Live Database Roster (Supabase)</h2>
            <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #cbd5e1', background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>Token</th>
                  <th style={{ padding: '8px' }}>Farmer</th>
                  <th style={{ padding: '8px' }}>Crop</th>
                  <th style={{ padding: '8px' }}>Bags</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No bookings found in database.</td></tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{b.token_id}</td>
                      <td style={{ padding: '8px' }}>{b.farmer_name}</td>
                      <td style={{ padding: '8px' }}>{b.commodity}</td>
                      <td style={{ padding: '8px' }}>{b.quantity_bags}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
