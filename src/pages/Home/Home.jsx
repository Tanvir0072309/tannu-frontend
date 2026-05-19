import { useState, useEffect } from "react";
import styles from "./Home.module.css";

/* ─── ENV ─────────────────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const MEDIA_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api$/, "");
const ADMIN_USER = import.meta.env.VITE_ADMIN_USERNAME || "Tannu@2006";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "6002@unnaT";

/* ─── UTILS ───────────────────────────────────────────────────────────────── */
const initials = (n) =>
    n
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const YEAR = new Date().getFullYear();

/* ─── LOGO SVG (fallback if assets/logo.png missing) ─────────────────────── */
function Logo({ size = 40 }) {
    return (
        <img
            src="/assets/logo.png"
            alt="Tannu Tailoring Logo"
            width={size}
            height={size}
            style={{ borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
            }}
        />
    );
}

function LogoFallback({ size = 40, bg = "#D4A820" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="50" r="50" fill={bg} />
            <path d="M50 48 L78 38 L80 43 L52 52Z" fill="#1C1208" />
            <path d="M50 52 L78 62 L80 57 L52 48Z" fill="#1C1208" />
            <circle cx="50" cy="50" r="4" fill="#1C1208" />
            <circle cx="50" cy="50" r="2" fill={bg} />
            <circle cx="30" cy="38" r="9" fill="none" stroke="#1C1208" strokeWidth="3.5" />
            <circle cx="30" cy="62" r="9" fill="none" stroke="#1C1208" strokeWidth="3.5" />
            <line x1="38" y1="42" x2="50" y2="48" stroke="#1C1208" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="38" y1="58" x2="50" y2="52" stroke="#1C1208" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

function MSMELogo({ size = 40 }) {
    const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
    return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#fff" stroke="#B8900A" strokeWidth="2" />
            <circle cx="40" cy="40" r="28" fill="#fff" stroke="#B8900A" strokeWidth="1" />
            {spokes.map((a) => (
                <line
                    key={a}
                    x1={40 + 11 * Math.cos((a * Math.PI) / 180)}
                    y1={40 + 11 * Math.sin((a * Math.PI) / 180)}
                    x2={40 + 22 * Math.cos((a * Math.PI) / 180)}
                    y2={40 + 22 * Math.sin((a * Math.PI) / 180)}
                    stroke="#B8900A"
                    strokeWidth="1.3"
                />
            ))}
            <circle cx="40" cy="40" r="11" fill="none" stroke="#B8900A" strokeWidth="1.3" />
            <circle cx="40" cy="40" r="3" fill="#B8900A" />
            <text x="40" y="60" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="6.5" fontWeight="600" fill="#B8900A">MSME</text>
            <text x="40" y="70" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="4.5" fill="#7A6030">REGISTERED</text>
        </svg>
    );
}

/* ─── ROOT APP ────────────────────────────────────────────────────────────── */
export default function App() {
    const [page, setPage] = useState("home");
    const [selected, setSelected] = useState(null);
    const [adminOk, setAdminOk] = useState(false);
    const [cfg, setCfg] = useState({
        courseRate: "499",
        udyamNo: "UDYAM-GJ-XXXXXXXX",
        trainerName: "Tanisha Pathan",
        institution: "Tannu Tailoring & Fashion Classes",
        phone: "",
        theme: "light",
    });
    const [statsData, setStatsData] = useState({ total: 0 });

    // Load stats + settings from backend
    useEffect(() => {
        fetch(`${API}/stats/`)
            .then((r) => r.json())
            .then((d) => setStatsData(d))
            .catch(() => { });
    }, []);

    useEffect(() => {
        document.body.className = cfg.theme === "dark" ? "dark" : "";
    }, [cfg.theme]);

    const nav = (p) => {
        setPage(p);
        setSelected(null);
    };
    const openCert = (cert) => {
        setSelected(cert);
        setPage("certView");
    };

    return (
        <div className={styles.shell}>
            <Nav nav={nav} cfg={cfg} setCfg={setCfg} />
            {page === "home" && (
                <HomePage nav={nav} cfg={cfg} statsData={statsData} />
            )}
            {page === "search" && (
                <SearchPage onOpen={openCert} />
            )}
            {page === "certView" && (
                <CertViewPage
                    cert={selected}
                    cfg={cfg}
                    onBack={() => nav("search")}
                />
            )}
            {page === "admin" &&
                (adminOk ? (
                    <AdminPanel cfg={cfg} setCfg={setCfg} onStatsUpdate={setStatsData} />
                ) : (
                    <LoginPage onAuth={() => setAdminOk(true)} />
                ))}
        </div>
    );
}

/* ─── NAV ─────────────────────────────────────────────────────────────────── */
function Nav({ nav, cfg, setCfg }) {
    return (
        <div className={styles.nav}>
            <div className={styles.navBrand} onClick={() => nav("home")}>
                <Logo size={36} />
                <LogoFallback size={36} bg="#D4A820" />
                <span className={styles.navTitle}>{cfg.institution || "Tannu Tailoring"}</span>
            </div>
            <button
                className={styles.navBtn}
                onClick={() =>
                    setCfg((c) => ({
                        ...c,
                        theme: c.theme === "dark" ? "light" : "dark",
                    }))
                }
            >
                {cfg.theme === "dark" ? "☀ Day" : "☾ Night"}
            </button>
        </div>
    );
}

/* ─── HOME PAGE ───────────────────────────────────────────────────────────── */
function HomePage({ nav, cfg, statsData }) {
    return (
        <div className={styles.home}>
            <div className={styles.hero}>
                <div className={styles.heroBadge}>
                    <MSMELogo size={18} /> MSME Registered Institute
                </div>

                <div className={styles.heroTitles}>
                    <div className={styles.heroTagline}>
                        Stitch Your <em>Future</em>
                        <br />
                        with Confidence
                    </div>
                    <div className={styles.heroSub}>
                        Professional tailoring &amp; cutting courses. Learn from certified
                        trainers, earn MSME-backed credentials.
                    </div>
                </div>

                <div className={styles.heroDivider} />

                <div className={styles.heroStats}>
                    <div className={styles.stat}>
                        <div className={styles.statN}>500+</div>
                        <div className={styles.statL}>Trained</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statN}>1 Month</div>
                        <div className={styles.statL}>Duration</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statN}>₹{cfg.courseRate}</div>
                        <div className={styles.statL}>Fees</div>
                    </div>
                </div>

                {/* Demo Certificate download */}
                <div className={styles.demoWrap}>
                    <img
                        src="../../assets/Tannu-certificate-demo.png"
                        alt="Sample Certificate"
                        className={styles.demoCert}
                        onError={(e) => (e.target.style.display = "none")}
                    />
                    <a
                        href="/assets/Tannu-certificate-demo.png"
                        download="Tannu-Certificate-Sample.png"
                        className={styles.demoBtn}
                    >
                        ⬇ Download Sample Certificate
                    </a>
                </div>

                {/* Two action cards */}
                <div className={styles.homeCards}>
                    <div className={styles.hcard} onClick={() => nav("search")}>
                        <div className={styles.hcardIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="17" y1="17" x2="22" y2="22" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                            </svg>
                        </div>
                        <div className={styles.hcardBody}>
                            <div className={styles.hcardTitle}>Get Verified</div>
                            <div className={styles.hcardDesc}>
                                Verify any certificate by student name or certificate number
                            </div>
                        </div>
                        <div className={styles.hcardArr}>›</div>
                    </div>

                    <div className={styles.hcard} onClick={() => nav("admin")}>
                        <div className={styles.hcardIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8900A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <line x1="7" y1="9" x2="17" y2="9" />
                                <line x1="7" y1="13" x2="13" y2="13" />
                                <circle cx="18" cy="17" r="3" />
                                <line x1="20.5" y1="19.5" x2="23" y2="22" />
                            </svg>
                        </div>
                        <div className={styles.hcardBody}>
                            <div className={styles.hcardTitle}>Get Certified</div>
                            <div className={styles.hcardDesc}>
                                Admin panel — issue new certificates &amp; manage student records
                            </div>
                        </div>
                        <div className={styles.hcardArr}>›</div>
                    </div>
                </div>
            </div>

            {/* Footer info strip */}
            <div className={styles.infoStrip}>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Institute</div>
                    <div className={styles.infoVal}>{cfg.institution}</div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Trainer</div>
                    <div className={styles.infoVal}>{cfg.trainerName}</div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Udyam No</div>
                    <div className={styles.infoVal}>{cfg.udyamNo}</div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Contact</div>
                    <div className={styles.infoVal}>
                        {cfg.phone ? (
                            <a href={`tel:${cfg.phone}`} style={{ color: "inherit" }}>
                                📞 {cfg.phone}
                            </a>
                        ) : (
                            "—"
                        )}
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Course Fee</div>
                    <div className={styles.infoVal}>₹{cfg.courseRate} (Paid)</div>
                </div>
            </div>
        </div>
    );
}

/* ─── SEARCH PAGE ─────────────────────────────────────────────────────────── */
function SearchPage({ onOpen }) {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const search = async () => {
        const lo = q.trim();
        if (!lo) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/students/?search=${encodeURIComponent(lo)}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : data.results || []);
        } catch {
            setResults([]);
        }
        setSearched(true);
        setLoading(false);
    };

    return (
        <div className={styles.pageWrap}>
            <div className={styles.pageHeading}>Verify Certificate</div>
            <div className={styles.pageHint}>
                Enter a student name or certificate number (e.g. STC-{YEAR}-001).
            </div>
            <div className={styles.searchCard}>
                <label className={styles.fieldLabel}>Name or Certificate Number</label>
                <input
                    className={styles.fieldInput}
                    placeholder={`Priya Sharma  or  STC-${YEAR}-001`}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                />
                <div style={{ height: ".7rem" }} />
                <button className={`${styles.btn} ${styles.btnGold}`} onClick={search} disabled={loading}>
                    {loading ? "Searching…" : "Search"}
                </button>
            </div>

            {searched &&
                (results.length === 0 ? (
                    <div className={styles.emptyHint}>
                        No certificate found. Please check the name or number.
                    </div>
                ) : (
                    <div className={styles.resultList}>
                        {results.map((r, i) => (
                            <div
                                key={r.id}
                                className={styles.rcard}
                                style={{ animationDelay: `${i * 0.09}s` }}
                                onClick={() => onOpen(r)}
                            >
                                <div className={styles.rcardAvatar}>{initials(r.name)}</div>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.rcardName}>{r.name}</div>
                                    <div className={styles.rcardNo}>{r.cert_no}</div>
                                    <div className={styles.rcardMeta}>
                                        {r.village} · {r.district}
                                    </div>
                                </div>
                                <div className={styles.rcardArr}>›</div>
                            </div>
                        ))}
                    </div>
                ))}
        </div>
    );
}

/* ─── CERTIFICATE DETAIL PAGE ─────────────────────────────────────────────── */
function CertViewPage({ cert, cfg, onBack }) {
    if (!cert) return null;
    const [dling, setDling] = useState(false);

    // Actual uploaded certificate image URL
    const imgUrl = cert.certificate_file
        ? `${MEDIA_BASE}/media/${cert.certificate_file}`
        : null;

    const handleDownload = async () => {
        setDling(true);
        try {
            const res = await fetch(`${API}/students/${cert.id}/certificate/`);
            if (!res.ok) throw new Error("Failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${cert.cert_no}_${cert.name.replace(/ /g, "_")}.png`;
            a.click();
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

            <div className={styles.pageHeading} style={{ marginBottom: ".2rem" }}>
                {cert.name}
            </div>
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
                    ["Payment", cert.paid ? "✓ Paid" : "✗ Pending"],
                ].map(([l, v]) => (
                    <div className={styles.ditem} key={l}>
                        <span className={styles.ditemLabel}>{l}</span>
                        <div className={styles.ditemVal}>{v || "—"}</div>
                    </div>
                ))}
            </div>

            {/* ── Actual uploaded certificate image ── */}
            {imgUrl ? (
                <div className={styles.certImageWrap}>
                    <img
                        src={imgUrl}
                        alt={`Certificate of ${cert.name}`}
                        className={styles.certImage}
                        onError={e => {
                            e.target.style.display = "none";
                            e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                        }}
                    />
                    <div className={styles.certImagePlaceholder} style={{ display: "none" }}>
                        ⚠ Image could not load. Check backend MEDIA settings.
                    </div>
                </div>
            ) : (
                <div className={styles.certImagePlaceholder}>
                    📄 No certificate image uploaded for this student.
                </div>
            )}

            {/* OLD CSS card replaced — now showing actual image above */}
            <div style={{ display: "none" }} className={styles.certCard}>
                <div className={`${styles.certCorner} ${styles.tl}`} />
                <div className={`${styles.certCorner} ${styles.tr}`} />
                <div className={`${styles.certCorner} ${styles.bl}`} />
                <div className={`${styles.certCorner} ${styles.br}`} />

                <div className={styles.certHead}>
                    <MSMELogo size={46} />
                    <div style={{ flex: 1 }}>
                        <div className={styles.certH1}>CERTIFICATE</div>
                        <div className={styles.certOf}>OF TRAINING</div>
                    </div>
                    <Logo size={46} />
                    <LogoFallback size={46} bg="#D4A820" />
                </div>

                <div className={styles.certGoldLine} />
                <div className={styles.certPresented}>
                    This Certificate Is Proudly Presented To
                </div>
                <div className={styles.certName}>{cert.name}</div>
                <div className={styles.certBodyText}>
                    This is to certify that <strong>{cert.name}</strong> has successfully
                    completed the One-Month Tailoring &amp; Cutting Certification Course
                    conducted from <strong>{cert.start_date}</strong> to{" "}
                    <strong>{cert.end_date}</strong>. During this program, the student
                    learned fabric cutting, stitching techniques, body measurements,
                    sewing machine handling, and garment finishing with dedication and
                    practical performance.
                </div>
                <div className={styles.certGoldLine} />

                <div className={styles.certFoot}>
                    <div className={styles.certInst}>
                        <div style={{ fontWeight: 600 }}>{cfg.institution}</div>
                        <div>An MSME Registered Institute</div>
                        <div>{cfg.udyamNo}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div
                            className={styles.certSigLine}
                            style={{ marginLeft: "auto" }}
                        />
                        <div className={styles.certSigName}>{cfg.trainerName}</div>
                        <div className={styles.certSigRole}>Founder &amp; Trainer</div>
                    </div>
                </div>

                <div className={styles.certNoLine}>
                    Certificate No: {cert.cert_no}
                </div>
            </div>

            <button
                className={`${styles.btn} ${styles.btnGold}`}
                style={{ marginTop: "1rem" }}
                onClick={handleDownload}
            >
                ⬇ Download Certificate
            </button>
        </div>
    );
}

/* ─── LOGIN PAGE ──────────────────────────────────────────────────────────── */
function LoginPage({ onAuth }) {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");

    const login = () => {
        if (u === ADMIN_USER && p === ADMIN_PASS) onAuth();
        else setErr("Invalid username or password.");
    };

    return (
        <div className={styles.loginBg}>
            <div className={styles.loginBox}>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <Logo size={58} />
                    <LogoFallback size={58} bg="#D4A820" />
                </div>
                <div className={styles.loginTitle}>Admin Login</div>
                <div className={styles.loginSub}>
                    Get Certified — Authorised Access Only
                </div>
                <div style={{ marginBottom: ".9rem" }}>
                    <label className={styles.fieldLabel}>Username</label>
                    <input
                        className={styles.fi}
                        placeholder="Username"
                        value={u}
                        onChange={(e) => setU(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: ".4rem" }}>
                    <label className={styles.fieldLabel}>Password</label>
                    <input
                        className={styles.fi}
                        type="password"
                        placeholder="Password"
                        value={p}
                        onChange={(e) => setP(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                    />
                </div>
                {err && <div className={styles.msgErr}>{err}</div>}
                <button className={`${styles.btn} ${styles.btnGold}`} onClick={login}>
                    Login
                </button>
            </div>
        </div>
    );
}

/* ─── ADMIN PANEL ─────────────────────────────────────────────────────────── */
function AdminPanel({ cfg, setCfg, onStatsUpdate }) {
    const [tab, setTab] = useState("add");

    return (
        <div className={styles.adminWrap}>
            <div className={styles.tabs}>
                {[
                    ["add", "+ Add Student"],
                    ["list", "All Certificates"],
                    ["settings", "⚙ Settings"],
                ].map(([k, l]) => (
                    <button
                        key={k}
                        className={`${styles.tab}${tab === k ? " " + styles.tabOn : ""}`}
                        onClick={() => setTab(k)}
                    >
                        {l}
                    </button>
                ))}
            </div>
            {tab === "add" && (
                <AddForm cfg={cfg} onAdded={onStatsUpdate} />
            )}
            {tab === "list" && <CertList />}
            {tab === "settings" && <Settings cfg={cfg} setCfg={setCfg} />}
        </div>
    );
}

/* ─── ADD FORM with confirmation ─────────────────────────────────────────── */
function AddForm({ cfg, onAdded }) {
    const blank = {
        name: "",
        phone: "",
        village: "",
        district: "",
        age: "",
        birthdate: "",
        start_date: "",
        end_date: "",
        fees: cfg.courseRate,
        paid: false,
    };
    const [f, setF] = useState(blank);
    const [msg, setMsg] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

    const handleSubmit = () => {
        if (!f.name.trim()) {
            setMsg({ ok: false, t: "Student name is required." });
            return;
        }
        setConfirm(true);
    };

    const confirmSubmit = async () => {
        try {
            const res = await fetch(`${API}/students/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(f),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg({ ok: true, t: `Certificate issued — ${data.cert_no}` });
                setF(blank);
                // refresh stats
                fetch(`${API}/stats/`).then(r => r.json()).then(onAdded).catch(() => { });
            } else {
                setMsg({ ok: false, t: JSON.stringify(data) });
            }
        } catch {
            setMsg({ ok: false, t: "Network error. Check backend." });
        }
        setConfirm(false);
    };

    if (confirm) {
        return (
            <div className={styles.confirmBox}>
                <div className={styles.confirmTitle}>Confirm Student Details</div>
                <div className={styles.confirmGrid}>
                    {Object.entries(f).map(([k, v]) => (
                        <div key={k} className={styles.confirmRow}>
                            <span className={styles.confirmKey}>{k.replace("_", " ")}</span>
                            <span className={styles.confirmVal}>{String(v)}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                        className={`${styles.btn} ${styles.btnGold}`}
                        style={{ flex: 1 }}
                        onClick={confirmSubmit}
                    >
                        ✓ Confirm & Issue
                    </button>
                    <button
                        className={`${styles.btn} ${styles.btnGhost}`}
                        style={{ flex: 1 }}
                        onClick={() => setConfirm(false)}
                    >
                        ← Edit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.full}`}>
                    <label className={styles.fieldLabel}>Full Name *</label>
                    <input
                        className={styles.fi}
                        placeholder="Student Full Name"
                        value={f.name}
                        onChange={(e) => set("name", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Phone</label>
                    <input
                        className={styles.fi}
                        placeholder="Mobile number"
                        value={f.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Age</label>
                    <input
                        className={styles.fi}
                        type="number"
                        placeholder="Age"
                        value={f.age}
                        onChange={(e) => set("age", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Birthdate</label>
                    <input
                        className={styles.fi}
                        type="date"
                        value={f.birthdate}
                        onChange={(e) => set("birthdate", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Village / City</label>
                    <input
                        className={styles.fi}
                        placeholder="Village or City"
                        value={f.village}
                        onChange={(e) => set("village", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>District</label>
                    <input
                        className={styles.fi}
                        placeholder="District"
                        value={f.district}
                        onChange={(e) => set("district", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course Start</label>
                    <input
                        className={styles.fi}
                        type="date"
                        value={f.start_date}
                        onChange={(e) => set("start_date", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Course End</label>
                    <input
                        className={styles.fi}
                        type="date"
                        value={f.end_date}
                        onChange={(e) => set("end_date", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fees (₹)</label>
                    <input
                        className={styles.fi}
                        type="number"
                        value={f.fees}
                        onChange={(e) => set("fees", e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.fieldLabel}>Payment</label>
                    <select
                        className={styles.fi}
                        value={f.paid ? "paid" : "pending"}
                        onChange={(e) => set("paid", e.target.value === "paid")}
                    >
                        <option value="paid">✓ Paid</option>
                        <option value="pending">✗ Pending</option>
                    </select>
                </div>
            </div>
            {msg && (
                <div className={msg.ok ? styles.msgOk : styles.msgErr}>{msg.t}</div>
            )}
            <button
                className={`${styles.btn} ${styles.btnGold}`}
                onClick={handleSubmit}
            >
                Review & Issue Certificate
            </button>
        </div>
    );
}

/* ─── CERT LIST ───────────────────────────────────────────────────────────── */
function CertList() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/students/`)
            .then((r) => r.json())
            .then((d) => setList(Array.isArray(d) ? d : d.results || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.emptyHint}>Loading…</div>;

    return (
        <div className={styles.clist}>
            {list.length === 0 && (
                <div className={styles.emptyHint}>No certificates issued yet.</div>
            )}
            {list.map((r) => (
                <div className={styles.clistItem} key={r.id}>
                    <div className={styles.clistAv}>{initials(r.name)}</div>
                    <div>
                        <div className={styles.clistName}>{r.name}</div>
                        <div className={styles.clistNo}>
                            {r.cert_no} · {r.start_date} → {r.end_date}
                        </div>
                    </div>
                    <div
                        className={`${styles.paidBadge} ${r.paid ? styles.paidY : styles.paidN
                            }`}
                    >
                        {r.paid ? "Paid" : "Pending"}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── SETTINGS ────────────────────────────────────────────────────────────── */
function Settings({ cfg, setCfg }) {
    const [local, setLocal] = useState(cfg);
    const set = (k, v) => setLocal((x) => ({ ...x, [k]: v }));
    const save = () => {
        setCfg(local);
        alert("Settings saved!");
    };

    return (
        <div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>Institute Details</div>
                <div className={styles.sgBody}>
                    <div>
                        <label className={styles.fieldLabel}>Institution Name</label>
                        <input
                            className={styles.fi}
                            value={local.institution}
                            onChange={(e) => set("institution", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Trainer Name</label>
                        <input
                            className={styles.fi}
                            value={local.trainerName}
                            onChange={(e) => set("trainerName", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Udyam Registration No</label>
                        <input
                            className={styles.fi}
                            value={local.udyamNo}
                            onChange={(e) => set("udyamNo", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Contact Phone Number</label>
                        <input
                            className={styles.fi}
                            placeholder="e.g. 9876543210"
                            value={local.phone || ""}
                            onChange={(e) => set("phone", e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.settingsGroup}>
                <div className={styles.sgHead}>Course &amp; App</div>
                <div className={styles.sgBody}>
                    <div>
                        <label className={styles.fieldLabel}>Course Rate (₹)</label>
                        <input
                            className={styles.fi}
                            type="number"
                            value={local.courseRate}
                            onChange={(e) => set("courseRate", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>App Theme</label>
                        <select
                            className={styles.fi}
                            value={local.theme}
                            onChange={(e) => set("theme", e.target.value)}
                        >
                            <option value="light">☀ Day (Light)</option>
                            <option value="dark">☾ Night (Dark)</option>
                        </select>
                    </div>
                </div>
            </div>
            <button className={`${styles.btn} ${styles.btnGold}`} onClick={save}>
                Save Settings
            </button>
        </div>
    );
}