import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

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

  // Direct hardcoded Render URL (No variables, no concatenation bugs)
  const verifyLand = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://mandiflow-backend.onrender.com/api/verify-land", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ khasra_no: khasra, commodity: commodity })
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setQuotaInfo(data);
    } catch (err) {
      setError("Failed to connect to backend server: " + err.message);
    }
    setLoading(false);
  };

  const bookSlot = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://mandiflow-backend.onrender.com/api/book-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: farmerName,
          phone: "9876543210",
          aadhaar_id: "XXXX-XXXX-1234",
          khasra_no: khasra,
          commodity: commodity,
          quantity_bags: parseInt(bags)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Booking failed");
      setPass(data);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("https://mandiflow-backend.onrender.com/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: 'auto', background: '#f4f6f8', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #2d6a4f', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ color: '#1b4332', margin: 0 }}>🌾 MandiFlow Prototype</h1>
        <p style={{ color: '#555', margin: '5px 0 0 0' }}>Dynamic Quota Management & Transit Pass Engine</p>
      </header>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', color: '#2d6a4f', marginTop: 0 }}>1. Slot Booking & Quota Check</h2>
          
          <label style={{ display: 'block', margin: '10px 0 5px', fontWeight: 'bold' }}>Farmer Name</label>
          <input 
            type="text" 
            value={farmerName} 
            onChange={(e) => setFarmerName(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', margin: '10px 0 5px', fontWeight: 'bold' }}>Khasra / Land Record No.</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={khasra} 
              onChange={(e) => setKhasra(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <button 
              onClick={verifyLand} 
              disabled={loading}
              style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}
            >
              {loading ? "Checking..." : "Verify Land"}
            </button>
          </div>

          <label style={{ display: 'block', margin: '10px 0 5px', fontWeight: 'bold' }}>Commodity</label>
          <select 
            value={commodity} 
            onChange={(e) => setCommodity(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Paddy">Paddy (100 bags/acre)</option>
            <option value="Maize">Maize (90 bags/acre)</option>
            <option value="Wheat">Wheat (60 bags/acre)</option>
            <option value="Groundnut">Groundnut (36 bags/acre)</option>
            <option value="Cotton">Cotton (30 bags/acre)</option>
            <option value="Chana">Chana (24 bags/acre)</option>
            <option value="Mustard">Mustard (24 bags/acre)</option>
          </select>

          {quotaInfo && (
            <div style={{ background: '#e8f5e9', borderLeft: '4px solid #2e7d32', padding: '12px', marginTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2e7d32', fontWeight: 'bold' }}>
                <ShieldCheck size={18} /> Land Verified via State Registry
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                Owner: <strong>{quotaInfo.farmer_name}</strong> | Certified Area: <strong>{quotaInfo.certified_acres} Acres</strong>
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '14px' }}>
                Max Allowed Quota: <strong>{quotaInfo.max_bags} Bags</strong> ({quotaInfo.commodity})
              </p>
            </div>
          )}

          <label style={{ display: 'block', margin: '15px 0 5px', fontWeight: 'bold' }}>Quantity to Bring (Bags - 50kg each)</label>
          <input 
            type="number" 
            value={bags} 
            onChange={(e) => setBags(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />

          <button 
            onClick={bookSlot} 
            disabled={loading}
            style={{ width: '100%', marginTop: '20px', background: '#1b4332', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Confirm & Issue Transit Pass
          </button>

          {pass && (
            <div style={{ marginTop: '20px', padding: '15px', border: '2px dashed #1b4332', background: '#fafafa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1b4332' }}>🎟️ Official Transit Pass (Pauti)</h3>
              <p><strong>Token ID:</strong> {pass.token_id}</p>
              <p><strong>Arrival Window:</strong> {pass.arrival_window}</p>
              <p><strong>Status:</strong> Approved / Anti-Recycling Token Active</p>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', color: '#2d6a4f', margin: 0 }}>2. Live Database Roster (Supabase)</h2>
            <button onClick={fetchBookings} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f' }}>
              <RefreshCw size={18} />
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Token</th>
                <th style={{ padding: '8px' }}>Farmer</th>
                <th style={{ padding: '8px' }}>Crop</th>
                <th style={{ padding: '8px' }}>Bags</th>
                <th style={{ padding: '8px' }}>Window</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '15px', color: '#888' }}>No bookings logged yet.</td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{b.token_id}</td>
                    <td style={{ padding: '8px' }}>{b.farmer_name}</td>
                    <td style={{ padding: '8px' }}>{b.commodity}</td>
                    <td style={{ padding: '8px' }}>{b.quantity_bags}</td>
                    <td style={{ padding: '8px' }}>{b.arrival_window}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
      
  
   
       

