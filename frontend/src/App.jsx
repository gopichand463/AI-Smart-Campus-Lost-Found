import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/report-lost" element={<ReportLost />} />

        <Route path="/report-found" element={<ReportFound />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;