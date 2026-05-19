import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Home.module.css";

// ── Assets: Vite se proper import ────────────────────────────────────────────
import logoImg from "../../assets/logo.png";
import msmeImg from "../../assets/msme-logo.png";

/* ─── CONFIG (.env se) ───────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || "";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "";
const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api")
    .replace(/\/api\/?$/, "");

/* ─── JWT token helpers ──────────────────────────────────────────────────────── */
const TOKEN_KEY = "tannu_jwt";
const saveToken = t => localStorage.setItem(TOKEN_KEY, t);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/* ─── UTILS ──────────────────────────────────────────────────────────────────── */
const initials = (n = "") => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const YEAR = new Date().getFullYear();

// Age auto-calculate from birthdate
function calcAge(birthdate) {
    if (!birthdate) return "";
    const bd = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age > 0 ? String(age) : "";
}

// Add 1 month to a date string "YYYY-MM-DD"
function addOneMonth(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
}

// Min end date = start date + 1 month
function minEndDate(startDate) {
    return addOneMonth(startDate);
}

async function apiFetch(path, opts = {}) {
    const token = getToken();
    const headers = { ...(opts.headers || {}) };
    if (token && !headers["Content-Type"] && !(opts.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    const data = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
    return { ok: res.ok, status: res.status, data };
}

/* ─── SVG ICON LIBRARY (no emojis) ──────────────────────────────────────────── */
const Icon = {
    Search: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="17" y1="17" x2="22" y2="22" />
        </svg>
    ),
    Admin: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="9" x2="17" y2="9" />
            <line x1="7" y1="13" x2="13" y2="13" />
            <circle cx="17" cy="15" r="2.5" />
            <line x1="19" y1="17" x2="21" y2="19" />
        </svg>
    ),
    Info: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r=".5" fill="#B8900A" />
        </svg>
    ),
    Check: ({ color = "#2E6B2E" }) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Cross: ({ color = "#8A2A2A" }) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    Download: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    Trash: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    ),
    Upload: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#B8900A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    Certificate: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="#B8900A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
            <polyline points="9 12 12 15 15 12" />
        </svg>
    ),
    Success: () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#3A7A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    Warning: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#A33A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <circle cx="12" cy="17" r=".5" fill="#A33A3A" />
        </svg>
    ),
    Back: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Settings: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    List: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
    Moon: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    Sun: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    ),
};

/* ─── LOGO COMPONENTS ────────────────────────────────────────────────────────── */
function Logo({ size = 40 }) {
    return (
        <img src={logoImg} alt="Tannu Tailoring"
            width={size} height={size}
            style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />
    );
}
function MSMELogo({ size = 38 }) {
    return <img src={msmeImg} alt="MSME Registered" width={size} height={size} />;
}

/* ─── ROOT ───────────────────────────────────────────────────────────────────── */
export default function App() {
    const [page, setPage] = useState("home");
    const [selected, setSelected] = useState(null);
    const [adminOk, setAdminOk] = useState(!!getToken());
    const [stats, setStats] = useState({ total: 0, paid: 0 });
    const [cfg, setCfg] = useState({
        institution: "Tannu Tailoring & Fashion Classes",
        trainer_name: "Tanisha Pathan",
        udyam_no: "UDYAM-GJ-XXXXXXXX",
        phone: "", course_rate: "499", theme: "light",
    });

    const fetchStats = useCallback(() => apiFetch("/stats/").then(r => r.ok && setStats(r.data)).catch(() => { }), []);
    const fetchSettings = useCallback(() => apiFetch("/settings/").then(r => r.ok && setCfg(p => ({ ...p, ...r.data }))).catch(() => { }), []);

    useEffect(() => { fetchStats(); fetchSettings(); }, []);
    useEffect(() => { document.body.className = cfg.theme === "dark" ? "dark" : ""; }, [cfg.theme]);
    useEffect(() => { document.title = "Tannu Tailoring"; }, []);

    const nav = p => { setPage(p); setSelected(null); };
    const openCert = c => { setSelected(c); setPage("certView"); };

    const handleAuth = () => setAdminOk(true);
    const handleLogout = () => { clearToken(); setAdminOk(false); nav("home"); };

    return (
        <div className={styles.shell}>
            <Nav nav={nav} cfg={cfg} setCfg={setCfg} adminOk={adminOk} onLogout={handleLogout} />
            {page === "home" && <HomePage nav={nav} cfg={cfg} stats={stats} />}
            {page === "search" && <SearchPage onOpen={openCert} />}
            {page === "certView" && <CertViewPage cert={selected} onBack={() => nav("search")} />}
            {page === "admin" && (adminOk
                ? <AdminPanel cfg={cfg} setCfg={setCfg} onRefresh={() => { fetchStats(); fetchSettings(); }} onLogout={handleLogout} />
                : <LoginPage onAuth={handleAuth} />
            )}
        </div>
    );
}

/* ─── NAV ────────────────────────────────────────────────────────────────────── */
function Nav({ nav, cfg, setCfg, adminOk, onLogout }) {
    return (
        <nav className={styles.nav}>
            <div className={styles.navBrand} onClick={() => nav("home")}>
                <Logo size={34} />
                <span className={styles.navTitle}>Tannu Tailoring</span>
            </div>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <button className={styles.navBtn}
                    onClick={() => setCfg(c => ({ ...c, theme: c.theme === "dark" ? "light" : "dark" }))}>
                    {cfg.theme === "dark" ? <><Icon.Sun /> Day</> : <><Icon.Moon /> Night</>}
                </button>
                {adminOk && (
                    <button className={styles.navBtn} onClick={onLogout}
                        style={{ borderColor: "rgba(163,58,58,.4)", color: "#A33A3A" }}>
                        Logout
                    </button>
                )}
            </div>
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
            alert("Sample certificate not found on server.");
        }
    };

    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <div className={styles.heroBadge}><MSMELogo size={16} /> MSME Registered Institute</div>

                {/* Sewing machine illustration */}
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
                    <div className={styles.stat}><div className={styles.statN}>₹{cfg.course_rate}</div><div className={styles.statL}>Fees</div></div>
                </div>

                <div className={styles.demoWrap}>
                    <img src="/assets/Tannu-certificate-demo.png" alt="Sample Certificate"
                        className={styles.demoCert} onError={e => e.target.style.display = "none"} />
                    <button className={styles.demoBtn} onClick={dlSample}>
                        <Icon.Download /> Download Sample Certificate
                    </button>
                </div>

                <div className={styles.homeCards}>
                    {[
                        { title: "Get Verified", desc: "Verify any certificate by name or cert number", page: "search", icon: <Icon.Search /> },
                        { title: "Get Certified", desc: "Admin — upload & manage student certificates", page: "admin", icon: <Icon.Admin /> },
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

            {/* Footer — backend DB se */}
            <div className={styles.infoStrip}>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Institute</div><div className={styles.infoVal}>{cfg.institution}</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Trainer</div><div className={styles.infoVal}>{cfg.trainer_name} · Founder</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Udyam No</div><div className={styles.infoVal}>{cfg.udyam_no}</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Phone</div><div className={styles.infoVal}>{cfg.phone || "—"}</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Total Certified</div><div className={styles.infoVal}>{stats.total} Students</div></div>
                <div className={styles.infoItem}><div className={styles.infoLabel}>Paid</div><div className={styles.infoVal}>{stats.paid} / {stats.total}</div></div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE 2 — SEARCH
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
        const val = e.target.value; setQ(val);
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
                            style={{ animationDelay: `${i * 0.06}s` }} onClick={() => onOpen(r)}>
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
   PAGE 3 — CERTIFICATE DETAIL
══════════════════════════════════════════════════════════════════════════════ */
function CertViewPage({ cert, onBack }) {
    if (!cert) return null;
    const [dling, setDling] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        setImgErr(false);
        if (cert.certificate_file) {
            const isFullUrl = cert.certificate_file.startsWith("http");
            setImgSrc(isFullUrl
                ? cert.certificate_file
                : `${MEDIA_BASE}/media/${cert.certificate_file}`);
        } else { setImgSrc(null); }
    }, [cert]);

    const download = async () => {
        setDling(true);
        try {
            // If Cloudinary URL — direct download
            if (imgSrc && imgSrc.startsWith("http")) {
                const res = await fetch(imgSrc);
                const url = URL.createObjectURL(await res.blob());
                Object.assign(document.createElement("a"), {
                    href: url, download: `${cert.cert_no}_${cert.name.replace(/ /g, "_")}.png`
                }).click();
                URL.revokeObjectURL(url);
            } else {
                const res = await fetch(`${API}/students/${cert.id}/certificate/`);
                if (!res.ok) throw new Error((await res.json()).error || "Failed");
                const url = URL.createObjectURL(await res.blob());
                Object.assign(document.createElement("a"), {
                    href: url, download: `${cert.cert_no}_${cert.name.replace(/ /g, "_")}.png`
                }).click();
                URL.revokeObjectURL(url);
            }
        } catch (e) { alert("Download failed: " + e.message); }
        setDling(false);
    };

    return (
        <div className={styles.certDetail}>
            <button className={`${styles.btn} ${styles.btnGhost}`}
                style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".4rem" }}
                onClick={onBack}>
                <Icon.Back /> Back to search
            </button>

            <div className={styles.pageHeading}>{cert.name}</div>
            <div className={styles.certNoLabel}>{cert.cert_no}</div>

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
                    ["Payment", cert.paid
                        ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Check />Paid</span>
                        : <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Cross />Pending</span>],
                ].map(([l, v]) => (
                    <div className={styles.ditem} key={l}>
                        <span className={styles.ditemLabel}>{l}</span>
                        <div className={styles.ditemVal}>{v || "—"}</div>
                    </div>
                ))}
            </div>

            {imgSrc && !imgErr ? (
                <div className={styles.certImageWrap}>
                    <img src={imgSrc} alt={`Certificate — ${cert.name}`}
                        className={styles.certImage} onError={() => setImgErr(true)} />
                </div>
            ) : imgErr ? (
                <div className={styles.certImagePlaceholder}>
                    <Icon.Warning />
                    <span>Image load nahi ho rahi</span>
                    <small style={{ opacity: .6 }}>{imgSrc}</small>
                </div>
            ) : (
                <div className={styles.certImagePlaceholder}>
                    <Icon.Certificate />
                    <span>Is student ka certificate image upload nahi hua.</span>
                </div>
            )}

            {imgSrc && !imgErr && (
                <button className={`${styles.btn} ${styles.btnGold}`}
                    onClick={download} disabled={dling}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
                    <Icon.Download /> {dling ? "Downloading…" : "Download Certificate"}
                </button>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LOGIN — JWT token backend se lega
══════════════════════════════════════════════════════════════════════════════ */
function LoginPage({ onAuth }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const tryLogin = async () => {
        if (!u || !p) { setErr("Username aur password dono required hain."); return; }
        setLoading(true); setErr("");

        // Step 1: .env credentials check (frontend guard)
        if (u !== ADMIN_USER || p !== ADMIN_PASS) {
            setErr("Wrong username or password."); setLoading(false); return;
        }

        // Step 2: Backend se JWT token lo
        try {
            const res = await fetch(`${API}/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p }),
            });
            if (res.ok) {
                const data = await res.json();
                saveToken(data.access);
                onAuth();
            } else {
                // Backend nahi mila ya token endpoint nahi hai — local auth se kaam chala lo
                saveToken("local-auth-" + Date.now());
                onAuth();
            }
        } catch {
            // Backend unreachable — local auth
            saveToken("local-auth-" + Date.now());
            onAuth();
        }
        setLoading(false);
    };

    return (
        <div className={styles.loginBg}>
            <div className={styles.loginBox}>
                <div style={{ display: "flex", justifyContent: "center" }}><Logo size={58} /></div>
                <div className={styles.loginTitle}>Admin Login</div>
                <div className={styles.loginSub}>Get Certified — Authorised Access Only</div>
                <div style={{ marginBottom: ".9rem" }}>
                    <label className={styles.fieldLabel}>Username</label>
                    <input className={styles.fi} placeholder="Username"
                        value={u} onChange={e => setU(e.target.value)} />
                </div>
                <div style={{ marginBottom: ".4rem" }}>
                    <label className={styles.fieldLabel}>Password</label>
                    <input className={styles.fi} type="password" placeholder="Password"
                        value={p} onChange={e => setP(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && tryLogin()} />
                </div>
                {err && <div className={styles.msgErr} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}><Icon.Warning />{err}</div>}
                <button className={`${styles.btn} ${styles.btnGold}`}
                    onClick={tryLogin} disabled={loading}>
                    {loading ? "Logging in…" : "Login"}
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
                {[
                    ["add", <><Icon.Plus />  Upload Certificate</>],
                    ["list", <><Icon.List />  All Certificates</>],
                    ["settings", <><Icon.Settings /> Settings</>],
                ].map(([k, l]) => (
                    <button key={k}
                        className={`${styles.tab}${tab === k ? " " + styles.tabOn : ""}`}
                        onClick={() => setTab(k)}>{l}
                    </button>
                ))}
            </div>
            {tab === "add" && <UploadForm cfg={cfg} onAdded={onRefresh} />}
            {tab === "list" && <CertList onRefresh={onRefresh} />}
            {tab === "settings" && <SettingsPanel cfg={cfg} setCfg={setCfg} />}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   UPLOAD FORM
══════════════════════════════════════════════════════════════════════════════ */
function UploadForm({ cfg, onAdded }) {
    const blank = {
        name: "", phone: "", village: "", district: "",
        age: "", birthdate: "", start_date: "", end_date: "",
        fees: cfg.course_rate || "499",
        paid: true,   // ← default PAID
    };
    const [f, setF] = useState(blank);
    const [certNo, setCertNo] = useState("");
    const [imgFile, setImgFile] = useState(null);
    const [imgPrev, setImgPrev] = useState(null);
    const [step, setStep] = useState("form");
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();

    useEffect(() => {
        apiFetch("/next-cert-no/").then(r => r.ok && setCertNo(r.data.cert_no));
    }, []);

    const set = (k, v) => setF(x => ({ ...x, [k]: v }));

    // Birthdate change → auto-calculate age
    const handleBirthdate = (val) => {
        set("birthdate", val);
        const age = calcAge(val);
        if (age) set("age", age);
    };

    // Start date change → auto-set end date to +1 month
    const handleStartDate = (val) => {
        set("start_date", val);
        if (val) set("end_date", addOneMonth(val));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImgFile(file); setImgPrev(URL.createObjectURL(file));
    };

    const validate = () => {
        if (!f.name.trim()) return "Student name is required.";
        if (!imgFile) return "Please upload the certificate image.";
        if (!certNo) return "Certificate number not loaded. Refresh.";
        if (f.start_date && f.end_date && f.end_date < minEndDate(f.start_date))
            return `End date must be at least 1 month after start date (min: ${minEndDate(f.start_date)}).`;
        return null;
    };

    const goConfirm1 = () => {
        const err = validate();
        if (err) { setMsg({ ok: false, t: err }); return; }
        setMsg(null); setStep("confirm1");
    };

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
            setMsg({ ok: true, t: `Certificate saved — ${certNo}` });
            setF(blank); setImgFile(null); setImgPrev(null);
            onAdded();
            apiFetch("/next-cert-no/").then(x => x.ok && setCertNo(x.data.cert_no));
        } else {
            setMsg({ ok: false, t: Object.values(r.data).flat().join(" ") });
            setStep("form");
        }
        setLoading(false);
    };

    // ── DONE ──
    if (step === "done") return (
        <div className={styles.confirmBox}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><Icon.Success /></div>
            <div className={styles.confirmTitle}>Certificate Saved Successfully</div>
            {msg && <div className={styles.msgOk}>{msg.t}</div>}
            <button className={`${styles.btn} ${styles.btnGold}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}
                onClick={() => { setStep("form"); setMsg(null); }}>
                <Icon.Plus /> Add Another
            </button>
        </div>
    );

    // ── CONFIRM 2 ──
    if (step === "confirm2") return (
        <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Step 2 of 2 — Confirm All Details</div>
            <div className={styles.confirmGrid}>
                {[
                    ["Certificate No", certNo], ["Name", f.name], ["Phone", f.phone],
                    ["Age", f.age ? `${f.age} years` : "—"], ["Birthdate", f.birthdate],
                    ["Village", f.village], ["District", f.district],
                    ["Start Date", f.start_date], ["End Date", f.end_date],
                    ["Fees", `₹${f.fees}`], ["Paid", f.paid ? "Yes" : "No"],
                    ["Image", imgFile?.name || "—"],
                ].map(([k, v]) => (
                    <div key={k} className={styles.confirmRow}>
                        <span className={styles.confirmKey}>{k}</span>
                        <span className={styles.confirmVal}>{v || "—"}</span>
                    </div>
                ))}
            </div>
            {imgPrev && <img src={imgPrev} alt="preview"
                style={{ width: "100%", borderRadius: 8, marginTop: "1rem", border: "1px solid var(--border)" }} />}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button className={`${styles.btn} ${styles.btnGold}`} style={{ flex: 1 }}
                    onClick={submit} disabled={loading}>
                    {loading ? "Saving…" : <><Icon.Check color="#1C1208" /> Confirm & Save</>}
                </button>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }}
                    onClick={() => setStep("confirm1")}>
                    <Icon.Back /> Back
                </button>
            </div>
        </div>
    );

    // ── CONFIRM 1 ──
    if (step === "confirm1") return (
        <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Step 1 of 2 — Verify Certificate Number</div>
            <p style={{ fontSize: ".88rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                System ne <strong>{f.name}</strong> ke liye yeh certificate number generate kiya hai.
                Confirm karo ki uploaded image par yahi number likha hai.
            </p>
            <div className={styles.certNoBig}>{certNo}</div>
            {imgPrev && (
                <img src={imgPrev} alt="uploaded cert"
                    style={{
                        width: "100%", borderRadius: 8, margin: "1rem 0",
                        border: "2px solid var(--gold2)", maxHeight: 220, objectFit: "contain"
                    }} />
            )}
            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: "1rem" }}>
                Kya certificate image mein <strong>{certNo}</strong> likha hai?
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
                <button className={`${styles.btn} ${styles.btnGold}`} style={{ flex: 1 }}
                    onClick={() => setStep("confirm2")}>
                    <Icon.Check color="#1C1208" /> Yes, it matches
                </button>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }}
                    onClick={() => setStep("form")}>
                    <Icon.Cross color="#A33A3A" /> No, go back
                </button>
            </div>
        </div>
    );

    // ── FORM ──
    return (
        <div>
            <div className={styles.certNoPreview}>
                <span className={styles.certNoLabel2}>Auto-Generated Certificate No</span>
                <span className={styles.certNoBig}>{certNo || "Loading…"}</span>
                <span className={styles.certNoHint}>Write this on the physical certificate before uploading.</span>
            </div>

            <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.full}`}>
                    <label className={styles.fieldLabel}>Full Name *</label>
                    <input className={styles.fi} placeholder="Student Full Name"
                        value={f.name} onChange={e => set("name", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Phone</label>
                    <input className={styles.fi} placeholder="Mobile number"
                        value={f.phone} onChange={e => set("phone", e.target.value)} />
                </div>

                {/* Birthdate → Age auto */}
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Birthdate</label>
                    <input className={`${styles.fi} ${styles.dateInput}`} type="date"
                        value={f.birthdate} onChange={e => handleBirthdate(e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Age (years) — auto</label>
                    <input className={styles.fi} type="number" placeholder="Auto from birthdate"
                        value={f.age} onChange={e => set("age", e.target.value)}
                        style={{ background: "var(--cream)" }} />
                </div>

                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Village / City</label>
                    <input className={styles.fi} placeholder="Village or City"
                        value={f.village} onChange={e => set("village", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>District</label>
                    <input className={styles.fi} placeholder="District"
                        value={f.district} onChange={e => set("district", e.target.value)} />
                </div>

                {/* Start date → end date auto +1 month */}
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course Start</label>
                    <input className={`${styles.fi} ${styles.dateInput}`} type="date"
                        value={f.start_date} onChange={e => handleStartDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course End (min +1 month)</label>
                    <input className={`${styles.fi} ${styles.dateInput}`} type="date"
                        value={f.end_date}
                        min={f.start_date ? minEndDate(f.start_date) : undefined}
                        onChange={e => set("end_date", e.target.value)} />
                </div>

                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fees (₹)</label>
                    <input className={styles.fi} type="number"
                        value={f.fees} onChange={e => set("fees", e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Payment Status</label>
                    <select className={styles.fi}
                        value={f.paid ? "paid" : "pending"}
                        onChange={e => set("paid", e.target.value === "paid")}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div className={`${styles.field} ${styles.full}`}>
                    <label className={styles.fieldLabel}>Certificate Image * (PNG/JPG)</label>
                    <div className={styles.uploadArea} onClick={() => fileRef.current?.click()}
                        style={imgPrev ? { borderColor: "var(--gold2)" } : {}}>
                        {imgPrev
                            ? <img src={imgPrev} alt="preview" className={styles.uploadPreview} />
                            : <div className={styles.uploadPlaceholder}>
                                <Icon.Upload />
                                <span>Click to upload the signed certificate image</span>
                                <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>PNG or JPG</span>
                            </div>
                        }
                        <input ref={fileRef} type="file" accept="image/*"
                            style={{ display: "none" }} onChange={handleFile} />
                    </div>
                    {imgPrev && (
                        <button className={`${styles.btn} ${styles.btnGhost}`}
                            style={{
                                marginTop: ".4rem", padding: ".5rem", fontSize: ".8rem",
                                display: "flex", alignItems: "center", gap: ".3rem"
                            }}
                            onClick={() => { setImgFile(null); setImgPrev(null); fileRef.current.value = ""; }}>
                            <Icon.Cross /> Remove image
                        </button>
                    )}
                </div>
            </div>

            {msg && <div className={msg.ok ? styles.msgOk : styles.msgErr}>{msg.t}</div>}
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={goConfirm1}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
                Next → Verify Certificate Number
            </button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CERT LIST
══════════════════════════════════════════════════════════════════════════════ */
function CertList({ onRefresh }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [delId, setDelId] = useState(null);
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
        setDelLoad(false); setDelId(null);
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

            {delId && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox}>
                        <div className={styles.modalTitle}>Delete Certificate?</div>
                        <p style={{ fontSize: ".88rem", color: "var(--muted)", margin: ".5rem 0 1.2rem", lineHeight: 1.6 }}>
                            This will permanently delete the student record and certificate image. Cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button className={`${styles.btn} ${styles.btnDanger}`} style={{ flex: 1 }}
                                onClick={doDelete} disabled={delLoad}>
                                {delLoad ? "Deleting…" : <><Icon.Trash /> Delete</>}
                            </button>
                            <button className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1 }}
                                onClick={() => setDelId(null)}>Cancel</button>
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
                        <div className={`${styles.paidBadge} ${r.paid ? styles.paidY : styles.paidN}`}
                            style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            {r.paid ? <><Icon.Check color="#2E6B2E" />Paid</> : <><Icon.Cross color="#8A2A2A" />Pending</>}
                        </div>
                        <button className={styles.deleteBtn} onClick={() => setDelId(r.id)}
                            title="Delete"><Icon.Trash /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SETTINGS — backend DB mein save
══════════════════════════════════════════════════════════════════════════════ */
function SettingsPanel({ cfg, setCfg }) {
    const [local, setLocal] = useState({ ...cfg });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => { setLocal({ ...cfg }); }, [cfg]);
    const set = (k, v) => setLocal(x => ({ ...x, [k]: v }));

    const save = async () => {
        setSaving(true); setMsg(null);
        try {
            const r = await apiFetch("/settings/update/", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    institution: local.institution,
                    trainer_name: local.trainer_name,
                    udyam_no: local.udyam_no,
                    phone: local.phone,
                    course_rate: local.course_rate,
                }),
            });
            if (r.ok) {
                setCfg(p => ({ ...p, ...r.data }));
                setMsg({ ok: true, t: "Settings saved to database successfully." });
            } else {
                setMsg({ ok: false, t: "Failed to save. Please try again." });
            }
        } catch {
            setMsg({ ok: false, t: "Network error. Is the backend running?" });
        }
        setSaving(false);
    };

    return (
        <div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>Institute Details</div>
                <div className={styles.sgBody}>
                    {[
                        ["Institution Name", "institution"],
                        ["Trainer Name", "trainer_name"],
                        ["Udyam Registration No", "udyam_no"],
                        ["Phone Number", "phone"],
                        ["Course Rate (₹)", "course_rate"],
                    ].map(([label, key]) => (
                        <div key={key}>
                            <label className={styles.fieldLabel}>{label}</label>
                            <input className={styles.fi}
                                type={key === "course_rate" ? "number" : "text"}
                                value={local[key] || ""}
                                onChange={e => set(key, e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>App Theme</div>
                <div className={styles.sgBody}>
                    <div>
                        <label className={styles.fieldLabel}>Theme</label>
                        <select className={styles.fi} value={local.theme || "light"}
                            onChange={e => set("theme", e.target.value)}>
                            <option value="light">Day (Light)</option>
                            <option value="dark">Night (Dark)</option>
                        </select>
                    </div>
                </div>
            </div>
            {msg && <div className={msg.ok ? styles.msgOk : styles.msgErr}
                style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                {msg.ok ? <Icon.Check /> : <Icon.Warning />}{msg.t}
            </div>}
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={save} disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
                {saving ? "Saving…" : <><Icon.Check color="#1C1208" /> Save Settings</>}
            </button>
        </div>
    );
}