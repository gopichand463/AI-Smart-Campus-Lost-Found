import React, { useState } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Sparkles, CheckCircle2,
  Clock, ShieldCheck, MapPin, Layers, Award, FileText,
  ChevronRight, ArrowUpRight, Info, Filter, Download
} from 'lucide-react';
import {
  BackpackVector, PhoneVector, NotebookVector, EarbudsCaseVector,
  IdCardVector, BottleVector
} from '../App';

export default function DataVisualsView({ onNavigateReport, onNavigateBrowse, showToast }) {
  // Filter Time Period: 'semester' | 'year' | 'month'
  const [timeRange, setTimeRange] = useState('semester');
  // Donut chart active hover/click slice: 'recovered' | 'pending' | 'closed' | null
  const [activeSlice, setActiveSlice] = useState(null);
  // Monthly trend hovered month index
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null);
  // Selected ML model for deep viva inspection: 'rf' | 'lr' | 'dt' | 'gb'
  const [selectedModel, setSelectedModel] = useState('rf');

  // Multiplier for time range simulation
  const multiplier = timeRange === 'month' ? 0.28 : timeRange === 'year' ? 1.85 : 1.0;

  // Key KPI Metrics
  const totalItems = Math.round(1248 * multiplier);
  const recoveredCount = Math.round(599 * multiplier);
  const pendingCount = Math.round(474 * multiplier);
  const closedCount = Math.round(175 * multiplier);

  // Status slices for Donut / Pie Chart
  const statusSlices = [
    {
      id: 'recovered',
      label: 'Recovered',
      count: recoveredCount,
      pct: 48,
      color: '#1E3A2F', // Forest Green
      bg: '#E1EFE6',
      text: '#2E5F46',
      desc: 'Belongings successfully identified and returned to students.',
    },
    {
      id: 'pending',
      label: 'Pending',
      count: pendingCount,
      pct: 38,
      color: '#3D7A5A', // Sage Green
      bg: '#D5E8DB',
      text: '#1E3A2F',
      desc: 'Active reports currently undergoing automated AI matching.',
    },
    {
      id: 'closed',
      label: 'Closed',
      count: closedCount,
      pct: 14,
      color: '#C24136', // Crimson Red
      bg: '#FCEAE6',
      text: '#C24136',
      desc: 'Archived after 60-day campus retention policy expiry.',
    },
  ];

  // Donut SVG circumference calculation (r = 68, C = 427.26)
  const C = 427.26;
  const offsets = [0, -427.26 * 0.48, -427.26 * (0.48 + 0.38)];
  const dashLengths = [427.26 * 0.48, 427.26 * 0.38, 427.26 * 0.14];

  const activeSliceData = statusSlices.find((s) => s.id === activeSlice) || null;

  // Monthly Trajectory Data (July - November)
  const monthlyData = [
    { month: 'Jul', lost: Math.round(110 * multiplier), found: Math.round(85 * multiplier), x: 50, lostY: 132, foundY: 142 },
    { month: 'Aug', lost: Math.round(280 * multiplier), found: Math.round(195 * multiplier), x: 145, lostY: 72, foundY: 102 },
    { month: 'Sep', lost: Math.round(310 * multiplier), found: Math.round(260 * multiplier), x: 240, lostY: 62, foundY: 79 },
    { month: 'Oct', lost: Math.round(340 * multiplier), found: Math.round(290 * multiplier), x: 335, lostY: 51, foundY: 69 },
    { month: 'Nov', lost: Math.round(208 * multiplier), found: Math.round(185 * multiplier), x: 430, lostY: 97, foundY: 105 },
  ];

  // Category Breakdown Data
  const categories = [
    {
      name: 'Bags & Backpacks',
      count: Math.round(342 * multiplier),
      pct: 27.4,
      color: '#3D7A5A',
      thumbBg: '#D5E8DB',
      renderIcon: () => <BackpackVector />,
    },
    {
      name: 'Smartphones & Tech',
      count: Math.round(310 * multiplier),
      pct: 24.8,
      color: '#D87A5B',
      thumbBg: '#FCE3D2',
      renderIcon: () => <PhoneVector variant="black" />,
    },
    {
      name: 'Student IDs & Cards',
      count: Math.round(245 * multiplier),
      pct: 19.6,
      color: '#4B7761',
      thumbBg: '#D8ECE0',
      renderIcon: () => <IdCardVector />,
    },
    {
      name: 'Insulated Water Bottles',
      count: Math.round(184 * multiplier),
      pct: 14.7,
      color: '#628C76',
      thumbBg: '#E1EFE6',
      renderIcon: () => <BottleVector />,
    },
    {
      name: 'Calculators & Stationary',
      count: Math.round(112 * multiplier),
      pct: 9.0,
      color: '#7E1D2A',
      thumbBg: '#FAD4D8',
      renderIcon: () => <NotebookVector />,
    },
    {
      name: 'Earbuds & Accessories',
      count: Math.round(55 * multiplier),
      pct: 4.5,
      color: '#444945',
      thumbBg: '#E5E8DF',
      renderIcon: () => <EarbudsCaseVector />,
    },
  ];

  // Hotspot Locations
  const hotspots = [
    { name: 'Central Library', sub: 'Block 3 Study Wings', count: Math.round(380 * multiplier), pct: 95 },
    { name: 'Academic Block', sub: 'AB-1 Lecture Halls', count: Math.round(290 * multiplier), pct: 72 },
    { name: 'Cafeteria Patio', sub: 'West Dining Hall', count: Math.round(240 * multiplier), pct: 60 },
    { name: 'Sports Complex', sub: 'Indoor Courts & Bleachers', count: Math.round(185 * multiplier), pct: 46 },
    { name: 'Main Campus Gate', sub: 'Turnstiles & Bus Bay', count: Math.round(153 * multiplier), pct: 38 },
  ];

  // ML Models Comparison (Trained on 120,000 synthetic campus records)
  const mlModels = {
    rf: {
      name: 'Random Forest Classifier',
      badge: 'Selected for Production ⭐',
      accuracy: 88.6,
      f1: 87.2,
      precision: 89.1,
      recall: 86.8,
      latency: '4.2 ms',
      datasetSize: '120,000 records',
      desc: 'Ensemble of 100 decision trees. Selected as the primary production model due to superior generalization on unseen campus item attributes, handling noisy text and missing values robustly.',
    },
    lr: {
      name: 'Logistic Regression',
      badge: 'Linear Baseline',
      accuracy: 78.4,
      f1: 76.1,
      precision: 77.8,
      recall: 75.3,
      latency: '0.8 ms',
      datasetSize: '120,000 records',
      desc: 'Fast linear probability estimator. Serves as benchmark baseline; struggles with non-linear feature interactions between location and time-of-day.',
    },
    dt: {
      name: 'Decision Tree (CART)',
      badge: 'Single Tree Baseline',
      accuracy: 81.2,
      f1: 80.3,
      precision: 81.0,
      recall: 79.8,
      latency: '1.4 ms',
      datasetSize: '120,000 records',
      desc: 'Max depth tuned to 14. Highly interpretable decision rules, but exhibits slight overfitting on synthetic minority classes.',
    },
    gb: {
      name: 'Gradient Boosting (XGBoost)',
      badge: 'High Accuracy Model',
      accuracy: 91.4,
      f1: 90.5,
      precision: 91.8,
      recall: 89.9,
      latency: '14.8 ms',
      datasetSize: '120,000 records',
      desc: 'Sequential gradient boosted trees achieving highest validation accuracy; slightly higher inference latency compared to Random Forest.',
    },
  };

  const currentModel = mlModels[selectedModel];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 relative">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-[#787F79]">
        <button onClick={onNavigateBrowse} className="hover:underline">Home</button> / <span className="text-[#1A1D1B] font-medium">Data visuals &amp; Analytics</span>
      </div>

      {/* Header Row: Title, Subtitle & Time Range Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#EDEAE2]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#E1EFE6] text-[#2E5F46] text-xs font-semibold px-3 py-1 rounded-full">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Campus Intelligence &amp; ML Evaluation</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1D1B] tracking-tight">
            Data visuals &amp; Insights
          </h1>
          <p className="text-sm text-[#6C726D] leading-relaxed">
            Real-time analytics on lost belongings, campus recovery trajectories, and machine learning models trained on 120,000 synthetic campus records for BTech CSE (AI &amp; ML) capstone viva.
          </p>
        </div>

        {/* Time Period Selector Tabs */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#EDEAE2] shadow-2xs self-start md:self-auto">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              timeRange === 'month' ? 'bg-[#1E3A2F] text-white' : 'text-[#6C726D] hover:text-[#1A1D1B]'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('semester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              timeRange === 'semester' ? 'bg-[#1E3A2F] text-white' : 'text-[#6C726D] hover:text-[#1A1D1B]'
            }`}
          >
            Fall Semester 2026
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              timeRange === 'year' ? 'bg-[#1E3A2F] text-white' : 'text-[#6C726D] hover:text-[#1A1D1B]'
            }`}
          >
            Full Academic Year
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. TOP KPI SCORECARD GRID (4 Cards)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Items */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEAE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6C726D]">
            <span className="font-medium">Total Belongs Logged</span>
            <span className="bg-[#E1EFE6] text-[#2E5F46] font-semibold px-2 py-0.5 rounded-full text-[11px]">+14.2%</span>
          </div>
          <div className="font-serif font-bold text-3xl text-[#1A1D1B]">
            {totalItems.toLocaleString()}
          </div>
          <div className="text-xs text-[#6C726D] flex items-center justify-between pt-1 border-t border-[#F0EDE6]">
            <span>Found: {Math.round(totalItems * 0.65)}</span>
            <span>Lost: {Math.round(totalItems * 0.35)}</span>
          </div>
        </div>

        {/* Card 2: Recovery Success Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEAE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6C726D]">
            <span className="font-medium">Recovery Success Rate</span>
            <span className="bg-[#D8ECE0] text-[#1E3A2F] font-semibold px-2 py-0.5 rounded-full text-[11px]">ML Predicted</span>
          </div>
          <div className="font-serif font-bold text-3xl text-[#1E3A2F]">
            76.4%
          </div>
          <div className="text-xs text-[#6C726D] flex items-center justify-between pt-1 border-t border-[#F0EDE6]">
            <span>Recovered: {recoveredCount}</span>
            <span>Closed: {closedCount}</span>
          </div>
        </div>

        {/* Card 3: AI Match Confidence */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEAE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6C726D]">
            <span className="font-medium">AI Multimodal Confidence</span>
            <span className="bg-[#FCE3D2] text-[#8C3A27] font-semibold px-2 py-0.5 rounded-full text-[11px]">MobileNetV2</span>
          </div>
          <div className="font-serif font-bold text-3xl text-[#1A1D1B]">
            89.2%
          </div>
          <div className="text-xs text-[#6C726D] flex items-center justify-between pt-1 border-t border-[#F0EDE6]">
            <span>Cosine similarity: &gt;0.75</span>
            <span>TF-IDF NLP: Active</span>
          </div>
        </div>

        {/* Card 4: Average Resolution Time */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDEAE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6C726D]">
            <span className="font-medium">Avg Resolution Time</span>
            <span className="bg-[#FCEAE6] text-[#C24136] font-semibold px-2 py-0.5 rounded-full text-[11px]">68% Faster</span>
          </div>
          <div className="font-serif font-bold text-3xl text-[#1A1D1B]">
            2.4 Days
          </div>
          <div className="text-xs text-[#6C726D] flex items-center justify-between pt-1 border-t border-[#F0EDE6]">
            <span>Manual baseline: 8.2 d</span>
            <span>Speedup: 3.4x</span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. CHARTS ROW 1: DONUT / PIE CHART & MONTHLY TREND LINE CHART
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Donut / Pie Chart (Recovery Status Distribution) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-7 border border-[#EDEAE2] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#C24136]">
                SUPERVISED 3-CLASS CLASSIFICATION
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1A1D1B]">
                Recovery Status Distribution
              </h3>
            </div>
            <span className="text-xs text-[#6C726D]">Interactive Pie</span>
          </div>

          {/* SVG Donut Chart with Interactive Segments */}
          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 200 200" className="w-56 h-56 transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="#EDEAE2"
                strokeWidth="22"
              />

              {/* Segment 1: Recovered (48%) */}
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="#1E3A2F"
                strokeWidth={activeSlice === 'recovered' ? '28' : '22'}
                strokeDasharray={`${dashLengths[0]} ${C - dashLengths[0]}`}
                strokeDashoffset={offsets[0]}
                className="cursor-pointer transition-all duration-200 hover:opacity-90"
                onMouseEnter={() => setActiveSlice('recovered')}
                onClick={() => setActiveSlice(activeSlice === 'recovered' ? null : 'recovered')}
              />

              {/* Segment 2: Pending (38%) */}
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="#3D7A5A"
                strokeWidth={activeSlice === 'pending' ? '28' : '22'}
                strokeDasharray={`${dashLengths[1]} ${C - dashLengths[1]}`}
                strokeDashoffset={offsets[1]}
                className="cursor-pointer transition-all duration-200 hover:opacity-90"
                onMouseEnter={() => setActiveSlice('pending')}
                onClick={() => setActiveSlice(activeSlice === 'pending' ? null : 'pending')}
              />

              {/* Segment 3: Closed (14%) */}
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="#C24136"
                strokeWidth={activeSlice === 'closed' ? '28' : '22'}
                strokeDasharray={`${dashLengths[2]} ${C - dashLengths[2]}`}
                strokeDashoffset={offsets[2]}
                className="cursor-pointer transition-all duration-200 hover:opacity-90"
                onMouseEnter={() => setActiveSlice('closed')}
                onClick={() => setActiveSlice(activeSlice === 'closed' ? null : 'closed')}
              />
            </svg>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSliceData ? (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C726D]">
                    {activeSliceData.label}
                  </span>
                  <span className="font-serif font-bold text-3xl text-[#1A1D1B]">
                    {activeSliceData.pct}%
                  </span>
                  <span className="text-xs text-[#6C726D]">
                    {activeSliceData.count} items
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C726D]">
                    Total Catalog
                  </span>
                  <span className="font-serif font-bold text-2xl text-[#1A1D1B]">
                    {totalItems}
                  </span>
                  <span className="text-[11px] text-[#2E5F46] font-medium">
                    Hover slice
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend with Detail Tags */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {statusSlices.map((slice) => {
              const isSelected = activeSlice === slice.id;
              return (
                <button
                  key={slice.id}
                  onClick={() => setActiveSlice(isSelected ? null : slice.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#1A1D1B] shadow-xs'
                      : 'border-[#EDEAE2] hover:border-[#D5D2C8]'
                  }`}
                  style={{ backgroundColor: isSelected ? slice.bg : '#FAF9F5' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-bold text-[#1A1D1B]">{slice.label}</span>
                  </div>
                  <div className="text-base font-serif font-bold text-[#1A1D1B]">
                    {slice.pct}%
                  </div>
                  <div className="text-[11px] text-[#6C726D]">
                    {slice.count} items
                  </div>
                </button>
              );
            })}
          </div>

          {/* Descriptive Help Note */}
          <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EDEAE2] text-xs text-[#525753] leading-relaxed">
            {activeSliceData ? (
              <p>
                <strong>{activeSliceData.label} ({activeSliceData.pct}%):</strong> {activeSliceData.desc}
              </p>
            ) : (
              <p>
                <strong>ML Target Classes:</strong> Evaluates three discrete states (Pending, Recovered, Closed) predicted by the supervised pipeline to prevent stale campus backlog.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Monthly Lost vs Found Trends (Line & Area Chart) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-[#EDEAE2] shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#1E3A2F]">
                SEMESTER TIMELINE
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1A1D1B]">
                Monthly Lost vs. Found Trends
              </h3>
            </div>

            {/* Legend Pills */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#C24136]" />
                <span className="text-[#1A1D1B]">Lost Belongings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1E3A2F]" />
                <span className="text-[#1A1D1B]">Found &amp; Claimed</span>
              </div>
            </div>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="relative pt-2">
            <svg viewBox="0 0 480 200" className="w-full h-auto overflow-visible">
              <defs>
                {/* Lost Curve Gradient Fill */}
                <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C24136" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#C24136" stopOpacity="0.01" />
                </linearGradient>
                {/* Found Curve Gradient Fill */}
                <linearGradient id="foundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A2F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E3A2F" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Subtle Gridlines */}
              <line x1="30" y1="30" x2="460" y2="30" stroke="#F0EDE6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="75" x2="460" y2="75" stroke="#F0EDE6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="460" y2="120" stroke="#F0EDE6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="165" x2="460" y2="165" stroke="#E5E2D8" strokeWidth="1" />

              {/* Y-Axis Value Labels */}
              <text x="22" y="34" fill="#9CA3AF" fontSize="9" textAnchor="end">350</text>
              <text x="22" y="79" fill="#9CA3AF" fontSize="9" textAnchor="end">250</text>
              <text x="22" y="124" fill="#9CA3AF" fontSize="9" textAnchor="end">150</text>
              <text x="22" y="168" fill="#9CA3AF" fontSize="9" textAnchor="end">0</text>

              {/* Lost Area Fill */}
              <path
                d="M50 132 L145 72 L240 62 L335 51 L430 97 L430 165 L50 165 Z"
                fill="url(#lostGradient)"
              />
              {/* Lost Path Stroke */}
              <path
                d="M50 132 L145 72 L240 62 L335 51 L430 97"
                fill="none"
                stroke="#C24136"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Found Area Fill */}
              <path
                d="M50 142 L145 102 L240 79 L335 69 L430 105 L430 165 L50 165 Z"
                fill="url(#foundGradient)"
              />
              {/* Found Path Stroke */}
              <path
                d="M50 142 L145 102 L240 79 L335 69 L430 105"
                fill="none"
                stroke="#1E3A2F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points & Interactivity */}
              {monthlyData.map((d, idx) => (
                <g key={d.month} className="cursor-pointer" onMouseEnter={() => setHoveredMonthIdx(idx)}>
                  {/* Vertical Hover Guide Line */}
                  {hoveredMonthIdx === idx && (
                    <line x1={d.x} y1="20" x2={d.x} y2="165" stroke="#1A1D1B" strokeWidth="1.2" strokeDasharray="2 2" />
                  )}

                  {/* Lost Point Dot */}
                  <circle
                    cx={d.x}
                    cy={d.lostY}
                    r={hoveredMonthIdx === idx ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#C24136"
                    strokeWidth="2.5"
                    className="transition-all"
                  />

                  {/* Found Point Dot */}
                  <circle
                    cx={d.x}
                    cy={d.foundY}
                    r={hoveredMonthIdx === idx ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#1E3A2F"
                    strokeWidth="2.5"
                    className="transition-all"
                  />

                  {/* X-Axis Month Label */}
                  <text
                    x={d.x}
                    y="185"
                    fill={hoveredMonthIdx === idx ? '#1A1D1B' : '#6C726D'}
                    fontWeight={hoveredMonthIdx === idx ? 'bold' : 'normal'}
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip Card */}
            {hoveredMonthIdx !== null && (
              <div className="mt-3 p-3 bg-[#FAF9F5] border border-[#EDEAE2] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <span className="font-bold text-[#1A1D1B]">
                  {monthlyData[hoveredMonthIdx].month} 2026 Focus:
                </span>
                <span className="text-[#C24136] font-semibold">
                  Lost: {monthlyData[hoveredMonthIdx].lost}
                </span>
                <span className="text-[#1E3A2F] font-semibold">
                  Found: {monthlyData[hoveredMonthIdx].found}
                </span>
                <span className="bg-[#E1EFE6] text-[#2E5F46] font-bold px-2 py-0.5 rounded">
                  {Math.round((monthlyData[hoveredMonthIdx].found / monthlyData[hoveredMonthIdx].lost) * 100)}% Match Rate
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#6C726D] pt-1">
            <strong>Key Insight:</strong> Peak reports occur in August (semester reopening) and October (midterm exams). Found item reports lag lost reports by an average of 48 to 72 hours.
          </p>
        </div>
      </div>

      {/* =====================================================================
          3. CHARTS ROW 2: CATEGORY BREAKDOWN & CAMPUS HOTSPOTS
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items by Category (Horizontal Stacked Bar Chart) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#EDEAE2] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#3D7A5A]">
                ITEM TAXONOMY
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1A1D1B]">
                Items Logged by Category
              </h3>
            </div>
            <span className="text-xs text-[#6C726D]">6 Categories</span>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-4 pt-1">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg p-1 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.thumbBg }}
                    >
                      {cat.renderIcon()}
                    </div>
                    <span className="font-medium text-[#1A1D1B]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6C726D] font-mono">{cat.count} items</span>
                    <span className="font-bold text-[#1A1D1B] w-12 text-right">{cat.pct}%</span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-[#EDEAE2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.pct * 3.2}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-[#6C726D] bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
            🎒 <strong>Bags &amp; Backpacks</strong> represent the highest single loss category, followed by portable electronics (smartphones and charging adapters).
          </div>
        </div>

        {/* Right Column: Campus Hotspot Locations (Vertical Bar Chart) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-[#EDEAE2] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#C24136]">
                GEOGRAPHIC DISTRIBUTION
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1A1D1B]">
                Campus Loss Hotspots
              </h3>
            </div>
            <span className="text-xs text-[#6C726D]">Top 5 Locations</span>
          </div>

          {/* Vertical Bar Chart */}
          <div className="pt-4">
            <div className="flex items-end justify-between gap-3 h-48 border-b border-[#EDEAE2] pb-2 px-2">
              {hotspots.map((spot) => (
                <div key={spot.name} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Top Item Count Value */}
                  <span className="text-[11px] font-bold text-[#1A1D1B] group-hover:text-[#1E3A2F]">
                    {spot.count}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[44px] bg-[#EDEAE2] h-36 rounded-t-xl overflow-hidden flex items-end">
                    <div
                      className="w-full rounded-t-xl bg-[#1E3A2F] group-hover:bg-[#162C23] transition-all"
                      style={{ height: `${spot.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hotspot Labels */}
            <div className="flex items-start justify-between gap-3 pt-3 px-1 text-center">
              {hotspots.map((spot) => (
                <div key={spot.name} className="flex-1">
                  <span className="text-xs font-semibold text-[#1A1D1B] block leading-tight">
                    {spot.name}
                  </span>
                  <span className="text-[10px] text-[#6C726D] block mt-0.5">
                    {spot.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#6C726D] bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
            📍 <strong>Central Library Block 3</strong> accounts for 30.4% of total reports due to study desks, reading cubicles, and charging stations.
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. ROW 3: MACHINE LEARNING ALGORITHM BENCHMARK (Capstone Slide 5)
          ===================================================================== */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#EDEAE2] shadow-xs space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EDE6] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#E1EFE6] text-[#2E5F46] text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BTech Academic Capstone Viva Requirement</span>
            </div>
            <h3 className="font-serif font-bold text-3xl text-[#1A1D1B]">
              Supervised Recovery Status Prediction Models
            </h3>
            <p className="text-xs text-[#6C726D] mt-1">
              Comparison across 4 candidate ML algorithms evaluated on ~120,000 synthetic campus tabular records.
            </p>
          </div>

          {/* Model Switcher Buttons */}
          <div className="flex items-center gap-2">
            {Object.keys(mlModels).map((key) => {
              const m = mlModels[key];
              const isSelected = selectedModel === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1E3A2F] text-white shadow-xs'
                      : 'bg-[#FAF9F5] border border-[#EDEAE2] text-[#4A4E4B] hover:bg-[#F0EDE6]'
                  }`}
                >
                  {key.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Comparison Graph & Selected Card Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Dual Bar Comparison Graph */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between text-xs text-[#6C726D]">
              <span className="font-medium">Algorithm Performance (Accuracy &amp; F1-Score)</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#1E3A2F]" />
                  <span>Accuracy (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#6B7280]" />
                  <span>F1-Score (%)</span>
                </div>
              </div>
            </div>

            {/* Model Bars */}
            <div className="space-y-4">
              {Object.keys(mlModels).map((key) => {
                const m = mlModels[key];
                const isSelected = selectedModel === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedModel(key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1E3A2F] bg-[#FAF9F5] shadow-xs'
                        : 'border-[#EDEAE2] hover:border-[#D5D2C8]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#1A1D1B]">{m.name}</strong>
                        {key === 'rf' && (
                          <span className="bg-[#E1EFE6] text-[#2E5F46] font-bold text-[10px] px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1E3A2F]">
                        Acc: {m.accuracy}% · F1: {m.f1}%
                      </span>
                    </div>

                    {/* Dual Horizontal Bars */}
                    <div className="space-y-1.5">
                      {/* Accuracy Bar */}
                      <div className="w-full bg-[#EDEAE2] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1E3A2F] rounded-full"
                          style={{ width: `${m.accuracy}%` }}
                        />
                      </div>
                      {/* F1 Bar */}
                      <div className="w-full bg-[#EDEAE2] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6B7280] rounded-full"
                          style={{ width: `${m.f1}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector Box: Detailed Model Metrics */}
          <div className="lg:col-span-5 bg-[#FAF9F5] rounded-3xl p-6 border border-[#EDEAE2] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-[#C24136]">
                ACTIVE MODEL INSPECTOR
              </span>
              <span className="text-xs bg-[#E1EFE6] text-[#2E5F46] font-semibold px-2.5 py-0.5 rounded-full">
                {currentModel.badge}
              </span>
            </div>

            <h4 className="font-serif font-bold text-2xl text-[#1A1D1B]">
              {currentModel.name}
            </h4>

            <p className="text-xs text-[#525753] leading-relaxed">
              {currentModel.desc}
            </p>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#EDEAE2]">
                <span className="text-[11px] text-[#6C726D] block">Validation Accuracy</span>
                <span className="font-serif font-bold text-xl text-[#1E3A2F]">
                  {currentModel.accuracy}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EDEAE2]">
                <span className="text-[11px] text-[#6C726D] block">Weighted F1-Score</span>
                <span className="font-serif font-bold text-xl text-[#1A1D1B]">
                  {currentModel.f1}%
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EDEAE2]">
                <span className="text-[11px] text-[#6C726D] block">Inference Latency</span>
                <span className="font-mono font-bold text-sm text-[#1A1D1B]">
                  {currentModel.latency}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EDEAE2]">
                <span className="text-[11px] text-[#6C726D] block">Training Sample Size</span>
                <span className="font-mono font-bold text-sm text-[#1A1D1B]">
                  120,000
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Report exported: ${currentModel.name} evaluation metrics ready.`)}
              className="w-full bg-[#1E3A2F] hover:bg-[#162C23] text-white text-xs font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Viva Analytics Report (.JSON)</span>
            </button>
          </div>
        </div>

        {/* ML Architecture Pipeline Diagram */}
        <div className="border-t border-[#F0EDE6] pt-6 space-y-3">
          <span className="text-xs font-semibold text-[#1A1D1B] uppercase tracking-wider block">
            End-to-End Prediction Pipeline:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
              <span className="text-[10px] font-bold text-[#6C726D] block">STAGE 1</span>
              <strong className="text-xs text-[#1A1D1B] block mt-0.5">Synthetic Data</strong>
              <span className="text-[11px] text-[#6C726D]">120k Tabular Records</span>
            </div>
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
              <span className="text-[10px] font-bold text-[#6C726D] block">STAGE 2</span>
              <strong className="text-xs text-[#1A1D1B] block mt-0.5">Preprocessing</strong>
              <span className="text-[11px] text-[#6C726D]">One-Hot &amp; Scaling</span>
            </div>
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
              <span className="text-[10px] font-bold text-[#6C726D] block">STAGE 3</span>
              <strong className="text-xs text-[#1A1D1B] block mt-0.5">Feature Extraction</strong>
              <span className="text-[11px] text-[#6C726D]">Time, Zone, Category</span>
            </div>
            <div className="bg-[#E1EFE6] p-3 rounded-xl border border-[#D5E8DB]">
              <span className="text-[10px] font-bold text-[#2E5F46] block">STAGE 4</span>
              <strong className="text-xs text-[#1E3A2F] block mt-0.5">Random Forest</strong>
              <span className="text-[11px] text-[#2E5F46]">Supervised 100 Trees</span>
            </div>
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EDEAE2]">
              <span className="text-[10px] font-bold text-[#6C726D] block">STAGE 5</span>
              <strong className="text-xs text-[#1A1D1B] block mt-0.5">Predicted Status</strong>
              <span className="text-[11px] text-[#C24136]">Pending/Recovered/Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
