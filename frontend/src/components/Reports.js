import React, { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get, child, remove, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useToast } from "../context/ToastContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { generateYieldAdvice } from "../utils/soilAdvice";

export default function Reports() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const { showToast } = useToast();
  const auth = getAuth();

  const fetchScans = () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const dbRef = ref(database);
    get(child(dbRef, `users/${auth.currentUser.uid}/scans`)).then((snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        arr.sort((a,b) => new Date(b.date) - new Date(a.date));
        setScans(arr);
      } else {
        setScans([]);
      }
    }).catch(err => {
      setLoading(false);
      showToast("Failed to fetch reports", "error");
    });
  };

  useEffect(() => {
    fetchScans();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await remove(ref(database, `users/${auth.currentUser.uid}/scans/${id}`));
      showToast("Report deleted", "info");
      fetchScans();
    } catch (err) {
      showToast("Error deleting report", "error");
    }
  };

  const handleRenameSave = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await update(ref(database, `users/${auth.currentUser.uid}/scans/${id}`), {
        reportName: editName
      });
      showToast("Report renamed successfully", "success");
      setEditingId(null);
      fetchScans();
    } catch (err) {
      showToast("Error renaming report", "error");
    }
  };

  const handleShare = async (scan) => {
    const text = `AgroScan Report\nDisease: ${scan.disease}\nConfidence: ${Math.round(scan.confidence * 100)}%\nFertilizer: ${scan.fertilizer}\nTreatment: ${scan.procedure}\nPrevention: ${scan.prevention}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgroScan Report',
          text: text,
        });
      } catch (err) {
        console.log("Share cancelled or failed.", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast("Report full text copied to clipboard!", "info");
    }
  };

  const handleDownloadPdf = async (scan) => {
    const reportName = scan.reportName || scan.filename || scan.disease || "Report";
    const element = document.getElementById(`pdf-template-${scan.id}`);
    if (!element) return;
    
    showToast("Generating PDF... please wait", "info");
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AgroScan_${reportName}.pdf`);
      showToast("Report downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF", "error");
    } finally {
      element.style.display = 'none';
    }
  };

  return (
    <div className="container-fluid px-3 px-md-4 pb-5 stagger">
      <section className="text-center mb-5 mt-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
          <i className="bi bi-folder-check me-2 text-accent" />
          My Reports
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Manage your historical scan reports. View, rename, share, or download your data securely.
        </p>
      </section>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-accent" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : scans.length === 0 ? (
            <div className="glass-lg rounded-4 p-5 text-center shadow-sm">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block" />
              <h5 className="fw-semibold text-muted">No reports found</h5>
              <p className="text-muted small">You have not performed any structured scans yet.</p>
            </div>
          ) : (
            <div className="row g-4">
              {scans.map((scan, index) => {
                const isEditing = editingId === scan.id;
                const displayName = scan.reportName || scan.filename || scan.disease || "Untitled Scan";
                
                return (
                  <div key={scan.id} className="col-12">
                    <div className="glass rounded-4 p-4 d-flex flex-column flex-md-row gap-4 align-items-md-center shadow-sm position-relative" style={{ borderLeft: "4px solid var(--accent)", zIndex: scans.length - index }}>
                      <div className="position-absolute top-0 start-0 w-100 h-100 z-0" style={{ background: "linear-gradient(45deg, var(--bg-primary) 0%, transparent 100%)", opacity: 0.3, pointerEvents: "none", borderRadius: "1rem" }} />
                      
                      {/* Icon */}
                      <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 z-1 shadow-sm" style={{ width: 70, height: 70, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <i className="bi bi-file-earmark-medical fs-2" style={{ color: "var(--accent)" }} />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-grow-1 min-w-0 z-1">
                        {isEditing ? (
                          <div className="d-flex gap-2 align-items-center mb-2">
                            <input 
                              type="text" 
                              className="form-control form-control-sm bg-secondary text-primary border-accent" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              style={{ maxWidth: "300px" }}
                            />
                            <button className="btn btn-sm btn-success px-3 rounded-pill" onClick={() => handleRenameSave(scan.id)}>Save</button>
                            <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <h3 className="h5 fw-bold mb-1 text-wrap d-flex align-items-center gap-2" style={{ color: "var(--text-primary)", wordBreak: "break-word" }}>
                            {displayName}
                            <button className="btn btn-link p-0 text-muted ms-2 flex-shrink-0" onClick={() => { setEditingId(scan.id); setEditName(displayName); }} title="Rename Report">
                              <i className="bi bi-pencil-square" style={{ fontSize: "0.9rem" }} />
                            </button>
                          </h3>
                        )}
                        <div className="d-flex flex-wrap gap-3 align-items-center text-muted small">
                          <span><i className="bi bi-calendar3 me-1" /> {new Date(scan.date).toLocaleString()}</span>
                          <span><i className="bi bi-bug me-1" /> {scan.disease}</span>
                          {typeof scan.confidence === "number" && (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1">
                              {Math.round(scan.confidence * 100)}% Conf
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Kebab Menu */}
                      <div className="dropdown z-3 px-2">
                        <button className="btn btn-link text-muted p-0 border-0 shadow-none outline-none" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Menu">
                          <i className="bi bi-three-dots-vertical fs-5" />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2" style={{ zIndex: 1050 }}>
                          <li><button className="dropdown-item py-2 fw-semibold rounded-2" onClick={() => handleDownloadPdf(scan)}><i className="bi bi-file-earmark-pdf me-2 text-danger" /> Download PDF</button></li>
                          <li><button className="dropdown-item py-2 fw-semibold rounded-2" onClick={() => handleShare(scan)}><i className="bi bi-share me-2 text-primary" /> Share</button></li>
                          <li><button className="dropdown-item py-2 fw-semibold rounded-2" onClick={() => { setEditingId(scan.id); setEditName(displayName); }}><i className="bi bi-pencil me-2 text-warning" /> Rename</button></li>
                          <li><hr className="dropdown-divider mx-2" /></li>
                          <li><button className="dropdown-item py-2 fw-semibold text-danger rounded-2" onClick={() => handleDelete(scan.id)}><i className="bi bi-trash3 me-2" /> Delete</button></li>
                        </ul>
                      </div>

                    </div>

                    {/* Hidden PDF Template for html2canvas */}
                    <div id={`pdf-template-${scan.id}`} style={{ display: 'none', width: '700px', padding: '15px 25px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
                      <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '2px solid #059669', paddingBottom: '5px' }}>
                        <h1 style={{ color: '#059669', marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' }}>AgroScan Diagnostic Report</h1>
                        <h2 style={{ fontSize: '16px', margin: 0, color: '#1f2937' }}>{displayName}</h2>
                        <p style={{ color: '#6b7280', marginTop: '2px', fontSize: '11px' }}>Generated on {new Date(scan.date).toLocaleString()}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                           <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', color: '#111827', fontSize: '16px', margin: '0 0 6px 0' }}>Crop Analysis</h3>
                           <p style={{ fontSize: '14px', margin: '0 0 4px 0' }}><strong>Detected Condition:</strong> {scan.disease}</p>
                           <p style={{ fontSize: '14px', margin: '0 0 6px 0' }}><strong>AI Confidence:</strong> {typeof scan.confidence === "number" ? Math.round(scan.confidence * 100) + '%' : 'N/A'}</p>
                           {typeof scan.confidence === "number" && (
                             <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                               <div style={{ width: `${Math.round(scan.confidence * 100)}%`, height: '100%', backgroundColor: '#059669' }} />
                             </div>
                           )}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                           {(scan.thumbBase64 || scan.preview) ? (
                             <img src={scan.thumbBase64 || scan.preview} alt="Crop" style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} crossOrigin="anonymous" />
                           ) : (
                             <div style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
                               <span style={{ fontSize: '36px' }}>🌱</span>
                             </div>
                           )}
                        </div>
                      </div>

                      <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', color: '#111827', fontSize: '16px', margin: '0 0 6px 0' }}>AI Action Plan</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                         <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                           <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#065f46' }}>🌿 Treatment Procedure</strong>
                           <span style={{ fontSize: '13px', color: '#064e3b', lineHeight: '1.3' }}>{scan.procedure}</span>
                         </div>
                         <div style={{ padding: '8px', backgroundColor: '#fffbeb', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                           <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#92400e' }}>🛡️ Precaution & Prevention</strong>
                           <span style={{ fontSize: '13px', color: '#78350f', lineHeight: '1.3' }}>{scan.prevention}</span>
                         </div>
                         <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                           <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px', color: '#1e40af' }}>🌾 Fertilizer Recommendation</strong>
                           <span style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.3' }}>{scan.fertilizer}</span>
                         </div>
                      </div>

                      {(() => {
                        const soilAdvice = generateYieldAdvice(scan.disease);
                        return (
                          <>
                            <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', margin: '10px 0 6px 0', color: '#111827', fontSize: '16px' }}>Soil Health & Mechanics</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fafafa', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                              <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.3' }}>
                                 <p style={{ margin: '0 0 4px 0' }}><strong>Optimum Soil Type:</strong> {soilAdvice.type}</p>
                                 <p style={{ margin: '0 0 4px 0' }}><strong>Fertility Status:</strong> {soilAdvice.fertility}</p>
                                 <p style={{ margin: '0 0 6px 0' }}><strong>Required Soil Action:</strong> {soilAdvice.action}</p>
                                 
                                 <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '11px', fontWeight: 'bold', color: '#4b5563' }}>
                                       <span>Poor</span>
                                       <span>Optimal</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                       <div style={{ width: `${soilAdvice.healthScore}%`, height: '100%', backgroundColor: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }} />
                                    </div>
                                 </div>
                              </div>
                              <div style={{ textAlign: 'center', padding: '6px', backgroundColor: '#ffffff', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '3px solid', borderColor: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                                 <span style={{ fontSize: '24px', fontWeight: 'bold', color: soilAdvice.healthScore > 75 ? '#10b981' : soilAdvice.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>{soilAdvice.healthScore}</span>
                                 <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: 'bold' }}>SCORE</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      <div style={{ marginTop: '10px', paddingTop: '8px', textAlign: 'center', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px' }}>
                        <span>Generated by </span><strong style={{ color: '#059669' }}>Sahbaz</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
