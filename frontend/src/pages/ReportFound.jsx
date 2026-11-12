import { useState } from "react";
import { Link } from "react-router-dom";

function ReportFound() {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Calculator",
    description: "",
    location: "GLA Central Library",
    customLocation: "",
    date: new Date().toISOString().split("T")[0],
    custodyStatus: "Deposited at Proctor Office (AB-1)"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const custodyOptions = [
    "Deposited at Proctor Office (AB-1, Room 104)",
    "Deposited at Library Help Desk",
    "Currently in Finder's Custody (Will hand over upon claim)"
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recordId = "FOUND-" + Date.now().toString(36).toUpperCase();
    const finalLocation = formData.location === "Other Campus Area" && formData.customLocation
      ? formData.customLocation
      : formData.location;

    const newFoundItem = {
      id: recordId,
      itemName: formData.itemName,
      category: formData.category,
      description: formData.description,
      location: finalLocation,
      custodyStatus: formData.custodyStatus,
      date: formData.date,
      createdAt: new Date().toLocaleString(),
      hasImage: !!imageFile
    };

    const existingFound = JSON.parse(localStorage.getItem("campus_found_registry") || "[]");
    existingFound.unshift(newFoundItem);
    localStorage.setItem("campus_found_registry", JSON.stringify(existingFound));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "Calculator",
      description: "",
      location: "GLA Central Library",
      customLocation: "",
      date: new Date().toISOString().split("T")[0],
      custodyStatus: "Deposited at Proctor Office (AB-1)"
    });
    setImageFile(null);
    setImagePreview(null);
    setSubmitted(false);
  };

  return (
    <div className="page-shell">
      <div className="form-card-container">
        {/* Header Breadcrumb */}
        <div className="form-page-header header-forest">
          <div className="header-badge-row">
            <span className="badge-pill-forest">PROPERTY CUSTODY REGISTRATION</span>
            <span className="reference-code">FORM REF: LF-FOUND-2026</span>
          </div>
          <h1 className="form-page-title">Register a Found Item</h1>
          <p className="form-page-subtitle">
            Discovered someone&apos;s personal property on campus? Log it here so our neural search engine can notify verified students who reported it lost.
          </p>
        </div>

        {submitted ? (
          <div className="submission-success-card">
            <div className="success-icon-wrapper icon-forest-glow">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="success-title">Item Registered Into Campus Registry</h2>
            <p className="success-subtitle">
              Thank you for upholding community integrity! Your entry for <strong>{formData.itemName}</strong> has been assigned to the verified repository.
            </p>

            <div className="ai-status-summary-box">
              <div className="ai-summary-header">
                <span className="ai-pulse-dot dot-forest"></span>
                <strong>Active Repository Catalog Status</strong>
              </div>
              <p className="ai-summary-desc">
                This item has been indexed into the vector retrieval space. When students query the system, this item will appear in verified match alerts.
              </p>
              <div className="match-detected-alert alert-forest">
                📍 <strong>Custody Protocol:</strong> {formData.custodyStatus}
              </div>
            </div>

            <div className="success-actions-row">
              <Link to="/" className="btn-action-primary btn-forest">
                Return to Campus Portal
              </Link>
              <button onClick={resetForm} className="btn-secondary-ghost">
                Register Another Item
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
                  placeholder="e.g. Stainless Steel Water Bottle, Set of Keys"
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
                  Discovery Location <span className="req-star">*</span>
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
                    placeholder="Specify exact location or bench/floor..."
                    value={formData.customLocation}
                    onChange={handleInputChange}
                    className="text-input-field mt-sm"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="input-label">
                  Date Discovered <span className="req-star">*</span>
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

            {/* Physical Custody Status */}
            <div className="form-group">
              <label className="input-label">
                Current Custody Location <span className="req-star">*</span>
              </label>
              <select
                name="custodyStatus"
                value={formData.custodyStatus}
                onChange={handleInputChange}
                className="select-input-field"
              >
                {custodyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="input-helper-text">
                Recommendation: Handing high-value items (smartphones, wallets) to the Central Proctor Desk (AB-1) ensures safe custody.
              </span>
            </div>

            {/* Item Condition & Description */}
            <div className="form-group">
              <label className="input-label">
                Physical Description & Distinct Features
              </label>
              <textarea
                name="description"
                placeholder="Describe color, brand, condition (e.g. cracked screen, specific stickers, keychain attachments)..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="textarea-input-field"
              ></textarea>
            </div>

            {/* Photo Upload Dropzone */}
            <div className="form-group">
              <label className="input-label">
                Photo of Found Item (Highly Recommended)
              </label>

              {imagePreview ? (
                <div className="uploaded-preview-card border-forest">
                  <img src={imagePreview} alt="Found item preview" className="preview-image-thumb" />
                  <div className="preview-meta">
                    <span className="file-name">{imageFile?.name || "found-item.jpg"}</span>
                    <span className="file-size">{(imageFile?.size / 1024).toFixed(1)} KB • Ready for Catalog Index</span>
                    <button type="button" onClick={handleRemoveImage} className="btn-remove-photo">
                      Remove & Replace
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="found-photo-input" className="file-dropzone dropzone-forest">
                  <div className="dropzone-icon text-forest">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <div className="dropzone-text">
                    <strong>Click to take or upload a photo</strong> of the found item
                  </div>
                  <div className="dropzone-sub">
                    Direct photo enables owners to identify their lost belongings visually
                  </div>
                  <input
                    type="file"
                    id="found-photo-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-submit-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submit-primary btn-forest"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border"></span>
                    <span>Registering into Verified Campus Repository...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span>Register Found Item</span>
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

export default ReportFound;
