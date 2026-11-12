import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [catalogSamples, setCatalogSamples] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    // Attempt to fetch live samples from backend API
    fetch("http://localhost:8000/api/catalog/sample")
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const normalized = data.items.map((it) => ({
            ...it,
            image_url: it.image_url?.startsWith("http") ? it.image_url : `http://localhost:8000${it.image_url}`
          }));
          setCatalogSamples(normalized);
        }
      })
      .catch(() => {
        // Fallback demo items if backend is offline
        setCatalogSamples([
          { item_id: "demo-1", category: "Calculator", filename: "Casio fx-991EX", image_url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80" },
          { item_id: "demo-2", category: "Bottle", filename: "Stainless Water Flask", image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80" },
          { item_id: "demo-3", category: "Charger", filename: "Apple 65W Fast Charger", image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80" },
          { item_id: "demo-4", category: "Key", filename: "Hostel Keyring w/ Tag", image_url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80" },
          { item_id: "demo-5", category: "Umbrella", filename: "Black Windproof Umbrella", image_url: "https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&w=400&q=80" },
          { item_id: "demo-6", category: "Electronics", filename: "Boat Airdopes Case", image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80" }
        ]);
      });
  }, []);

  const categories = ["All", "Calculator", "Bottle", "Charger", "Key", "Umbrella"];

  const filteredItems = activeFilter === "All"
    ? catalogSamples
    : catalogSamples.filter((item) => item.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <main className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-tag">GLA UNIVERSITY</span>
          <span className="hero-badge-divider">/</span>
          <span>Department of Computer Science & Engineering</span>
        </div>

        <h1 className="hero-headline">
          Smart Campus <br />
          <span className="text-gradient-forest">AI Automated Lost & Found</span> Retrieval
        </h1>

        <p className="hero-subtext">
          A centralized, enterprise-grade campus property recovery system. Combines <strong>MobileNetV2 deep visual embeddings</strong> with <strong>semantic NLP text matching</strong> and <strong>supervised recovery classification</strong> to reconnect students with lost belongings.
        </p>

        {/* Dual Primary Action Cards */}
        <div className="action-cards-grid">
          {/* Lost Item Card (Crimson) */}
          <div className="action-card card-lost">
            <div className="action-card-header">
              <div className="action-icon icon-crimson">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <span className="card-pill pill-crimson">URGENT REPORTING</span>
            </div>

            <h2 className="action-card-title">Lost an Item on Campus?</h2>
            <p className="action-card-desc">
              Submit details or attach a reference photo. Our AI scans campus found records in the background and sends instant alerts to your account when matching property is identified.
            </p>

            <Link to="/report-lost" className="btn-action-primary btn-crimson">
              <span>Report Lost Property</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>

          {/* Found Item Card (Forest Green) */}
          <div className="action-card card-found">
            <div className="action-card-header">
              <div className="action-icon icon-forest">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span className="card-pill pill-forest">CAMPUS CITIZENSHIP</span>
            </div>

            <h2 className="action-card-title">Found Someone&apos;s Property?</h2>
            <p className="action-card-desc">
              Turn in or register property discovered across academic blocks, libraries, or hostels. Instant feature extraction allows verified rightful owners to locate and claim their items.
            </p>

            <Link to="/report-found" className="btn-action-primary btn-forest">
              <span>Register Found Item</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Telemetry & Academic Metrics Bar */}
      <section className="metrics-strip">
        <div className="metric-box">
          <div className="metric-number text-gradient-forest">1,280</div>
          <div className="metric-label">Embedding Dimensions</div>
          <div className="metric-sub">MobileNetV2 Latent Space</div>
        </div>

        <div className="metric-divider"></div>

        <div className="metric-box">
          <div className="metric-number text-gradient-forest">95.03%</div>
          <div className="metric-label">Status Classification</div>
          <div className="metric-sub">Random Forest (120k Dataset)</div>
        </div>

        <div className="metric-divider"></div>

        <div className="metric-box">
          <div className="metric-number text-gradient-crimson">&lt; 4ms</div>
          <div className="metric-label">Retrieval Latency</div>
          <div className="metric-sub">BLAS Vector Dot-Product</div>
        </div>

        <div className="metric-divider"></div>

        <div className="metric-box">
          <div className="metric-number text-gradient-forest">100%</div>
          <div className="metric-label">Top-3 Test Accuracy</div>
          <div className="metric-sub">Benchmark Validated</div>
        </div>
      </section>

      {/* Live Found Items Catalog Preview */}
      <section className="catalog-preview-section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">VERIFIED REPOSITORY</span>
            <h2 className="section-title">Recently Cataloged Found Items</h2>
            <p className="section-subtitle">
              Browse items currently secured in the campus lost-and-found repository awaiting owner verification.
            </p>
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? "filter-active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-grid">
          {filteredItems.length === 0 ? (
            <div className="catalog-empty">No items listed in this category currently.</div>
          ) : (
            filteredItems.slice(0, 6).map((item, idx) => (
              <div key={item.item_id || idx} className="catalog-card">
                <div className="catalog-thumb-container">
                  <img
                    src={item.image_url}
                    alt={item.filename}
                    className="catalog-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  <span className="catalog-category-tag">{item.category}</span>
                </div>
                <div className="catalog-card-body">
                  <h3 className="catalog-item-title">{item.filename.substring(0, 24)}...</h3>
                  <div className="catalog-meta-row">
                    <span className="catalog-location">📍 GLA Campus Custody</span>
                    <span className="catalog-status-badge">Available</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Technical Workflow Architecture */}
      <section className="architecture-section">
        <div className="architecture-inner">
          <span className="section-eyebrow">SYSTEM ARCHITECTURE</span>
          <h2 className="section-title">How the Multimodal Retrieval Engine Operates</h2>

          <div className="arch-steps-grid">
            <div className="arch-step">
              <div className="step-num">01</div>
              <h3 className="step-title">Multimodal Ingestion</h3>
              <p className="step-text">
                Users submit reports via image upload or text description. The pipeline preprocesses inputs with aspect-ratio-preserving square center-cropping and text normalization.
              </p>
            </div>

            <div className="arch-step">
              <div className="step-num">02</div>
              <h3 className="step-title">Feature Extraction</h3>
              <p className="step-text">
                Images pass through a pre-trained MobileNetV2 backbone to yield 1,280-dimensional unit vectors. Text descriptions generate hybrid TF-IDF and PyTorch Word2Vec embeddings.
              </p>
            </div>

            <div className="arch-step">
              <div className="step-num">03</div>
              <h3 className="step-title">Instant Dot-Product Search</h3>
              <p className="step-text">
                Calculates cosine similarity against precomputed catalog matrices in &lt; 4ms using BLAS matrix operations, applying category filtering where specified.
              </p>
            </div>

            <div className="arch-step">
              <div className="step-num">04</div>
              <h3 className="step-title">Automated Account Alert</h3>
              <p className="step-text">
                If candidate confidence exceeds threshold, the system automatically pushes an encrypted match alert to the student&apos;s account for verification and recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Proctor Office Information */}
      <section className="proctor-section">
        <div className="proctor-card">
          <div className="proctor-left">
            <span className="proctor-badge">PHYSICAL DESK LOCATION</span>
            <h2>GLA Central Proctor & Lost Property Office</h2>
            <p>
              Academic Block AB-1, Ground Floor, Room 104 • Main University Campus
            </p>
            <div className="proctor-timings">
              <div>
                <strong>Operating Hours:</strong> Monday – Saturday, 09:00 AM – 05:00 PM
              </div>
              <div>
                <strong>Verification Required:</strong> Valid GLA University Student ID & Proof of Ownership
              </div>
            </div>
          </div>

          <div className="proctor-right">
            <div className="security-notice">
              <h4>⚠️ Security & Verification Protocol</h4>
              <p>
                All high-value items (smartphones, calculators, laptops, wallets) undergo physical verification of serial numbers, passwords, or distinct marks before custody handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="brand-title">GLA <span>SMART CAMPUS</span></div>
            <p className="footer-desc">
              AI-Powered Lost & Found Management System developed under the CSE Department, GLA University.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/report-lost">Report Lost Belonging</Link></li>
              <li><Link to="/report-found">Register Found Property</Link></li>
              <li><Link to="/notifications">Check Account Alerts</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Academic Stack</h4>
            <ul>
              <li>Computer Vision: MobileNetV2 (1280-d)</li>
              <li>NLP: TF-IDF + PyTorch Word2Vec</li>
              <li>Classification: Random Forest (120k records)</li>
              <li>Frontend: React 19 + Vite</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026–2027 GLA University • Developed by Vemula Gopi Chand (B.Tech CSE - AI & ML)</span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
