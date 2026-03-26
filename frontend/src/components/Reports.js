import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { child, get, ref, remove, update } from "firebase/database";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "../context/ToastContext";
import { database } from "../firebase";
import { buildPdfReportData, PdfReportTemplate } from "../utils/pdfReport";

export default function Reports() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [menuId, setMenuId] = useState(null);
  const { showToast } = useToast();
  const auth = getAuth();
  const userName =
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split("@")[0] ||
    "Sahbaz";

  const fetchScans = () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const dbRef = ref(database);

    get(child(dbRef, `users/${auth.currentUser.uid}/scans`))
      .then((snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const arr = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
          arr.sort((a, b) => new Date(b.date) - new Date(a.date));
          setScans(arr);
        } else {
          setScans([]);
        }
      })
      .catch(() => {
        setLoading(false);
        showToast("Failed to fetch reports", "error");
      });
  };

  useEffect(() => {
    fetchScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await remove(ref(database, `users/${auth.currentUser.uid}/scans/${id}`));
      showToast("Report deleted", "info");
      fetchScans();
    } catch {
      showToast("Error deleting report", "error");
    }
  };

  const handleRenameSave = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await update(ref(database, `users/${auth.currentUser.uid}/scans/${id}`), { reportName: editName });
      showToast("Report renamed successfully", "success");
      setEditingId(null);
      fetchScans();
    } catch {
      showToast("Error renaming report", "error");
    }
  };

  const handleShare = async (scan) => {
    const text = `AgroScan Report\nDisease: ${scan.disease}\nConfidence: ${Math.round(scan.confidence * 100)}%\nFertilizer: ${scan.fertilizer}\nTreatment: ${scan.procedure}\nPrevention: ${scan.prevention}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "AgroScan Report", text });
      } catch (error) {
        console.log("Share cancelled or failed.", error);
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
    element.style.display = "block";
    element.style.position = "absolute";
    element.style.top = "-9999px";
    element.style.left = "-9999px";

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`AgroScan_${reportName}.pdf`);
      showToast("Report downloaded successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate PDF", "error");
    } finally {
      element.style.display = "none";
    }
  };

  return (
    <div className="container py-4 py-lg-5 stagger">
      <section className="page-hero-card mb-4">
        <div className="position-relative">
          <span className="info-chip mb-3">
            <i className="bi bi-folder-check" />
            Report library
          </span>
          <h1 className="display-6 fw-bold mb-2">Manage your scan reports in a cleaner view.</h1>
          <p className="mb-0" style={{ maxWidth: "40rem", opacity: 0.9 }}>
            View, rename, share, download, and delete reports from one responsive screen with tighter cards and clearer actions.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-accent" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : scans.length === 0 ? (
        <div className="glass-lg p-5 text-center shadow-sm">
          <i className="bi bi-inbox fs-1 text-muted mb-3 d-block" />
          <h5 className="fw-semibold text-muted">No reports found</h5>
          <p className="text-muted small">You have not performed any structured scans yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {scans.map((scan) => {
            const isEditing = editingId === scan.id;
            const displayName = scan.reportName || scan.filename || scan.disease || "Untitled Scan";
            return (
              <div key={scan.id} className="col-12">
                <div
                  className="glass compact-card d-flex flex-column flex-lg-row align-items-lg-center gap-3 position-relative"
                  style={{ overflow: "visible", zIndex: menuId === scan.id ? 25 : 1 }}
                >
                  <div className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 56, height: 56, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                    <i className="bi bi-file-earmark-medical fs-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    {isEditing ? (
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                        <input type="text" className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus style={{ maxWidth: "260px" }} />
                        <button className="btn btn-sm btn-success px-3 rounded-pill" onClick={() => handleRenameSave(scan.id)}>Save</button>
                        <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="d-flex align-items-start gap-2">
                        <h3 className="compact-title fw-bold mb-1 text-truncate" style={{ color: "var(--text-primary)" }}>{displayName}</h3>
                        <button className="btn btn-link p-0 text-muted border-0 flex-shrink-0" onClick={() => { setEditingId(scan.id); setEditName(displayName); }} title="Rename Report">
                          <i className="bi bi-pencil-square" />
                        </button>
                      </div>
                    )}
                    <div className="d-flex flex-wrap gap-3 small" style={{ color: "var(--text-muted)" }}>
                      <span><i className="bi bi-calendar3 me-1" /> {new Date(scan.date).toLocaleDateString()}</span>
                      <span><i className="bi bi-bug me-1" /> {scan.disease}</span>
                      {typeof scan.confidence === "number" && <span>{Math.round(scan.confidence * 100)}% confidence</span>}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-lg-auto">
                    <div className="position-relative">
                      <button
                        className="btn btn-outline-secondary btn-sm px-3"
                        onClick={() => setMenuId(menuId === scan.id ? null : scan.id)}
                        aria-label="More actions"
                      >
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      {menuId === scan.id && (
                        <div
                          className="glass position-absolute end-0 mt-2 p-2"
                          style={{ minWidth: "190px", zIndex: 2000, top: "calc(100% + 0.35rem)" }}
                        >
                          <button className="btn w-100 text-start rounded-3 px-3 py-2 border-0" style={{ color: "var(--text-secondary)" }} onClick={() => { setMenuId(null); handleDownloadPdf(scan); }}>
                            <i className="bi bi-file-earmark-pdf me-2 text-accent" /> Download PDF
                          </button>
                          <button className="btn w-100 text-start rounded-3 px-3 py-2 border-0" style={{ color: "var(--text-secondary)" }} onClick={() => { setMenuId(null); handleShare(scan); }}>
                            <i className="bi bi-share me-2 text-accent" /> Share
                          </button>
                          <button className="btn w-100 text-start rounded-3 px-3 py-2 border-0" style={{ color: "var(--text-secondary)" }} onClick={() => { setMenuId(null); setEditingId(scan.id); setEditName(displayName); }}>
                            <i className="bi bi-pencil me-2 text-accent" /> Rename
                          </button>
                          <button className="btn w-100 text-start rounded-3 px-3 py-2 border-0" style={{ color: "#dc3545" }} onClick={() => { setMenuId(null); handleDelete(scan.id); }}>
                            <i className="bi bi-trash3 me-2" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div id={`pdf-template-${scan.id}`} style={{ display: "none" }}>
                    <PdfReportTemplate
                      data={buildPdfReportData({
                        scan,
                        reportName: displayName,
                        userName,
                        scanSource: scan.scanSource || "Upload",
                      })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
