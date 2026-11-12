import { useState } from "react";
import { Link } from "react-router-dom";

function ReportLost() {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Calculator",
    description: "",
    location: "GLA Central Library",
    customLocation: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matchesFoundCount, setMatchesFoundCount] = useState(0);

  const categories = [
    "Calculator",
    "Bottle",
    "Charger",
    "Key",
    "Umbrella",
    "Electronics",
    "Books & Stationery",
    "Wallets & ID Cards",
    "Clothing & Accessories",
    "Other"
  ];

  const campusLocations = [
    "GLA Central Library (Ground/1st/2nd Floor)",
    "Academic Block AB-1 (Classrooms/Labs)",
    "Academic Block AB-2 (Auditorium)",
    "Academic Block AB-3 (Computer Labs)",
    "Central Canteen & Cafeteria",
    "Boys Hostel Block (Hostels 1-6)",
    "Girls Hostel Block (Hostels 1-3)",
    "University Main Gate & Parking",
    "Convocation Hall & Grounds",
    "Sports Complex & Basketball Court",
    "Other Campus Area"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportId = "LOST-" + Date.now().toString(36).toUpperCase();
    const finalLocation = formData.location === "Other Campus Area" && formData.customLocation
      ? formData.customLocation
      : formData.location;

    const newReport = {
      id: reportId,
      itemName: formData.itemName,
      category: formData.category,
      description: formData.description,
      location: finalLocation,
      date: formData.date,
      createdAt: new Date().toLocaleString(),
      status: "Active Surveillance",
      hasImage: !!imageFile
    };

    // Save report to campus_reports history
    const existingReports = JSON.parse(localStorage.getItem("campus_reports") || "[]");
    existingReports.unshift(newReport);
    localStorage.setItem("campus_reports", JSON.stringify(existingReports));

    let detectedMatches = [];

    // Background AI Matching (User does not see matches while creating the report)
    if (imageFile) {
      try {
        const body = new FormData();
        body.append("file", imageFile);

        const catParam = formData.category ? `&category=${encodeURIComponent(formData.category)}` : "";
        const response = await fetch(`http://localhost:8000/api/match-image?top_k=3${catParam}`, {
          method: "POST",
          body: body
        });

        if (response.ok) {
          const data = await response.json();
          detectedMatches = data.matches || [];
        }
      } catch (err) {
        console.warn("Background vision matching service note:", err);
      }
    } else {
      // Background Semantic NLP matching if no photo was attached
      try {
        const queryText = `${formData.itemName} ${formData.description} lost at ${finalLocation}`;
        const catParam = formData.category ? `&category=${encodeURIComponent(formData.category)}` : "";
        const response = await fetch(`http://localhost:8000/api/match-text?description=${encodeURIComponent(queryText)}&top_k=3${catParam}`);
        if (response.ok) {
          const data = await response.json();
          detectedMatches = data.matches || [];
        }
      } catch (err) {
        console.warn("Background text matching service note:", err);
      }
    }

    // If matches detected, generate in-account notification
    if (detectedMatches.length > 0) {
      setMatchesFoundCount(detectedMatches.length);

      const newNotification = {
        id: "NOTIF-" + Date.now(),
        reportId: reportId,
        itemName: formData.itemName,
        category: formData.category,
        date: new Date().toLocaleString(),
        read: false,
        matches: detectedMatches
      };

      const existingNotifs = JSON.parse(localStorage.getItem("campus_notifications") || "[]");
      existingNotifs.unshift(newNotification);
      localStorage.setItem("campus_notifications", JSON.stringify(existingNotifs));

      // Trigger custom event so Navbar badge updates immediately
      window.dispatchEvent(new Event("notifications_updated"));
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "Calculator",
      description: "",
      location: "GLA Central Library",
      customLocation: "",
      date: new Date().toISOString().split("T")[0]
    });
    setImageFile(null);
    setImagePreview(null);
    setSubmitted(false);
    setMatchesFoundCount(0);
  };

  return (
    <div className="page-shell">
      <div className="form-card-container">
        {/* Header Breadcrumb */}
        <div className="form-page-header header-crimson">
          <div className="header-badge-row">
            <span className="badge-pill-crimson">INCIDENT REGISTRATION</span>
            <span className="reference-code">FORM REF: LF-LOST-2026</span>
          </div>
          <h1 className="form-page-title">Report a Lost Item</h1>
          <p className="form-page-subtitle">
            Submit accurate details and attach an optional reference image. Our multi-modal AI models will automatically monitor campus found repository records and alert you upon detection.
          </p>
        </div>

        {submitted ? (
          <div className="submission-success-card">
            <div className="success-icon-wrapper icon-crimson-glow">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="success-title">Incident Report Successfully Logged</h2>
            <p className="success-subtitle">
              Your report for <strong>{formData.itemName}</strong> has been assigned to active automated surveillance in the campus registry.
            </p>

            <div className="ai-status-summary-box">
              <div className="ai-summary-header">
                <span className="ai-pulse-dot"></span>
                <strong>AI Multi-Modal Retrieval Engine Status</strong>
              </div>
              <p className="ai-summary-desc">
                The deep visual feature embedder (MobileNetV2) and semantic text vectorizer (TF-IDF + CBOW) processed your report across active found item inventory.
              </p>
              {matchesFoundCount > 0 ? (
                <div className="match-detected-alert">
                  🎯 <strong>{matchesFoundCount} potential match candidate(s)</strong> were identified! An alert has been pushed to your account notifications with photo comparisons.
                </div>
              ) : (
                <div className="no-match-alert">
                  ⏳ No immediate matches were found in current inventory. You will receive an instant push notification the moment someone turns in an item matching this description.
                </div>
              )}
            </div>

            <div className="success-actions-row">
              <Link to="/notifications" className="btn-action-primary btn-forest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>View Account Alerts ({matchesFoundCount})</span>
              </Link>
              <button onClick={resetForm} className="btn-secondary-ghost">
                Report Another Item
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="custom-app-form">
            {/* Primary Details Grid */}
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="input-label">
                  Item Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  name="itemName"
                  placeholder="e.g. Casio fx-991EX Scientific Calculator"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                  className="text-input-field"
                />
              </div>

              <div className="form-group">
                <label className="input-label">
                  Item Category <span className="req-star">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select-input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Date Grid */}
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="input-label">
                  Campus Location Lost <span className="req-star">*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="select-input-field"
                >
                  {campusLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>

                {formData.location === "Other Campus Area" && (
                  <input
                    type="text"
                    name="customLocation"
                    placeholder="Specify exact location or room number..."
                    value={formData.customLocation}
                    onChange={handleInputChange}
                    className="text-input-field mt-sm"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="input-label">
                  Date of Incident <span className="req-star">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="text-input-field"
                />
              </div>
            </div>

            {/* Comprehensive Description */}
            <div className="form-group">
              <label className="input-label">
                Detailed Physical Description
              </label>
              <textarea
                name="description"
                placeholder="Include color, brand, stickers, scratches, case details, serial marks, or unique identifying features..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="textarea-input-field"
              ></textarea>
              <span className="input-helper-text">
                💡 Tip: Specific keywords like brand (&quot;Nike&quot;, &quot;Milton&quot;, &quot;Casio&quot;) and color improve semantic matching accuracy.
              </span>
            </div>

            {/* Image Upload Dropzone */}
            <div className="form-group">
              <label className="input-label">
                Reference Photo (Optional, Recommended for AI Visual Search)
              </label>

              {imagePreview ? (
                <div className="uploaded-preview-card">
                  <img src={imagePreview} alt="Uploaded item preview" className="preview-image-thumb" />
                  <div className="preview-meta">
                    <span className="file-name">{imageFile?.name || "item-photo.jpg"}</span>
                    <span className="file-size">{(imageFile?.size / 1024).toFixed(1)} KB • Ready for Embedding</span>
                    <button type="button" onClick={handleRemoveImage} className="btn-remove-photo">
                      Remove & Replace
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="lost-photo-input" className="file-dropzone dropzone-crimson">
                  <div className="dropzone-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <div className="dropzone-text">
                    <strong>Click to upload an image</strong> or drag and drop photo here
                  </div>
                  <div className="dropzone-sub">
                    PNG, JPG, or JPEG up to 10MB • Will be encoded into a 1280-d MobileNet vector
                  </div>
                  <input
                    type="file"
                    id="lost-photo-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                </label>
              )}
            </div>

            {/* Form Submit Button */}
            <div className="form-submit-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submit-primary btn-crimson"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border"></span>
                    <span>Logging Incident & Executing Background AI Search...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Submit Lost Property Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ReportLost;
