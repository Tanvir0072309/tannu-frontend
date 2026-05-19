import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Home.module.css";

// ── Assets: Vite se proper import (relative path from this file) ──────────────
import logoImg from "../../assets/logo.png";
import msmeImg from "../../assets/msme-logo.png";

/* ─── CONFIG ──────────────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || "";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "";
// MEDIA_BASE: /api ya /api/ dono handle karta hai
const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

/* ─── UTILS ───────────────────────────────────────────────────────────────── */
const initials = (n = "") => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const YEAR = new Date().getFullYear();

async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, opts);
    const data = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
    return { ok: res.ok, status: res.status, data };
}

/* ─── LOGO COMPONENTS — Vite imported assets ────────────────────────────── */
function Logo({ size = 40 }) {
    return (
        <img
            src={logoImg}
            alt="Tannu Tailoring"
            width={size}
            height={size}
            style={{ borderRadius: "50%", objectFit: "cover" }}
        />
    );
}

function MSMELogo({ size = 38 }) {
    return (
        <img
            src={msmeImg}
            alt="MSME Registered"
            width={size}
            height={size}
        />
    );
}

/* ─── ROOT ────────────────────────────────────────────────────────────────── */
export default function App() {
    const [page, setPage] = useState("home");
    const [selected, setSelected] = useState(null);
    const [adminOk, setAdminOk] = useState(false);
    const [stats, setStats] = useState({ total: 0, paid: 0 });
    const [cfg, setCfg] = useState({
        courseRate: "499", udyamNo: "UDYAM-GJ-XXXXXXXX",
        trainerName: "Tanisha Pathan",
        institution: "Tannu Tailoring & Fashion Classes",
        phone: "", theme: "light",
    });

    const fetchStats = () =>
        apiFetch("/stats/").then(r => r.ok && setStats(r.data)).catch(() => { });

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { document.body.className = cfg.theme === "dark" ? "dark" : ""; }, [cfg.theme]);
    // Browser tab title
    useEffect(() => { document.title = "Tannu Tailoring"; }, []);

    const nav = p => { setPage(p); setSelected(null); };
    const openCert = c => { setSelected(c); setPage("certView"); };

    return (
        <div className={styles.shell}>
            <Nav nav={nav} cfg={cfg} setCfg={setCfg} />
            {page === "home" && <HomePage nav={nav} cfg={cfg} stats={stats} />}
            {page === "search" && <SearchPage onOpen={openCert} />}
            {page === "certView" && <CertViewPage cert={selected} cfg={cfg} onBack={() => nav("search")} />}
            {page === "admin" && (adminOk
                ? <AdminPanel cfg={cfg} setCfg={setCfg} onRefresh={fetchStats} />
                : <LoginPage onAuth={() => setAdminOk(true)} />
            )}
        </div>
    );
}

/* ─── NAV ─────────────────────────────────────────────────────────────────── */
function Nav({ nav, cfg, setCfg }) {
    return (
        <nav className={styles.nav}>
            <div className={styles.navBrand} onClick={() => nav("home")}>
                <Logo size={34} />
                <span className={styles.navTitle}>Tannu Tailoring</span>
            </div>
            <button className={styles.navBtn}
                onClick={() => setCfg(c => ({ ...c, theme: c.theme === "dark" ? "light" : "dark" }))}>
                {cfg.theme === "dark" ? "☀ Day" : "☾ Night"}
            </button>
        </nav>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE 1 — HOME
══════════════════════════════════════════════════════════════════════════════ */
function HomePage({ nav, cfg, stats }) {
    const dlSample = async () => {
        try {
            const res = await fetch(`${API}/sample-certificate/`);
            if (!res.ok) throw new Error();
            const url = URL.createObjectURL(await res.blob());
            Object.assign(document.createElement("a"), { href: url, download: "Tannu-Certificate-Sample.png" }).click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Sample certificate not found.\nPlace Tannu-certificate-demo.png in tannu_backend/assets/");
        }
    };

    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <div className={styles.heroBadge}><MSMELogo size={16} /> MSME Registered Institute</div>

                {/* Sewing machine SVG illustration */}
                <svg width="200" height="140" viewBox="0 0 200 140" fill="none" style={{ margin: "0 0 1rem" }}>
                    <rect x="35" y="68" width="130" height="52" rx="9" fill="#D4A820" fillOpacity=".13" stroke="#B8900A" strokeWidth="1.3" />
                    <rect x="55" y="52" width="90" height="22" rx="6" fill="#D4A820" fillOpacity=".16" stroke="#B8900A" strokeWidth="1.1" />
                    <rect x="88" y="38" width="24" height="18" rx="4" fill="#D4A820" fillOpacity=".2" stroke="#B8900A" strokeWidth="1" />
                    <line x1="100" y1="53" x2="100" y2="90" stroke="#B8900A" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="97" y1="88" x2="103" y2="88" stroke="#B8900A" strokeWidth="1.6" />
                    <ellipse cx="158" cy="76" rx="10" ry="14" fill="none" stroke="#B8900A" strokeWidth="1.3" />
                    <ellipse cx="158" cy="76" rx="5" ry="9" fill="#D4A820" fillOpacity=".28" />
                    <path d="M148,76 Q124,68 100,53" stroke="#B8900A" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity=".65" />
                    <circle cx="57" cy="88" r="13" fill="none" stroke="#B8900A" strokeWidth="1.3" />
                    <circle cx="57" cy="88" r="6" fill="#D4A820" fillOpacity=".28" stroke="#B8900A" strokeWidth="1" />
                    <circle cx="57" cy="88" r="2.5" fill="#B8900A" />
                    <path d="M35,112 Q55,104 75,112 Q95,120 115,112 Q135,104 155,112 Q165,117 170,114" stroke="#B8900A" strokeWidth="1.9" fill="none" strokeLinecap="round" />
                    <g transform="translate(22,48) rotate(-25) scale(.82)">
                        <path d="M0,-3L20,-8L21,-5L2,0Z" fill="#B8900A" opacity=".8" />
                        <path d="M0,3L20,8L21,5L2,0Z" fill="#B8900A" opacity=".8" />
                        <circle cx="0" cy="0" r="2.2" fill="#B8900A" />
                        <circle cx="-11" cy="-9" r="5.5" fill="none" stroke="#B8900A" strokeWidth="2" />
                        <circle cx="-11" cy="9" r="5.5" fill="none" stroke="#B8900A" strokeWidth="2" />
                    </g>
                    {[[14, 26], [186, 32], [192, 108], [18, 115]].map(([x, y], i) => (
                        <g key={i} transform={`translate(${x},${y})`} opacity=".4">
                            <line x1="-4" y1="0" x2="4" y2="0" stroke="#D4A820" strokeWidth="1.3" strokeLinecap="round" />
                            <line x1="0" y1="-4" x2="0" y2="4" stroke="#D4A820" strokeWidth="1.3" strokeLinecap="round" />
                        </g>
                    ))}
                </svg>

                <div className={styles.heroTagline}>Stitch Your <em>Future</em><br />with Confidence</div>
                <div className={styles.heroSub}>Professional tailoring &amp; cutting courses — MSME-backed certificates.</div>
                <div className={styles.heroDivider} />

                <div className={styles.heroStats}>
                    <div className={styles.stat}><div className={styles.statN}>{stats.total || "0+"}</div><div className={styles.statL}>Certified</div></div>
                    <div className={styles.stat}><div className={styles.statN}>1 Month</div><div className={styles.statL}>Duration</div></div>
                    <div className={styles.stat}><div className={styles.statN}>₹499</div><div className={styles.statL}>Fees</div></div>
                </div>

                {/* Sample cert */}
                <div className={styles.demoWrap}>
                    <img src="/assets/Tannu-certificate-demo.png" alt="Sample Certificate"
                        className={styles.demoCert}
                        onError={e => e.target.style.display = "none"} />
                    <button className={styles.demoBtn} onClick={dlSample}>⬇ Download Sample Certificate</button>
                </div>

                <div className={styles.homeCards}>
                    {[
                        {
                            title: "Get Verified", desc: "Verify any certificate by name or cert number", page: "search",
                            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="17" y1="17" x2="22" y2="22" /></svg>
                        },
                        {
                            title: "Get Certified", desc: "Admin — upload & manage student certificates", page: "admin",
                            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="9" x2="17" y2="9" /><line x1="7" y1="13" x2="13" y2="13" /></svg>
                        },
                    ].map(c => (
                        <div key={c.page} className={styles.hcard} onClick={() => nav(c.page)}>
                            <div className={styles.hcardIcon}>{c.icon}</div>
                            <div className={styles.hcardBody}>
                                <div className={styles.hcardTitle}>{c.title}</div>
                                <div className={styles.hcardDesc}>{c.desc}</div>
                            </div>
                            <div className={styles.hcardArr}>›</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / info strip from settings */}
            <div className={styles.infoStrip}>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Institute</div><div className={styles.infoVal}>Tannu Tailoring &amp; Fashion Classes</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Trainer</div><div className={styles.infoVal}>Tanisha Pathan · Founder</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Udyam No</div><div className={styles.infoVal}>UDYAM-GJ-XXXXXXXX</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Total Certified</div><div className={styles.infoVal}>{stats.total} Students</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Paid</div><div className={styles.infoVal}>{stats.paid} / {stats.total}</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Skills</div><div className={styles.infoVal}>Cutting · Stitching · Finishing</div></div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE 2 — SEARCH (real-time, every character)
══════════════════════════════════════════════════════════════════════════════ */
function SearchPage({ onOpen }) {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounce = useRef(null);

    const doSearch = useCallback(async (val) => {
        if (!val.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const r = await apiFetch(`/students/?search=${encodeURIComponent(val)}`);
            setResults(r.ok ? (Array.isArray(r.data) ? r.data : []) : []);
        } catch { setResults([]); }
        setLoading(false);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQ(val);
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => doSearch(val), 200);
    };

    return (
        <div className={styles.pageWrap}>
            <div className={styles.pageHeading}>Verify Certificate</div>
            <div className={styles.pageHint}>Type a name or certificate number — results appear instantly.</div>

            <div className={styles.searchCard}>
                <label className={styles.fieldLabel}>Name or Certificate Number</label>
                <input className={styles.fieldInput} autoFocus
                    placeholder={`e.g. Priya Sharma  or  STC-${YEAR}-001`}
                    value={q} onChange={handleInput} />
            </div>

            {loading && <div className={styles.emptyHint}>Searching…</div>}
            {!loading && q && results.length === 0 && (
                <div className={styles.emptyHint}>No certificate found for "{q}"</div>
            )}
            {!loading && results.length > 0 && (
                <div className={styles.resultList}>
                    {results.map((r, i) => (
                        <div key={r.id} className={styles.rcard}
                            style={{ animationDelay: `${i * 0.06}s` }}
                            onClick={() => onOpen(r)}>
                            <div className={styles.rcardAvatar}>{initials(r.name)}</div>
                            <div style={{ flex: 1 }}>
                                <div className={styles.rcardName}>{r.name}</div>
                                <div className={styles.rcardNo}>{r.cert_no}</div>
                                <div className={styles.rcardMeta}>{r.village}{r.district ? ` · ${r.district}` : ""}</div>
                            </div>
                            <div className={styles.rcardArr}>›</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE 3 — CERTIFICATE DETAIL VIEW
══════════════════════════════════════════════════════════════════════════════ */
function CertViewPage({ cert, cfg, onBack }) {
    if (!cert) return null;
    const [dling, setDling] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        setImgErr(false);
        if (cert.certificate_file) {
            // certificate_file = "certificates/STC-2026-001_Name.png"
            // MEDIA_BASE = "https://tannu-backend.onrender.com"
            // Full URL = "https://tannu-backend.onrender.com/media/certificates/STC-2026-001_Name.png"
            const url = `${MEDIA_BASE}/media/${cert.certificate_file}`;
            setImgSrc(url);
        } else {
            setImgSrc(null);
        }
    }, [cert]);

    const download = async () => {
        setDling(true);
        try {
            const res = await fetch(`${API}/students/${cert.id}/certificate/`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed");
            const url = URL.createObjectURL(await res.blob());
            Object.assign(document.createElement("a"), {
                href: url,
                download: `${cert.cert_no}_${cert.name.replace(/ /g, "_")}.png`
            }).click();
            URL.revokeObjectURL(url);
        } catch (e) { alert("Download failed: " + e.message); }
        setDling(false);
    };

    return (
        <div className={styles.certDetail}>
            <button
                className={`${styles.btn} ${styles.btnGhost}`}
                style={{ marginBottom: "1rem" }}
                onClick={onBack}
            >
                ← Back to search
            </button>

            <div className={styles.pageHeading}>{cert.name}</div>
            <div className={styles.certNoLabel}>{cert.cert_no}</div>

            {/* Details grid */}
            <div className={styles.detailGrid}>
                {[
                    ["Phone", cert.phone],
                    ["Age", cert.age],
                    ["Birthdate", cert.birthdate],
                    ["Village", cert.village],
                    ["District", cert.district],
                    ["Start Date", cert.start_date],
                    ["End Date", cert.end_date],
                    ["Fees", cert.fees ? `₹${cert.fees}` : "—"],
                    ["Payment", cert.paid ? "✓ Paid" : "✗ Pending"],
                ].map(([l, v]) => (
                    <div className={styles.ditem} key={l}>
                        <span className={styles.ditemLabel}>{l}</span>
                        <div className={styles.ditemVal}>{v || "—"}</div>
                    </div>
                ))}
            </div>

            {/* ── Certificate image — MEDIA_BASE/media/certificate_file ── */}
            {imgSrc && !imgErr ? (
                <div className={styles.certImageWrap}>
                    <img
                        src={imgSrc}
                        alt={`Certificate — ${cert.name}`}
                        className={styles.certImage}
                        onError={() => setImgErr(true)}
                    />
                </div>
            ) : imgErr ? (
                <div className={styles.certImagePlaceholder}>
                    ⚠ Image load nahi ho rahi.<br />
                    <small style={{ opacity: .7 }}>URL: {imgSrc}</small>
                </div>
            ) : (
                <div className={styles.certImagePlaceholder}>
                    📄 Is student ka certificate image upload nahi hua.
                </div>
            )}

            {imgSrc && !imgErr && (
                <button
                    className={`${styles.btn} ${styles.btnGold}`}
                    onClick={download}
                    disabled={dling}
                >
                    {dling ? "Downloading…" : "⬇ Download Certificate"}
                </button>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════════════════════ */
function LoginPage({ onAuth }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");

    return (
        <div className={styles.loginBg}>
            <div className={styles.loginBox}>
                <div style={{ display: "flex", justifyContent: "center" }}><Logo size={58} /></div>
                <div className={styles.loginTitle}>Admin Login</div>
                <div className={styles.loginSub}>Get Certified — Authorised Access Only</div>
                <div style={{ marginBottom: ".9rem" }}>
                    <label className={styles.fieldLabel}>Username</label>
                    <input className={styles.fi} placeholder="Username" value={u} onChange={e => setU(e.target.value)} />
                </div>
                <div style={{ marginBottom: ".4rem" }}>
                    <label className={styles.fieldLabel}>Password</label>
                    <input className={styles.fi} type="password" placeholder="Password" value={p}
                        onChange={e => setP(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (u === ADMIN_USER && p === ADMIN_PASS ? onAuth() : setErr("Wrong credentials."))} />
                </div>
                {err && <div className={styles.msgErr}>{err}</div>}
                <button className={`${styles.btn} ${styles.btnGold}`}
                    onClick={() => u === ADMIN_USER && p === ADMIN_PASS ? onAuth() : setErr("Wrong credentials.")}>
                    Login
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════════════════════════════════════════ */
function AdminPanel({ cfg, setCfg, onRefresh }) {
    const [tab, setTab] = useState("add");
    return (
        <div className={styles.adminWrap}>
            <div className={styles.tabs}>
                {[["add", "+ Upload Certificate"], ["list", "All Certificates"], ["settings", "⚙ Settings"]].map(([k, l]) => (
                    <button key={k} className={`${styles.tab}${tab === k ? " " + styles.tabOn : ""}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>
            {tab === "add" && <UploadForm cfg={cfg} onAdded={onRefresh} />}
            {tab === "list" && <CertList onRefresh={onRefresh} />}
            {tab === "settings" && <SettingsPanel cfg={cfg} setCfg={setCfg} />}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   UPLOAD FORM — 2 confirmation windows
══════════════════════════════════════════════════════════════════════════════ */
function UploadForm({ cfg, onAdded }) {
    const blank = {
        name: "", phone: "", village: "", district: "",
        age: "", birthdate: "", start_date: "", end_date: "",
        fees: cfg.courseRate, paid: false,
    };
    const [f, setF] = useState(blank);
    const [certNo, setCertNo] = useState("");      // auto-generated preview
    const [imgFile, setImgFile] = useState(null);   // File object
    const [imgPrev, setImgPrev] = useState(null);   // blob URL
    const [step, setStep] = useState("form"); // form | confirm1 | confirm2 | done
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();

    // Fetch next cert no on mount
    useEffect(() => {
        apiFetch("/next-cert-no/").then(r => r.ok && setCertNo(r.data.cert_no));
    }, []);

    const set = (k, v) => setF(x => ({ ...x, [k]: v }));

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImgFile(file);
        setImgPrev(URL.createObjectURL(file));
    };

    const validate = () => {
        if (!f.name.trim()) return "Student name is required.";
        if (!imgFile) return "Please upload the certificate image.";
        if (!certNo) return "Certificate number not loaded. Refresh.";
        return null;
    };

    /* Step 1 → Confirmation window 1: cert number match check */
    const goConfirm1 = () => {
        const err = validate();
        if (err) { setMsg({ ok: false, t: err }); return; }
        setMsg(null);
        setStep("confirm1");
    };

    /* Step 2 → Confirmation window 2: full details review */
    const goConfirm2 = () => setStep("confirm2");

    /* Final submit */
    const submit = async () => {
        setLoading(true);
        const fd = new FormData();
        fd.append("cert_no", certNo);
        fd.append("name", f.name);
        fd.append("phone", f.phone);
        fd.append("village", f.village);
        fd.append("district", f.district);
        fd.append("age", f.age);
        fd.append("birthdate", f.birthdate);
        fd.append("start_date", f.start_date);
        fd.append("end_date", f.end_date);
        fd.append("fees", f.fees);
        fd.append("paid", f.paid ? "true" : "false");
        fd.append("certificate_image", imgFile);

        const r = await apiFetch("/students/create/", { method: "POST", body: fd });
        if (r.ok) {
            setStep("done");
            setMsg({ ok: true, t: `✓ Certificate saved — ${certNo}` });
            setF(blank); setImgFile(null); setImgPrev(null);
            onAdded();
            // Refresh cert no
            apiFetch("/next-cert-no/").then(x => x.ok && setCertNo(x.data.cert_no));
        } else {
            const errText = Object.values(r.data).flat().join(" ");
            setMsg({ ok: false, t: errText });
            setStep("form");
        }
        setLoading(false);
    };

    /* ── STEP: DONE ── */
    if (step === "done") return (
        <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>🎉 Certificate Saved!</div>
            {msg && <div className={styles.msgOk}>{msg.t}</div>}
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => { setStep("form"); setMsg(null); }}>
                + Add Another
            </button>
        </div>
    );

    /* ── STEP: CONFIRM 2 — full details ── */
    if (step === "confirm2") return (
        <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Step 2 of 2 — Confirm All Details</div>
            <div className={styles.confirmGrid}>
                {[["Certificate No", certNo], ["Name", f.name], ["Phone", f.phone],
                ["Age", f.age], ["Birthdate", f.birthdate], ["Village", f.village],
                ["District", f.district], ["Start Date", f.start_date],
                ["End Date", f.end_date], ["Fees", `₹${f.fees}`], ["Paid", f.paid ? "Yes" : "No"],
                ["Image", imgFile?.name || "—"]
                ].map(([k, v]) => (
                    <div key={k} className={styles.confirmRow}>
                        <span className={styles.confirmKey}>{k}</span>
                        <span className={styles.confirmVal}>{v || "—"}</span>
                    </div>
                ))}
            </div>
            {imgPrev && <img src={imgPrev} alt="cert preview" style={{ width: "100%", borderRadius: 8, marginTop: "1rem", border: "1px solid var(--border)" }} />}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button className={`${styles.btn} ${styles.btnGold}`} style={{ flex: 1 }} onClick={submit} disabled={loading}>
                    {loading ? "Saving…" : "✓ Confirm & Save"}
                </button>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }} onClick={() => setStep("confirm1")}>
                    ← Back
                </button>
            </div>
        </div>
    );

    /* ── STEP: CONFIRM 1 — cert number match ── */
    if (step === "confirm1") return (
        <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Step 1 of 2 — Verify Certificate Number</div>
            <p style={{ fontSize: ".88rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                The system has generated the following certificate number for <strong>{f.name}</strong>.
                Please confirm this matches the number printed on the uploaded certificate image.
            </p>
            <div className={styles.certNoBig}>{certNo}</div>
            {imgPrev && (
                <img src={imgPrev} alt="uploaded cert"
                    style={{ width: "100%", borderRadius: 8, margin: "1rem 0", border: "2px solid var(--gold2)", maxHeight: 220, objectFit: "contain" }} />
            )}
            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                Does the certificate image show <strong>{certNo}</strong>?
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
                <button className={`${styles.btn} ${styles.btnGold}`} style={{ flex: 1 }} onClick={goConfirm2}>
                    ✓ Yes, it matches
                </button>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }} onClick={() => setStep("form")}>
                    ✗ No, go back
                </button>
            </div>
        </div>
    );

    /* ── STEP: FORM ── */
    return (
        <div>
            {/* Auto cert no display */}
            <div className={styles.certNoPreview}>
                <span className={styles.certNoLabel2}>Auto-Generated Certificate No</span>
                <span className={styles.certNoBig}>{certNo || "Loading…"}</span>
                <span className={styles.certNoHint}>Write this number on the physical certificate before uploading its image.</span>
            </div>

            <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.full}`}>
                    <label className={styles.fieldLabel}>Full Name *</label>
                    <input className={styles.fi} placeholder="Student Full Name" value={f.name} onChange={e => set("name", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Phone</label>
                    <input className={styles.fi} placeholder="Mobile number" value={f.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Age</label>
                    <input className={styles.fi} type="number" placeholder="Age" value={f.age} onChange={e => set("age", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Birthdate</label>
                    <input className={styles.fi} type="date" value={f.birthdate} onChange={e => set("birthdate", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Village / City</label>
                    <input className={styles.fi} placeholder="Village or City" value={f.village} onChange={e => set("village", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>District</label>
                    <input className={styles.fi} placeholder="District" value={f.district} onChange={e => set("district", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course Start</label>
                    <input className={styles.fi} type="date" value={f.start_date} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course End</label>
                    <input className={styles.fi} type="date" value={f.end_date} onChange={e => set("end_date", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fees (₹)</label>
                    <input className={styles.fi} type="number" value={f.fees} onChange={e => set("fees", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Payment Status</label>
                    <select className={styles.fi} value={f.paid ? "paid" : "pending"} onChange={e => set("paid", e.target.value === "paid")}>
                        <option value="paid">✓ Paid</option>
                        <option value="pending">✗ Pending</option>
                    </select>
                </div>

                {/* Image upload */}
                <div className={`${styles.field} ${styles.full}`}>
                    <label className={styles.fieldLabel}>Certificate Image * (PNG/JPG)</label>
                    <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}
                        style={imgPrev ? { borderColor: "var(--gold2)" } : {}}>
                        {imgPrev
                            ? <img src={imgPrev} alt="preview" className={styles.uploadPreview} />
                            : <div className={styles.uploadPlaceholder}>
                                <span style={{ fontSize: "2rem" }}>📄</span>
                                <span>Click to upload the signed certificate image</span>
                                <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>PNG, JPG — of the actual signed certificate</span>
                            </div>
                        }
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                    </div>
                    {imgPrev && (
                        <button className={`${styles.btn} ${styles.btnGhost}`} style={{ marginTop: ".4rem", padding: ".5rem", fontSize: ".8rem" }}
                            onClick={() => { setImgFile(null); setImgPrev(null); fileRef.current.value = ""; }}>
                            × Remove image
                        </button>
                    )}
                </div>
            </div>

            {msg && <div className={msg.ok ? styles.msgOk : styles.msgErr}>{msg.t}</div>}
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={goConfirm1}>
                Next → Verify Certificate Number
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CERT LIST with DELETE
══════════════════════════════════════════════════════════════════════════════ */
function CertList({ onRefresh }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [delId, setDelId] = useState(null); // confirm delete modal
    const [delLoad, setDelLoad] = useState(false);
    const [sq, setSq] = useState("");

    const load = () => {
        setLoading(true);
        apiFetch("/students/").then(r => {
            setList(r.ok ? (Array.isArray(r.data) ? r.data : []) : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const doDelete = async () => {
        setDelLoad(true);
        const r = await apiFetch(`/students/${delId}/delete/`, { method: "DELETE" });
        setDelLoad(false);
        setDelId(null);
        if (r.ok) { load(); onRefresh(); }
        else alert("Delete failed.");
    };

    const filtered = sq.trim()
        ? list.filter(r => r.name.toLowerCase().includes(sq.toLowerCase()) || r.cert_no.includes(sq))
        : list;

    if (loading) return <div className={styles.emptyHint}>Loading…</div>;

    return (
        <div>
            <input className={styles.fieldInput} placeholder="Filter by name or cert no…"
                value={sq} onChange={e => setSq(e.target.value)} style={{ marginBottom: "1rem" }} />

            {/* Delete confirmation modal */}
            {delId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalTitle}>Delete Certificate?</div>
                        <p style={{ fontSize: ".88rem", color: "var(--muted)", margin: ".5rem 0 1.2rem", lineHeight: 1.6 }}>
                            This will permanently delete the student record and their certificate image. This cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button className={`${styles.btn} ${styles.btnDanger}`} style={{ flex: 1 }} onClick={doDelete} disabled={delLoad}>
                                {delLoad ? "Deleting…" : "Delete"}
                            </button>
                            <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }} onClick={() => setDelId(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.clist}>
                {filtered.length === 0 && <div className={styles.emptyHint}>No records found.</div>}
                {filtered.map(r => (
                    <div className={styles.clistItem} key={r.id}>
                        <div className={styles.clistAv}>{initials(r.name)}</div>
                        <div style={{ flex: 1 }}>
                            <div className={styles.clistName}>{r.name}</div>
                            <div className={styles.clistNo}>{r.cert_no} · {r.start_date} → {r.end_date}</div>
                        </div>
                        <div className={`${styles.paidBadge} ${r.paid ? styles.paidY : styles.paidN}`}>
                            {r.paid ? "Paid" : "Pending"}
                        </div>
                        <button className={styles.deleteBtn} onClick={() => setDelId(r.id)} title="Delete">🗑</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════════════════════════ */
function SettingsPanel({ cfg, setCfg }) {
    const [local, setLocal] = useState(cfg);
    const set = (k, v) => setLocal(x => ({ ...x, [k]: v }));
    return (
        <div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>Institute Details</div>
                <div className={styles.sgBody}>
                    {[["Institution Name", "institution"], ["Trainer Name", "trainerName"],
                    ["Udyam Registration No", "udyamNo"], ["Phone Number", "phone"]
                    ].map(([label, key]) => (
                        <div key={key}>
                            <label className={styles.fieldLabel}>{label}</label>
                            <input className={styles.fi} value={local[key] || ""} onChange={e => set(key, e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>Course &amp; App</div>
                <div className={styles.sgBody}>
                    <div>
                        <label className={styles.fieldLabel}>Course Rate (₹)</label>
                        <input className={styles.fi} type="number" value={local.courseRate} onChange={e => set("courseRate", e.target.value)} />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>App Theme</label>
                        <select className={styles.fi} value={local.theme} onChange={e => set("theme", e.target.value)}>
                            <option value="light">☀ Day (Light)</option>
                            <option value="dark">☾ Night (Dark)</option>
                        </select>
                    </div>
                </div>
            </div>
            <button className={`${styles.btn} ${styles.btnGold}`}
                onClick={() => { setCfg(local); alert("Settings saved!"); }}>
                Save Settings
            </button>
        </div>
    );
}