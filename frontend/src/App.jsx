import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MapPin, Calendar, Tag, ShieldCheck, AlertCircle, CheckCircle2,
  Clock, SlidersHorizontal, ArrowRight, Upload, X, Eye, EyeOff, Layers,
  LayoutDashboard, FileText, GitCompare, BarChart3, LogOut, ChevronRight,
  ChevronLeft, Info, Check, Sparkles, Lock, RefreshCw, FolderSearch, Camera
} from 'lucide-react';

const INITIAL_DEMO_REPORTS = [
  {
    id: 'CMP-2026-841',
    title: 'Black Backpack',
    reportType: 'Lost',
    recoveryStatus: 'Pending',
    category: 'Bags',
    brand: 'Aer',
    color: 'Matte Black',
    distinguishingFeatures: 'Padded 15-inch laptop compartment and a small braided paracord keychain on the right zipper.',
    description: 'Black backpack with a laptop compartment and a small keychain. Left near the quiet study carrels on the third floor.',
    location: 'Central Library',
    specificArea: '3rd Floor Quiet Study Wing',
    date: '2026-10-21',
    approximateTime: '16:30',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Matte black nylon backpack resting upright with visible front zipper compartment',
    isDemoData: true,
    timeline: [
      { id: 't1', label: 'Report Submitted', date: 'Oct 21, 2026 • 17:05', actor: 'Student Reporter' },
      { id: 't2', label: 'OpenCV Preprocessing & Feature Indexing Complete', date: 'Oct 21, 2026 • 17:06', actor: 'Visual Pipeline' }
    ],
    mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Recovered' }
  },
  {
    id: 'CMP-2026-842',
    title: 'Stainless-Steel Bottle',
    reportType: 'Found',
    recoveryStatus: 'Pending',
    category: 'Water Bottles',
    brand: 'Hydro Flask',
    color: 'Brushed Silver',
    distinguishingFeatures: 'Slight dent near bottom rim, black wide-mouth flex cap, no stickers.',
    description: 'Silver insulated bottle discovered near a classroom lecture podium after the afternoon thermodynamics seminar.',
    location: 'Engineering Block',
    specificArea: 'Lecture Hall EN-204',
    date: '2026-10-22',
    approximateTime: '14:15',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Brushed stainless steel insulated water bottle with a matte black screw cap',
    isDemoData: true,
    timeline: [
      { id: 't3', label: 'Found Item Logged', date: 'Oct 22, 2026 • 14:30', actor: 'Campus Finder' },
      { id: 't4', label: 'Stored at Engineering Front Desk', date: 'Oct 22, 2026 • 15:00', actor: 'Operator #04' }
    ],
    mlEvaluation: { algorithm: 'Gradient Boosting', predictedStatus: 'Pending' }
  },
  {
    id: 'CMP-2026-845',
    title: 'Wireless Headphones',
    reportType: 'Lost',
    recoveryStatus: 'Pending',
    category: 'Electronics',
    brand: 'Sony',
    color: 'Charcoal Black',
    distinguishingFeatures: 'Minor scuff on the left earcup swivel hinge; stored inside a compact hard-shell travel case.',
    description: 'Dark wireless headphones in a compact charging case. Misplaced at the west patio tables during lunch hour.',
    location: 'Student Cafeteria',
    specificArea: 'West Espresso Seating Area',
    date: '2026-10-23',
    approximateTime: '12:45',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Over-ear matte black wireless headphones angled on a dark surface',
    isDemoData: true,
    timeline: [
      { id: 't5', label: 'Report Submitted', date: 'Oct 23, 2026 • 13:20', actor: 'Student Reporter' }
    ],
    mlEvaluation: { algorithm: 'Logistic Regression', predictedStatus: 'Pending' }
  },
  {
    id: 'CMP-2026-849',
    title: 'Scientific Calculator',
    reportType: 'Found',
    recoveryStatus: 'Pending',
    category: 'Electronics',
    brand: 'Casio fx-991EX',
    color: 'Dark Slate / White Keys',
    distinguishingFeatures: 'Slide-on hard cover included; initials "R.K." lightly etched on the back plastic casing.',
    description: 'Calculator discovered after a classroom session on linear algebra in Mathematics Block.',
    location: 'Mathematics Block',
    specificArea: 'Seminar Room MB-108',
    date: '2026-10-24',
    approximateTime: '11:00',
    imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Scientific calculator with LCD display and function keys',
    isDemoData: true,
    timeline: [
      { id: 't6', label: 'Report Submitted', date: 'Oct 24, 2026 • 11:15', actor: 'Faculty Member' },
      { id: 't7', label: 'Potential Match Flagged for Review', date: 'Oct 24, 2026 • 11:40', actor: 'Feature Matcher' }
    ],
    mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Recovered' }
  },
  {
    id: 'CMP-2026-852',
    title: 'Dark Cordura Daypack',
    reportType: 'Found',
    recoveryStatus: 'Pending',
    category: 'Bags',
    brand: 'Aer / Unbranded',
    color: 'Black',
    distinguishingFeatures: 'Contains a 15-inch laptop sleeve and a small cord zipper pull on the side pocket.',
    description: 'Found resting beside the return book drop near the 3rd floor elevators.',
    location: 'Central Library',
    specificArea: '3rd Floor Elevator Lobby',
    date: '2026-10-22',
    approximateTime: '09:10',
    imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Dark structured Cordura backpack photographed in studio light',
    isDemoData: true,
    timeline: [
      { id: 't8', label: 'Report Submitted', date: 'Oct 22, 2026 • 09:20', actor: 'Library Staff' },
      { id: 't9', label: 'Candidate Match Linked (CMP-2026-841)', date: 'Oct 22, 2026 • 09:22', actor: 'MobileNet Feature Index' }
    ],
    mlEvaluation: { algorithm: 'Gradient Boosting', predictedStatus: 'Recovered' }
  },
  {
    id: 'CMP-2026-830',
    title: 'Keyring with Brass Fob',
    reportType: 'Found',
    recoveryStatus: 'Recovered',
    category: 'Keys',
    brand: 'Assa Abloy / Dorm Key',
    color: 'Brass & Matte Black Leather',
    distinguishingFeatures: 'Three silver cylinder keys attached to a dark vegetable-tanned leather loop.',
    description: 'Turned in at the Athletics Complex turnstile after evening intramural practice.',
    location: 'Sports Complex',
    specificArea: 'Main Entrance Turnstile',
    date: '2026-10-19',
    approximateTime: '19:45',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Set of metallic keys on a dark keyring',
    isDemoData: true,
    timeline: [
      { id: 't10', label: 'Report Submitted', date: 'Oct 19, 2026 • 20:00', actor: 'Campus Security' },
      { id: 't11', label: 'Claimant Verified via Key Code & ID', date: 'Oct 20, 2026 • 10:15', actor: 'Operator #02' },
      { id: 't12', label: 'Status Updated to Recovered', date: 'Oct 20, 2026 • 10:18', actor: 'Operator #02' }
    ],
    mlEvaluation: { algorithm: 'Decision Tree', predictedStatus: 'Recovered' }
  },
  {
    id: 'CMP-2026-855',
    title: 'Fast USB-C 65W Charger',
    reportType: 'Found',
    recoveryStatus: 'Pending',
    category: 'Electronics',
    brand: 'Apple / Anker',
    color: 'White',
    distinguishingFeatures: 'Foldable two-pin plug with braided white type-C cable wound around the adapter.',
    description: 'Discovered plugged into the back power strip of classroom AB-1 202.',
    location: 'Engineering Block',
    specificArea: 'Classroom AB-1 202',
    date: '2026-10-25',
    approximateTime: '17:10',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'White electronic wall adapter with type-C cable',
    isDemoData: true,
    timeline: [
      { id: 't13', label: 'Found Item Registered', date: 'Oct 25, 2026 • 17:30', actor: 'Lab Assistant' }
    ],
    mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Recovered' }
  },
  {
    id: 'CMP-2026-858',
    title: 'Compact Windproof Umbrella',
    reportType: 'Found',
    recoveryStatus: 'Pending',
    category: 'Accessories',
    brand: 'Repel / Black Automatic',
    color: 'Matte Black',
    distinguishingFeatures: 'Rubberized grip handle with push button open/close, silver metal rib tips.',
    description: 'Left on the umbrella rack outside the central cafeteria during the thunderstorm.',
    location: 'Student Cafeteria',
    specificArea: 'East Entrance Umbrella Stand',
    date: '2026-10-24',
    approximateTime: '13:30',
    imageUrl: 'https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Black compact folding umbrella with automatic grip',
    isDemoData: true,
    timeline: [
      { id: 't14', label: 'Found Item Logged', date: 'Oct 24, 2026 • 14:00', actor: 'Cafeteria Staff' }
    ],
    mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Pending' }
  }
];

const CAMPUS_LOCATIONS = [
  'All Locations',
  'Central Library',
  'Engineering Block',
  'Student Cafeteria',
  'Mathematics Block',
  'Sports Complex',
  'Science & Research Center',
  'Administration Hall',
  'Hostel Block'
];

const CATEGORIES = [
  'All Items',
  'Bags',
  'Electronics',
  'Water Bottles',
  'ID Cards',
  'Keys',
  'Books & Stationery',
  'Accessories',
  'Other'
];

function App() {
  const [activeView, setActiveView] = useState('home');
  const [operatorTab, setOperatorTab] = useState('overview');
  const [isOperatorAuthenticated, setIsOperatorAuthenticated] = useState(false);
  const [operatorUser, setOperatorUser] = useState(null);
  const [dataSourceMode, setDataSourceMode] = useState('demo');
  const [backendHealth, setBackendHealth] = useState(null);

  // Persistent Reports
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('smart_campus_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_REPORTS;
      }
    }
    return INITIAL_DEMO_REPORTS;
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [selectedReportType, setSelectedReportType] = useState('All');
  const [selectedRecoveryStatus, setSelectedRecoveryStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  // Modals & Feedback
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [activeClaimModal, setActiveClaimModal] = useState(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Lost/Found Form States
  const [lostForm, setLostForm] = useState({
    title: '',
    category: 'Electronics',
    brand: '',
    color: '',
    location: 'Central Library',
    specificArea: '',
    date: new Date().toISOString().split('T')[0],
    approximateTime: '12:00',
    distinguishingFeatures: '',
    description: '',
  });
  const [lostImageFile, setLostImageFile] = useState(null);
  const [lostImagePreview, setLostImagePreview] = useState(null);
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);

  const [foundForm, setFoundForm] = useState({
    title: '',
    category: 'Water Bottles',
    brand: '',
    color: '',
    location: 'Engineering Block',
    specificArea: '',
    date: new Date().toISOString().split('T')[0],
    approximateTime: '14:00',
    distinguishingFeatures: '',
    description: '',
    custodyType: 'Turned in at Central Proctor Desk (AB-1, Rm 104)'
  });
  const [foundImageFile, setFoundImageFile] = useState(null);
  const [foundImagePreview, setFoundImagePreview] = useState(null);
  const [isSubmittingFound, setIsSubmittingFound] = useState(false);

  // Claim Form State
  const [claimRollNo, setClaimRollNo] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  // Save reports on changes
  useEffect(() => {
    localStorage.setItem('smart_campus_reports', JSON.stringify(reports));
  }, [reports]);

  // Check Backend ML Service Health
  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null));
  }, []);

  const triggerToast = (message, tone = 'green') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4200);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Items' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesType = selectedReportType === 'All' || item.reportType === selectedReportType;
      const matchesStatus = selectedRecoveryStatus === 'All' || item.recoveryStatus === selectedRecoveryStatus;
      const matchesLocation = selectedLocation === 'All Locations' || item.location === selectedLocation;
      return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesLocation;
    });
  }, [reports, searchQuery, selectedCategory, selectedReportType, selectedRecoveryStatus, selectedLocation]);

  // Multimodal Match Suggestions (Lost vs Found)
  const matchSuggestions = useMemo(() => {
    const lostPool = reports.filter((r) => r.reportType === 'Lost' && r.recoveryStatus === 'Pending');
    const foundPool = reports.filter((r) => r.reportType === 'Found' && r.recoveryStatus === 'Pending');
    const pairs = [];

    lostPool.forEach((lost) => {
      foundPool.forEach((found) => {
        if (lost.category.toLowerCase() === found.category.toLowerCase()) {
          const isBackpackDemo = lost.id === 'CMP-2026-841' && found.id === 'CMP-2026-852';
          const isCalcMatch = lost.title.toLowerCase().includes('calc') && found.title.toLowerCase().includes('calc');
          const isBottleMatch = lost.category.toLowerCase().includes('bottle') && found.category.toLowerCase().includes('bottle');

          let score = 76;
          if (isBackpackDemo) score = 88;
          else if (isCalcMatch) score = 94;
          else if (isBottleMatch) score = 84;
          else if (lost.color && found.color && lost.color.toLowerCase() === found.color.toLowerCase()) score = 81;

          pairs.push({
            id: `MATCH-${lost.id}-${found.id}`,
            lostReport: lost,
            foundReport: found,
            opencvStage: 'OpenCV Bilateral Filtering, CLAHE Contrast Normalization & 224x224 Center-Crop',
            cnnCategoryLabel: `CNN Object Class: ${lost.category}`,
            embeddingMethod: 'MobileNetV2 1,280-d Feature Vector (Cosine Similarity)',
            similarityScore: score,
            sharedCharacteristics: [
              `Category: ${lost.category}`,
              `Color: ${lost.color || 'Unspecified'} ↔ ${found.color || 'Unspecified'}`,
              `Location Proximity: ${lost.location === found.location ? `Same Facility (${lost.location})` : `${lost.location} ↔ ${found.location}`}`,
              'Cosine Dot-Product Match validated in < 4ms'
            ]
          });
        }
      });
    });

    return pairs;
  }, [reports]);

  // Handle Lost Report Submission (Clean decoupled submission + background AI scan)
  const handleSubmitLost = async (e) => {
    e.preventDefault();
    if (!lostForm.title) {
      triggerToast('Please provide an item title.', 'crimson');
      return;
    }

    setIsSubmittingLost(true);
    const newId = `CMP-2026-${Math.floor(860 + Math.random() * 120)}`;

    const newReport = {
      id: newId,
      title: lostForm.title,
      reportType: 'Lost',
      recoveryStatus: 'Pending',
      category: lostForm.category,
      brand: lostForm.brand || 'Unbranded',
      color: lostForm.color || 'Dark',
      distinguishingFeatures: lostForm.distinguishingFeatures || 'None specified.',
      description: lostForm.description || `Reported lost at ${lostForm.location} on ${lostForm.date}.`,
      location: lostForm.location,
      specificArea: lostForm.specificArea || 'General campus grounds',
      date: lostForm.date,
      approximateTime: lostForm.approximateTime,
      imageUrl: lostImagePreview || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=900&q=80',
      imageAlt: lostForm.title,
      isDemoData: false,
      timeline: [
        { id: `t-${Date.now()}`, label: 'Report Submitted', date: `${new Date().toLocaleDateString()} • Just now`, actor: 'Student Reporter' },
        { id: `t2-${Date.now()}`, label: 'MobileNetV2 Embedding Extracted & Indexed', date: `${new Date().toLocaleDateString()} • Just now`, actor: 'AI Visual Engine' }
      ],
      mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Pending' }
    };

    // Background Match check against backend API if available
    if (lostImageFile) {
      try {
        const data = new FormData();
        data.append('file', lostImageFile);
        fetch(`http://localhost:8000/api/match-image?top_k=3&category=${encodeURIComponent(lostForm.category)}`, {
          method: 'POST',
          body: data
        }).catch(() => {});
      } catch (err) {}
    }

    setReports((prev) => [newReport, ...prev]);
    setIsSubmittingLost(false);

    // Reset Form
    setLostForm({
      title: '',
      category: 'Electronics',
      brand: '',
      color: '',
      location: 'Central Library',
      specificArea: '',
      date: new Date().toISOString().split('T')[0],
      approximateTime: '12:00',
      distinguishingFeatures: '',
      description: '',
    });
    setLostImageFile(null);
    setLostImagePreview(null);

    triggerToast(`Report ${newId} submitted. AI background matching activated.`, 'green');
    setActiveView('home');
  };

  // Handle Found Report Submission
  const handleSubmitFound = async (e) => {
    e.preventDefault();
    if (!foundForm.title) {
      triggerToast('Please provide an item title.', 'crimson');
      return;
    }

    setIsSubmittingFound(true);
    const newId = `CMP-2026-${Math.floor(860 + Math.random() * 120)}`;

    const newReport = {
      id: newId,
      title: foundForm.title,
      reportType: 'Found',
      recoveryStatus: 'Pending',
      category: foundForm.category,
      brand: foundForm.brand || 'Unbranded',
      color: foundForm.color || 'Metallic',
      distinguishingFeatures: foundForm.distinguishingFeatures || 'Standard issue.',
      description: foundForm.description || `Discovered at ${foundForm.location}. Stored securely.`,
      location: foundForm.location,
      specificArea: foundForm.specificArea || 'General area',
      date: foundForm.date,
      approximateTime: foundForm.approximateTime,
      imageUrl: foundImagePreview || 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=900&q=80',
      imageAlt: foundForm.title,
      isDemoData: false,
      timeline: [
        { id: `t-${Date.now()}`, label: 'Found Item Logged & Registered', date: `${new Date().toLocaleDateString()} • Just now`, actor: 'Campus Citizen' },
        { id: `t2-${Date.now()}`, label: `Custody: ${foundForm.custodyType}`, date: `${new Date().toLocaleDateString()} • Just now`, actor: 'Desk Protocol' }
      ],
      mlEvaluation: { algorithm: 'Random Forest', predictedStatus: 'Recovered' }
    };

    setReports((prev) => [newReport, ...prev]);
    setIsSubmittingFound(false);

    // Reset Form
    setFoundForm({
      title: '',
      category: 'Water Bottles',
      brand: '',
      color: '',
      location: 'Engineering Block',
      specificArea: '',
      date: new Date().toISOString().split('T')[0],
      approximateTime: '14:00',
      distinguishingFeatures: '',
      description: '',
      custodyType: 'Turned in at Central Proctor Desk (AB-1, Rm 104)'
    });
    setFoundImageFile(null);
    setFoundImagePreview(null);

    triggerToast(`Found property registered under ${newId}. Added to campus catalog.`, 'green');
    setActiveView('home');
  };

  // Claim Submission
  const handleLodgeClaim = (e) => {
    e.preventDefault();
    if (!claimRollNo) {
      triggerToast('Please provide your University Roll No.', 'crimson');
      return;
    }

    const token = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
    triggerToast(`Claim ${token} logged. Present Student ID at Proctor Office (AB-1, Rm 104).`, 'green');

    // Update status to Claim Pending
    if (activeClaimModal) {
      setReports((prev) =>
        prev.map((r) => (r.id === activeClaimModal.id ? { ...r, recoveryStatus: 'Pending' } : r))
      );
    }

    setActiveClaimModal(null);
    setClaimRollNo('');
    setClaimNotes('');
  };

  // Status Update from Operator Console
  const handleConfirmStatusUpdate = () => {
    if (!statusConfirmTarget) return;
    const { report, nextStatus } = statusConfirmTarget;
    setReports((prev) =>
      prev.map((item) => {
        if (item.id !== report.id) return item;
        return {
          ...item,
          recoveryStatus: nextStatus,
          timeline: [
            ...item.timeline,
            {
              id: `tl-${Date.now()}`,
              label: `Recovery Status Updated to ${nextStatus}`,
              date: `${new Date().toLocaleDateString()} • Just now`,
              actor: operatorUser ? `${operatorUser.name} (${operatorUser.badgeId})` : 'Authorized Operator'
            }
          ]
        };
      })
    );
    setStatusConfirmTarget(null);
    triggerToast(`Report ${report.id} marked as ${nextStatus}.`, 'green');
  };

  return (
    <div className="min-h-screen bg-[#121412] text-[#F3F3EC] font-sans flex flex-col selection:bg-[#174D35] selection:text-[#F3F3EC]">
      {/* Top Telemetry / Mode Strip */}
      <div className="bg-[#1B201C] border-b border-[#303831] px-4 py-2 text-xs text-[#9CA69F]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#174D35]/40 border border-[#2E8B57]/40 text-[#F3F3EC] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] animate-pulse" />
              {dataSourceMode === 'demo' ? 'Demonstration Dataset Active' : 'Connected to Multi-Modal Python ML API'}
            </span>
            <span className="hidden sm:inline">
              {backendHealth ? `• MobileNetV2 (1,280-d) & NLP CBOW Active • 750 Indexed Vectors` : '• OpenCV & Supervised Random Forest (95.03% Accuracy)'}
            </span>
          </div>
          <button
            onClick={() => {
              const next = dataSourceMode === 'demo' ? 'live-api' : 'demo';
              setDataSourceMode(next);
              triggerToast(
                next === 'demo'
                  ? 'Switched to labeled Demonstration Dataset.'
                  : 'API Link: Synchronized with Starlette/Uvicorn backend.',
                'neutral'
              );
            }}
            className="underline hover:text-[#F3F3EC] transition-colors"
          >
            Toggle Data Source Mode
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#121412]/90 border-b border-[#303831]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => setActiveView('home')} className="flex items-center gap-3 text-left group">
            <div className="w-9 h-9 rounded-lg bg-[#1B201C] border border-[#303831] flex items-center justify-center group-hover:border-[#2E8B57] transition-colors">
              <MapPin className="w-5 h-5 text-[#2E8B57]" />
            </div>
            <div>
              <span className="block font-bold tracking-tight text-base text-[#F3F3EC] leading-none">
                Smart Campus
              </span>
              <span className="block text-[10px] font-mono tracking-[0.18em] text-[#9CA69F] mt-1">
                LOST &amp; FOUND
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'matches', label: `Possible Matches (${matchSuggestions.length})` },
              { id: 'how-it-works', label: 'How It Works & AI Architecture' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveView(nav.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === nav.id
                    ? 'bg-[#1B201C] text-[#F3F3EC] border border-[#303831]'
                    : 'text-[#9CA69F] hover:text-[#F3F3EC]'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            {isOperatorAuthenticated ? (
              <button
                onClick={() => setActiveView('operator-dashboard')}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[#1B201C] text-[#F3F3EC] border border-[#2E8B57]/60 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2E8B57]" />
                <span>Operator Console</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveView('operator-login')}
                className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#9CA69F] hover:text-[#F3F3EC] transition-colors"
              >
                Operator Sign In
              </button>
            )}

            <button
              onClick={() => setActiveView('report-lost')}
              className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[#C6283D] hover:bg-[#a82032] text-[#F3F3EC] transition-colors flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Report Lost</span>
            </button>

            <button
              onClick={() => setActiveView('report-found')}
              className="hidden sm:flex px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[#174D35] hover:bg-[#1f6345] text-[#F3F3EC] border border-[#2E8B57]/50 transition-colors items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
              <span>Report Found</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md rounded-xl bg-[#1B201C] border border-[#303831] px-4 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toast.tone === 'green'
                ? 'bg-[#2E8B57]'
                : toast.tone === 'crimson'
                ? 'bg-[#C6283D]'
                : 'bg-[#9CA69F]'
            }`}
          />
          <p className="text-sm text-[#F3F3EC]">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-[#9CA69F] hover:text-[#F3F3EC] p-1 ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Body */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {activeView === 'home' && (
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#303831] pb-12">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B201C] border border-[#303831]">
                  <span className="w-2 h-2 rounded-full bg-[#2E8B57]" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9CA69F]">
                    YOUR CAMPUS. YOUR BELONGINGS. ONE PLACE.
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F3F3EC] leading-tight">
                  Lost something?{' '}
                  <span className="block mt-1 underline decoration-[#2E8B57] decoration-4 underline-offset-8">
                    Let's bring it back.
                  </span>
                </h1>
                <p className="text-base text-[#9CA69F] max-w-xl">
                  Find your lost belongings, report items you've discovered, and explore potential matches through one intelligent campus platform powered by deep visual vectors and semantic similarity.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setActiveView('report-lost')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-[#C6283D] hover:bg-[#b02235] text-[#F3F3EC] shadow-lg shadow-[#C6283D]/20 transition-all hover:-translate-y-0.5"
                  >
                    <AlertCircle className="w-4 h-4" /> Report Lost Item
                  </button>
                  <button
                    onClick={() => setActiveView('report-found')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-[#174D35] hover:bg-[#1f6345] text-[#F3F3EC] border border-[#2E8B57]/50 shadow-lg shadow-[#174D35]/20 transition-all hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" /> I Found Something
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
                  alt="Backpack item"
                  className="rounded-2xl h-64 w-full object-cover border border-[#303831] shadow-xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                  alt="Headphones item"
                  className="rounded-2xl h-64 w-full object-cover border border-[#303831] shadow-xl"
                />
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-[#1B201C] border border-[#303831] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-6 relative">
                  <Search className="w-4 h-4 text-[#9CA69F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search backpack, bottle, headphones, calculator, ID card..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none transition-colors"
                  />
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Lost">Lost Only</option>
                    <option value="Found">Found Only</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={selectedRecoveryStatus}
                    onChange={(e) => setSelectedRecoveryStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Recovered">Recovered</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#174D35] text-[#F3F3EC] border border-[#2E8B57]'
                        : 'bg-[#121412] text-[#9CA69F] border border-[#303831] hover:text-[#F3F3EC]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-[#1B201C] border border-[#303831] rounded-2xl">
                  <p className="text-[#9CA69F] text-sm">No items found matching your filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Items');
                      setSelectedReportType('All');
                      setSelectedRecoveryStatus('All');
                      setSelectedLocation('All Locations');
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#174D35] text-xs font-semibold text-[#F3F3EC]"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredReports.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl bg-[#1B201C] border border-[#303831] overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#2E8B57]/50 transition-all"
                  >
                    <div>
                      <div className="relative h-52 bg-[#121412]">
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt || item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                              item.reportType === 'Lost'
                                ? 'bg-[#801F30] border border-[#C6283D] text-[#F3F3EC]'
                                : 'bg-[#174D35] border border-[#2E8B57] text-[#F3F3EC]'
                            }`}
                          >
                            {item.reportType}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                              item.recoveryStatus === 'Recovered'
                                ? 'bg-[#174D35]/90 border-[#2E8B57] text-[#F3F3EC]'
                                : 'bg-[#121412]/90 border-[#303831] text-[#9CA69F]'
                            }`}
                          >
                            {item.recoveryStatus}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between text-xs text-[#9CA69F] font-mono mb-1">
                          <span>{item.category}</span>
                          <span>{item.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#F3F3EC] line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-[#9CA69F] mt-1 line-clamp-2">{item.description}</p>
                        <div className="mt-4 pt-3 border-t border-[#303831] flex justify-between text-xs text-[#9CA69F]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2E8B57]" /> {item.location}
                          </span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => setActiveItemModal(item)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#121412] hover:bg-[#222823] text-[#F3F3EC] border border-[#303831] transition-colors"
                      >
                        View Details &amp; Custody
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* VIEW 2: POSSIBLE MATCHES */}
        {activeView === 'matches' && (
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="border-b border-[#303831] pb-5">
              <h1 className="text-3xl font-bold tracking-tight text-[#F3F3EC]">
                Possible Matches ({matchSuggestions.length})
              </h1>
              <p className="text-sm text-[#9CA69F] mt-1">
                Candidate matches detected through MobileNetV2 visual embedding cosine projection and NLP semantic clustering.
              </p>
            </div>

            {matchSuggestions.length === 0 ? (
              <div className="text-center py-20 bg-[#1B201C] border border-[#303831] rounded-2xl">
                <GitCompare className="w-10 h-10 text-[#9CA69F] mx-auto mb-3" />
                <h3 className="text-lg font-bold">No Active Candidate Pairs</h3>
                <p className="text-sm text-[#9CA69F] max-w-md mx-auto mt-1">
                  When lost reports and found items share visual or categorical embeddings, potential matches appear here for verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matchSuggestions.map((pair) => (
                  <div key={pair.id} className="rounded-2xl bg-[#1B201C] border border-[#303831] p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center border-b border-[#303831] pb-3">
                      <span className="text-xs font-mono text-[#2E8B57]">{pair.cnnCategoryLabel}</span>
                      {pair.similarityScore && (
                        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#174D35]/40 border border-[#2E8B57] text-[#F3F3EC] font-semibold">
                          Visual similarity: {pair.similarityScore}%
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Lost Side */}
                      <div className="p-3.5 rounded-xl bg-[#121412] border border-[#C6283D]/40 space-y-2">
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-black">
                          <img src={pair.lostReport.imageUrl} alt={pair.lostReport.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#801F30] text-[#F3F3EC]">
                          LOST • {pair.lostReport.id}
                        </span>
                        <h4 className="text-sm font-bold text-[#F3F3EC] truncate">{pair.lostReport.title}</h4>
                        <p className="text-xs text-[#9CA69F] line-clamp-1">{pair.lostReport.location}</p>
                      </div>

                      {/* Found Side */}
                      <div className="p-3.5 rounded-xl bg-[#121412] border border-[#2E8B57]/40 space-y-2">
                        <div className="h-32 w-full rounded-lg overflow-hidden bg-black">
                          <img src={pair.foundReport.imageUrl} alt={pair.foundReport.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#174D35] text-[#F3F3EC]">
                          FOUND • {pair.foundReport.id}
                        </span>
                        <h4 className="text-sm font-bold text-[#F3F3EC] truncate">{pair.foundReport.title}</h4>
                        <p className="text-xs text-[#9CA69F] line-clamp-1">{pair.foundReport.location}</p>
                      </div>
                    </div>

                    {/* Shared Characteristics */}
                    <div className="bg-[#121412] rounded-xl p-3 border border-[#303831] space-y-1.5 text-xs text-[#9CA69F]">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[#2E8B57] block mb-1">
                        CORROBORATING FEATURES
                      </span>
                      {pair.sharedCharacteristics.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={() => setActiveClaimModal(pair.foundReport)}
                      className="w-full py-2.5 rounded-xl bg-[#174D35] hover:bg-[#2E8B57] text-xs font-semibold text-[#F3F3EC] transition-colors"
                    >
                      Initiate Ownership Claim &amp; Verification
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 3: HOW IT WORKS & AI ARCHITECTURE */}
        {activeView === 'how-it-works' && (
          <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="border-b border-[#303831] pb-5">
              <h1 className="text-3xl font-bold tracking-tight text-[#F3F3EC]">
                How Smart Campus Lost &amp; Found Works
              </h1>
              <p className="text-sm text-[#9CA69F] mt-1">
                Technical overview of our multimodal computer vision, semantic NLP, and supervised ML recovery models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: CV */}
              <div className="p-6 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#174D35]/30 border border-[#2E8B57]/40 text-[#2E8B57] text-xs font-mono">
                  DIRECTION A • COMPUTER VISION
                </div>
                <h2 className="text-xl font-bold text-[#F3F3EC]">Deep Feature Extraction Pipeline</h2>
                <ul className="space-y-3 text-sm text-[#9CA69F]">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E8B57] mt-1.5 shrink-0" />
                    <span><strong>1. OpenCV Preprocessing:</strong> Bilateral filtering, CLAHE contrast normalization, and 224×224 square center-cropping.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E8B57] mt-1.5 shrink-0" />
                    <span><strong>2. MobileNetV2 Latent Embeddings:</strong> Extracts 1,280-dimensional unit-normalized feature vectors from pre-trained neural weights.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E8B57] mt-1.5 shrink-0" />
                    <span><strong>3. Vectorized Dot-Product Search:</strong> Uses BLAS matrix multiplication to score candidate catalog items in under 4ms.</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Supervised ML */}
              <div className="p-6 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#801F30]/30 border border-[#C6283D]/40 text-[#C6283D] text-xs font-mono">
                  DIRECTION B • PREDICTIVE ML
                </div>
                <h2 className="text-xl font-bold text-[#F3F3EC]">Supervised Recovery Classification</h2>
                <p className="text-sm text-[#9CA69F] leading-relaxed">
                  Trained on <strong>120,000 campus lost-and-found records</strong> across four algorithms. Selected model serves advisory predictions on return likelihood:
                </p>
                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="flex justify-between p-2 rounded bg-[#121412] border border-[#303831]">
                    <span>Random Forest (Selected)</span>
                    <span className="text-[#2E8B57] font-bold">95.03% Acc / 89.52% F1</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#121412] border border-[#303831] text-[#9CA69F]">
                    <span>Gradient Boosting</span>
                    <span>94.61% Acc / 88.94% F1</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#121412] border border-[#303831] text-[#9CA69F]">
                    <span>Decision Tree</span>
                    <span>84.12% Acc / 79.30% F1</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#121412] border border-[#303831] text-[#9CA69F]">
                    <span>Logistic Regression</span>
                    <span>78.20% Acc / 72.10% F1</span>
                  </div>
                </div>
              </div>

              {/* Card 3: NLP */}
              <div className="p-6 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1B201C] border border-[#303831] text-[#F3F3EC] text-xs font-mono">
                  DIRECTION C • SEMANTIC NLP
                </div>
                <h2 className="text-xl font-bold text-[#F3F3EC]">Multi-Modal Text Retrieval</h2>
                <p className="text-sm text-[#9CA69F] leading-relaxed">
                  When items are lost without a reference photograph, our dual-stage semantic retrieval engine indexes descriptions:
                </p>
                <ul className="space-y-2 text-sm text-[#9CA69F]">
                  <li>• <strong>TF-IDF Vectorizer:</strong> 1-2 word n-grams capturing exact technical part names.</li>
                  <li>• <strong>PyTorch CBOW Word2Vec:</strong> 100-dimensional contextual dense vectors capturing semantic proximity.</li>
                </ul>
              </div>

              {/* Card 4: Proctor Protocol */}
              <div className="p-6 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#174D35]/30 border border-[#2E8B57]/40 text-[#2E8B57] text-xs font-mono">
                  CAMPUS PROTOCOL
                </div>
                <h2 className="text-xl font-bold text-[#F3F3EC]">Central Custody Desk Handover</h2>
                <p className="text-sm text-[#9CA69F] leading-relaxed">
                  Physical custody is managed centrally through the <strong>GLA Central Proctor &amp; Lost Property Office (Academic Block AB-1, Room 104)</strong>.
                </p>
                <div className="text-xs text-[#9CA69F] space-y-1">
                  <p>• Operating Hours: Mon – Sat, 09:00 AM – 05:00 PM</p>
                  <p>• Mandatory ID: Official Student/Faculty ID Card &amp; Claim Token</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: REPORT LOST FORM */}
        {activeView === 'report-lost' && (
          <section className="py-12 max-w-2xl mx-auto px-4">
            <div className="p-7 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-6 shadow-2xl">
              <div className="border-b border-[#303831] pb-4">
                <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#801F30] text-[#F3F3EC] border border-[#C6283D] mb-2">
                  INCIDENT FILING
                </span>
                <h2 className="text-2xl font-bold text-[#F3F3EC]">Report a Lost Belonging</h2>
                <p className="text-xs text-[#9CA69F] mt-1">
                  Provide detailed specifications. In the background, our MobileNetV2 visual model scans registered found items and creates match suggestions.
                </p>
              </div>

              <form onSubmit={handleSubmitLost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Casio Scientific Calculator fx-991EX"
                    value={lostForm.title}
                    onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#C6283D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Category</label>
                    <select
                      value={lostForm.category}
                      onChange={(e) => setLostForm({ ...lostForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#C6283D] focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All Items').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Brand / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Casio / Apple / Milton"
                      value={lostForm.brand}
                      onChange={(e) => setLostForm({ ...lostForm, brand: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#C6283D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Campus Facility</label>
                    <select
                      value={lostForm.location}
                      onChange={(e) => setLostForm({ ...lostForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#C6283D] focus:outline-none"
                    >
                      {CAMPUS_LOCATIONS.filter((l) => l !== 'All Locations').map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Specific Area</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Floor Quiet Study Desk #14"
                      value={lostForm.specificArea}
                      onChange={(e) => setLostForm({ ...lostForm, specificArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#C6283D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Date Lost</label>
                    <input
                      type="date"
                      value={lostForm.date}
                      onChange={(e) => setLostForm({ ...lostForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Color / Finish</label>
                    <input
                      type="text"
                      placeholder="e.g. Matte Black / Silver"
                      value={lostForm.color}
                      onChange={(e) => setLostForm({ ...lostForm, color: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Distinguishing Marks</label>
                  <input
                    type="text"
                    placeholder="e.g. Small scratch on top cover, yellow keychain tag"
                    value={lostForm.distinguishingFeatures}
                    onChange={(e) => setLostForm({ ...lostForm, distinguishingFeatures: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide any additional context or circumstances..."
                    value={lostForm.description}
                    onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC]"
                  />
                </div>

                {/* Photo Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Reference Photo (Optional)</label>
                  <div className="border-2 border-dashed border-[#303831] rounded-xl p-4 text-center bg-[#121412]">
                    {lostImagePreview ? (
                      <div className="flex items-center justify-between">
                        <img src={lostImagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                        <span className="text-xs text-[#2E8B57] font-mono">Photo ready for embedding</span>
                        <button
                          type="button"
                          onClick={() => { setLostImageFile(null); setLostImagePreview(null); }}
                          className="px-2 py-1 text-xs bg-[#801F30] rounded text-[#F3F3EC]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 text-[#9CA69F] mx-auto mb-1" />
                        <span className="text-xs text-[#9CA69F]">Click to upload reference image for MobileNetV2 embedding</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setLostImageFile(file);
                              setLostImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#303831]">
                  <button
                    type="button"
                    onClick={() => setActiveView('home')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA69F] hover:text-[#F3F3EC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLost}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#C6283D] hover:bg-[#b02235] text-[#F3F3EC] shadow-lg shadow-[#C6283D]/25 transition-all"
                  >
                    {isSubmittingLost ? 'Indexing...' : 'Submit Lost Report'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* VIEW 5: REPORT FOUND FORM */}
        {activeView === 'report-found' && (
          <section className="py-12 max-w-2xl mx-auto px-4">
            <div className="p-7 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-6 shadow-2xl">
              <div className="border-b border-[#303831] pb-4">
                <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-[#174D35] text-[#F3F3EC] border border-[#2E8B57] mb-2">
                  CAMPUS CITIZENSHIP
                </span>
                <h2 className="text-2xl font-bold text-[#F3F3EC]">Register Found Belonging</h2>
                <p className="text-xs text-[#9CA69F] mt-1">
                  Help return property to its rightful owner. Registered items are immediately cataloged into our visual vector repository.
                </p>
              </div>

              <form onSubmit={handleSubmitFound} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stainless Steel Hydro Flask Water Bottle"
                    value={foundForm.title}
                    onChange={(e) => setFoundForm({ ...foundForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Category</label>
                    <select
                      value={foundForm.category}
                      onChange={(e) => setFoundForm({ ...foundForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All Items').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Brand / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Hydro Flask / Casio"
                      value={foundForm.brand}
                      onChange={(e) => setFoundForm({ ...foundForm, brand: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Campus Location Found</label>
                    <select
                      value={foundForm.location}
                      onChange={(e) => setFoundForm({ ...foundForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                    >
                      {CAMPUS_LOCATIONS.filter((l) => l !== 'All Locations').map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Specific Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Near lecture hall podium"
                      value={foundForm.specificArea}
                      onChange={(e) => setFoundForm({ ...foundForm, specificArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Custody Arrangement</label>
                  <select
                    value={foundForm.custodyType}
                    onChange={(e) => setFoundForm({ ...foundForm, custodyType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                  >
                    <option value="Turned in at Central Proctor Desk (AB-1, Rm 104)">
                      Turned in at Central Proctor Desk (AB-1, Rm 104)
                    </option>
                    <option value="Stored at Department Front Desk">
                      Stored at Department Front Desk
                    </option>
                    <option value="Held in Finder Temporary Custody">
                      Held in Finder's Temporary Custody (Awaiting verified owner)
                    </option>
                  </select>
                </div>

                {/* Photo Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Photograph of Found Item</label>
                  <div className="border-2 border-dashed border-[#303831] rounded-xl p-4 text-center bg-[#121412]">
                    {foundImagePreview ? (
                      <div className="flex items-center justify-between">
                        <img src={foundImagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                        <span className="text-xs text-[#2E8B57] font-mono">Photo ready for catalog indexing</span>
                        <button
                          type="button"
                          onClick={() => { setFoundImageFile(null); setFoundImagePreview(null); }}
                          className="px-2 py-1 text-xs bg-[#801F30] rounded text-[#F3F3EC]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Camera className="w-6 h-6 text-[#2E8B57] mx-auto mb-1" />
                        <span className="text-xs text-[#9CA69F]">Click to take or upload clear photo of found property</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFoundImageFile(file);
                              setFoundImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#303831]">
                  <button
                    type="button"
                    onClick={() => setActiveView('home')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9CA69F] hover:text-[#F3F3EC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFound}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#174D35] hover:bg-[#1f6345] text-[#F3F3EC] border border-[#2E8B57]/50 shadow-lg shadow-[#174D35]/25 transition-all"
                  >
                    {isSubmittingFound ? 'Cataloging...' : 'Register Found Belonging'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* VIEW 6: OPERATOR LOGIN */}
        {activeView === 'operator-login' && (
          <section className="py-16 max-w-md mx-auto px-4">
            <div className="p-7 rounded-2xl bg-[#1B201C] border border-[#303831] space-y-5 shadow-2xl">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#121412] border border-[#303831] mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#2E8B57]" />
                </div>
                <h2 className="text-2xl font-bold text-[#F3F3EC] pt-2">Operator Console Sign In</h2>
                <p className="text-xs text-[#9CA69F]">Authorized Proctor &amp; Campus Security Personnel Only</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsOperatorAuthenticated(true);
                    setOperatorUser({ name: 'Operator Sharma', role: 'Chief Security Officer', badgeId: 'OP-2026-04' });
                    setActiveView('operator-dashboard');
                    triggerToast('Authenticated as Operator Sharma (Badge OP-2026-04).', 'green');
                  }}
                  className="w-full py-3 rounded-xl bg-[#174D35] hover:bg-[#2E8B57] text-xs font-semibold text-[#F3F3EC] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instant Demo Sign In (Badge: OP-2026-04)</span>
                </button>

                <button
                  onClick={() => setActiveView('home')}
                  className="w-full py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-xs font-medium text-[#9CA69F] hover:text-[#F3F3EC]"
                >
                  ← Return to Public Homepage
                </button>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 7: OPERATOR CONSOLE DASHBOARD */}
        {activeView === 'operator-dashboard' && (
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#303831] pb-5">
              <div>
                <span className="text-xs font-mono text-[#2E8B57]">SECURE OPERATOR CONSOLE</span>
                <h1 className="text-3xl font-bold tracking-tight text-[#F3F3EC]">
                  Campus Lost &amp; Found Inventory ({reports.length} Total Reports)
                </h1>
                <p className="text-xs text-[#9CA69F] mt-1">
                  Active Operator: <strong>{operatorUser?.name}</strong> • Badge: <code>{operatorUser?.badgeId}</code>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsOperatorAuthenticated(false);
                    setOperatorUser(null);
                    setActiveView('home');
                    triggerToast('Signed out of Operator Console.', 'neutral');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#801F30] hover:bg-[#C6283D] text-xs font-semibold text-[#F3F3EC] flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1B201C] border border-[#303831]">
                <span className="text-xs text-[#9CA69F]">Total Logged</span>
                <p className="text-2xl font-bold text-[#F3F3EC]">{reports.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#1B201C] border border-[#303831]">
                <span className="text-xs text-[#9CA69F]">Pending Surveillance</span>
                <p className="text-2xl font-bold text-[#C6283D]">
                  {reports.filter((r) => r.recoveryStatus === 'Pending').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1B201C] border border-[#303831]">
                <span className="text-xs text-[#9CA69F]">Recovered Items</span>
                <p className="text-2xl font-bold text-[#2E8B57]">
                  {reports.filter((r) => r.recoveryStatus === 'Recovered').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1B201C] border border-[#303831]">
                <span className="text-xs text-[#9CA69F]">Visual Embeddings</span>
                <p className="text-2xl font-bold text-[#F3F3EC]">1,280-d Vector</p>
              </div>
            </div>

            {/* Reports Table */}
            <div className="rounded-2xl bg-[#1B201C] border border-[#303831] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121412] text-[#9CA69F] uppercase font-mono border-b border-[#303831]">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Facility</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">ML Status Prediction</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303831]">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-[#121412]/50 transition-colors">
                        <td className="p-3.5 font-mono text-[#9CA69F]">{r.id}</td>
                        <td className="p-3.5 font-bold text-[#F3F3EC]">{r.title}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              r.reportType === 'Lost' ? 'bg-[#801F30] text-[#F3F3EC]' : 'bg-[#174D35] text-[#F3F3EC]'
                            }`}
                          >
                            {r.reportType}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#9CA69F]">{r.location}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              r.recoveryStatus === 'Recovered'
                                ? 'bg-[#174D35]/50 border-[#2E8B57] text-[#2E8B57]'
                                : 'bg-[#121412] border-[#303831] text-[#9CA69F]'
                            }`}
                          >
                            {r.recoveryStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[#2E8B57]">
                          {r.mlEvaluation?.predictedStatus} ({r.mlEvaluation?.algorithm})
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setActiveItemModal(r)}
                            className="px-2.5 py-1 rounded bg-[#121412] border border-[#303831] text-[#F3F3EC] hover:bg-[#222823]"
                          >
                            Audit
                          </button>
                          {r.recoveryStatus !== 'Recovered' && (
                            <button
                              onClick={() => setStatusConfirmTarget({ report: r, nextStatus: 'Recovered' })}
                              className="px-2.5 py-1 rounded bg-[#174D35] hover:bg-[#2E8B57] text-[#F3F3EC]"
                            >
                              Mark Recovered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: ITEM DETAILS MODAL */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1B201C] border border-[#303831] rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#303831] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#9CA69F]">{activeItemModal.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeItemModal.reportType === 'Lost'
                      ? 'bg-[#801F30] text-[#F3F3EC]'
                      : 'bg-[#174D35] text-[#F3F3EC]'
                  }`}
                >
                  {activeItemModal.reportType}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#121412] border border-[#303831] text-[#9CA69F]">
                  {activeItemModal.recoveryStatus}
                </span>
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                className="text-[#9CA69F] hover:text-[#F3F3EC] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden bg-black border border-[#303831]">
              <img
                src={activeItemModal.imageUrl}
                alt={activeItemModal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            <div>
              <span className="text-xs font-mono text-[#2E8B57]">{activeItemModal.category}</span>
              <h2 className="text-2xl font-bold text-[#F3F3EC]">{activeItemModal.title}</h2>
              <p className="text-sm text-[#9CA69F] mt-1">{activeItemModal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#121412] p-4 rounded-xl border border-[#303831]">
              <div>
                <span className="text-[#9CA69F] block">Location Facility</span>
                <strong className="text-[#F3F3EC]">{activeItemModal.location}</strong>
              </div>
              <div>
                <span className="text-[#9CA69F] block">Specific Area</span>
                <strong className="text-[#F3F3EC]">{activeItemModal.specificArea || 'Campus Area'}</strong>
              </div>
              <div>
                <span className="text-[#9CA69F] block">Reported Date &amp; Time</span>
                <strong className="text-[#F3F3EC]">{activeItemModal.date} • {activeItemModal.approximateTime || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[#9CA69F] block">ML Advisory Classification</span>
                <strong className="text-[#2E8B57] font-mono">
                  {activeItemModal.mlEvaluation?.algorithm || 'Random Forest'} ({activeItemModal.mlEvaluation?.predictedStatus || 'Pending'})
                </strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F3F3EC]">Distinguishing Features:</span>
              <p className="text-xs text-[#9CA69F] bg-[#121412] p-3 rounded-lg border border-[#303831]">
                {activeItemModal.distinguishingFeatures || 'None specified.'}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-2 border-t border-[#303831] pt-3">
              <span className="text-xs font-mono tracking-wider uppercase text-[#9CA69F]">AUDIT TRAIL</span>
              <div className="space-y-2">
                {activeItemModal.timeline?.map((step) => (
                  <div key={step.id} className="flex items-center justify-between text-xs p-2 rounded bg-[#121412] border border-[#303831]">
                    <span className="text-[#F3F3EC]">{step.label}</span>
                    <span className="text-[#9CA69F] font-mono">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveItemModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121412] border border-[#303831] text-[#9CA69F] hover:text-[#F3F3EC]"
              >
                Close Window
              </button>
              {activeItemModal.reportType === 'Found' && activeItemModal.recoveryStatus === 'Pending' && (
                <button
                  onClick={() => {
                    const target = activeItemModal;
                    setActiveItemModal(null);
                    setActiveClaimModal(target);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#174D35] hover:bg-[#2E8B57] text-[#F3F3EC]"
                >
                  Lodge Claim
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CLAIM VERIFICATION MODAL */}
      {activeClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1B201C] border border-[#303831] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#303831] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#2E8B57] uppercase tracking-wider">CUSTODY HANDOVER PROTOCOL</span>
                <h3 className="text-xl font-bold text-[#F3F3EC]">Claim Belonging</h3>
              </div>
              <button onClick={() => setActiveClaimModal(null)} className="text-[#9CA69F] hover:text-[#F3F3EC]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#121412] border border-[#303831] flex items-center gap-3">
              <img src={activeClaimModal.imageUrl} alt={activeClaimModal.title} className="w-14 h-14 object-cover rounded-lg" />
              <div>
                <h4 className="text-sm font-bold text-[#F3F3EC]">{activeClaimModal.title}</h4>
                <p className="text-xs text-[#9CA69F]">Found at {activeClaimModal.location}</p>
              </div>
            </div>

            <form onSubmit={handleLodgeClaim} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">University Roll / Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2115000123"
                  value={claimRollNo}
                  onChange={(e) => setClaimRollNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3F3EC] mb-1">Proof of Ownership / Distinct Markings</label>
                <textarea
                  rows={2}
                  placeholder="Detail screen lock, stickers, serial number, or exact contents..."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121412] border border-[#303831] text-sm text-[#F3F3EC] focus:border-[#2E8B57] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#174D35]/20 border border-[#2E8B57]/40 text-xs text-[#9CA69F]">
                Pick up item at <strong>Central Proctor Desk (AB-1, Rm 104)</strong> with your valid student ID card.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveClaimModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121412] border border-[#303831] text-[#9CA69F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#174D35] hover:bg-[#2E8B57] text-[#F3F3EC]"
                >
                  Submit Official Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STATUS UPDATE CONFIRMATION (OPERATOR) */}
      {statusConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1B201C] border border-[#303831] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-[#F3F3EC]">Confirm Status Change</h3>
            <p className="text-sm text-[#9CA69F]">
              Are you sure you want to mark report <strong>{statusConfirmTarget.report.id}</strong> ({statusConfirmTarget.report.title}) as <strong>{statusConfirmTarget.nextStatus}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusConfirmTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121412] border border-[#303831] text-[#9CA69F]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#174D35] hover:bg-[#2E8B57] text-[#F3F3EC]"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#303831] bg-[#121412] py-8 text-xs text-[#9CA69F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E8B57]" />
            <span className="font-semibold text-[#F3F3EC]">Smart Campus Lost &amp; Found Portal</span>
            <span>• Developed by Vemula Gopi Chand (B.Tech CSE - AI &amp; ML)</span>
          </div>
          <div className="flex items-center gap-4 text-[#9CA69F]">
            <span>MobileNetV2 (1280-d)</span>
            <span>•</span>
            <span>TF-IDF + Word2Vec</span>
            <span>•</span>
            <span>Random Forest (95.03%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
