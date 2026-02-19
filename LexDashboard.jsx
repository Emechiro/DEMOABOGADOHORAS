import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Briefcase, Clock, Users, Calendar,
  FileText, Settings, Scale, Bell, Search, TrendingUp,
  AlertCircle, CheckCircle, Plus, Filter, Download, Eye,
  Edit, Trash2, ChevronDown, Menu, X, Gavel, MapPin,
  ChevronRight, Star, MoreVertical, ArrowUp, ArrowDown,
  PieChart as PieIcon, BarChart2, BookOpen, Phone, Mail,
  RefreshCw, Paperclip, MessageSquare, Shield
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

/* ─── STYLES ─────────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: #07090f; color: #e8e2d6; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #0f1320; }
::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 4px; }

.app { display: flex; height: 100vh; overflow: hidden; }

/* SIDEBAR */
.sidebar {
  width: 260px; min-width: 260px;
  background: linear-gradient(160deg, #0c1019 0%, #0a0d16 100%);
  border-right: 1px solid #c9a84c22;
  display: flex; flex-direction: column;
  transition: width .3s ease, min-width .3s ease;
  position: relative; z-index: 100;
  overflow: hidden;
}
.sidebar.collapsed { width: 70px; min-width: 70px; }
.sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid #c9a84c18;
  display: flex; align-items: center; gap: 12px;
}
.logo-icon {
  width: 38px; height: 38px; min-width: 38px;
  background: linear-gradient(135deg, #c9a84c, #e8c96e);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; color: #07090f;
}
.logo-text { overflow: hidden; white-space: nowrap; }
.logo-text h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px; font-weight: 700; color: #f5f0e8;
  letter-spacing: .5px; line-height: 1;
}
.logo-text p { font-size: 10px; color: #c9a84c; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }

.nav-section { padding: 16px 12px 8px; overflow: hidden; white-space: nowrap; }
.nav-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9a84c66; padding: 0 8px; margin-bottom: 6px; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 10px; border-radius: 8px; cursor: pointer;
  font-size: 13.5px; font-weight: 400; color: #9090a8;
  transition: all .2s; margin-bottom: 2px; white-space: nowrap;
}
.nav-item:hover { background: #c9a84c10; color: #e8e2d6; }
.nav-item.active {
  background: linear-gradient(90deg, #c9a84c18, #c9a84c08);
  color: #c9a84c; font-weight: 500;
  border-left: 2px solid #c9a84c;
}
.nav-item svg { min-width: 18px; }
.nav-badge {
  margin-left: auto; background: #c9a84c;
  color: #07090f; font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px;
}
.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #c9a84c18;
  padding: 16px 12px;
}
.user-card {
  display: flex; align-items: center; gap: 10px;
  padding: 8px; border-radius: 8px; cursor: pointer;
  transition: background .2s;
}
.user-card:hover { background: #c9a84c10; }
.user-avatar {
  width: 34px; height: 34px; min-width: 34px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid #c9a84c44;
}
.user-info { overflow: hidden; }
.user-info p { font-size: 13px; font-weight: 500; color: #e8e2d6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-info span { font-size: 11px; color: #9090a8; }

/* MAIN */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* TOPBAR */
.topbar {
  height: 60px; min-height: 60px;
  background: #07090f;
  border-bottom: 1px solid #c9a84c18;
  display: flex; align-items: center;
  padding: 0 24px; gap: 16px;
}
.topbar-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-weight: 600; color: #f5f0e8;
  white-space: nowrap;
}
.search-bar {
  flex: 1; max-width: 380px; margin-left: auto;
  display: flex; align-items: center; gap: 8px;
  background: #0f1320; border: 1px solid #c9a84c22;
  border-radius: 8px; padding: 8px 14px;
}
.search-bar input {
  background: none; border: none; outline: none;
  color: #e8e2d6; font-size: 13px; width: 100%;
  font-family: 'DM Sans', sans-serif;
}
.search-bar input::placeholder { color: #555568; }
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: #0f1320; border: 1px solid #c9a84c22;
  color: #9090a8; cursor: pointer; transition: all .2s;
  position: relative;
}
.icon-btn:hover { border-color: #c9a84c66; color: #c9a84c; }
.notif-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; background: #c9a84c;
  border-radius: 50%; border: 1.5px solid #07090f;
}

/* CONTENT */
.content { flex: 1; overflow-y: auto; padding: 24px; }

/* CARDS */
.card {
  background: linear-gradient(135deg, #0d1018, #0a0c16);
  border: 1px solid #c9a84c18;
  border-radius: 12px; padding: 20px;
  transition: border-color .2s, box-shadow .2s;
}
.card:hover { border-color: #c9a84c33; box-shadow: 0 0 24px #c9a84c08; }

/* GRID */
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 20px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }

/* STAT CARD */
.stat-card { position: relative; overflow: hidden; }
.stat-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px; font-weight: 700; color: #f5f0e8;
  line-height: 1;
}
.stat-label { font-size: 12px; color: #7070888; margin-top: 4px; color: #70708a; }
.stat-change {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; margin-top: 8px; font-weight: 500;
}
.stat-change.up { color: #4caf7d; }
.stat-change.down { color: #e05555; }
.stat-bg {
  position: absolute; right: -10px; bottom: -10px;
  opacity: .04; transform: scale(1.4);
}

/* TABLE */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead th {
  text-align: left; font-size: 10.5px; letter-spacing: 1.5px;
  text-transform: uppercase; color: #c9a84c88; padding: 10px 14px;
  border-bottom: 1px solid #c9a84c18; font-weight: 500;
}
tbody td { padding: 13px 14px; border-bottom: 1px solid #c9a84c0d; font-size: 13px; vertical-align: middle; }
tbody tr:hover td { background: #c9a84c06; }
tbody tr:last-child td { border-bottom: none; }

/* BADGES */
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
}
.badge-active { background: #4caf7d18; color: #4caf7d; border: 1px solid #4caf7d33; }
.badge-pending { background: #f5a62318; color: #f5a623; border: 1px solid #f5a62333; }
.badge-urgent { background: #e0555518; color: #e05555; border: 1px solid #e0555533; }
.badge-closed { background: #70708a18; color: #70708a; border: 1px solid #70708a33; }
.badge-appeal { background: #5b8dee18; color: #5b8dee; border: 1px solid #5b8dee33; }

/* BUTTON */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: 8px; font-size: 13px;
  font-weight: 500; cursor: pointer; border: none;
  font-family: 'DM Sans', sans-serif; transition: all .2s;
}
.btn-gold {
  background: linear-gradient(135deg, #c9a84c, #e8c96e);
  color: #07090f;
}
.btn-gold:hover { opacity: .9; box-shadow: 0 4px 20px #c9a84c44; }
.btn-outline {
  background: none; border: 1px solid #c9a84c44; color: #c9a84c;
}
.btn-outline:hover { background: #c9a84c10; }
.btn-ghost { background: #0f1320; color: #9090a8; border: 1px solid #c9a84c18; }
.btn-ghost:hover { color: #e8e2d6; border-color: #c9a84c33; }

/* SECTION HEADER */
.sec-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.sec-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; font-weight: 600; color: #f5f0e8;
}
.sec-subtitle { font-size: 12px; color: #70708a; margin-top: 2px; }

/* AVATAR */
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  object-fit: cover; border: 2px solid #c9a84c22;
}
.avatar-stack { display: flex; }
.avatar-stack .avatar { margin-right: -8px; border: 2px solid #0d1018; }

/* PROGRESS */
.progress-bar { height: 4px; background: #1a1e2d; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #c9a84c, #e8c96e); }

/* TIMELINE */
.timeline-item { display: flex; gap: 14px; padding-bottom: 18px; position: relative; }
.timeline-item:not(:last-child)::before {
  content: ''; position: absolute; left: 17px; top: 34px;
  width: 1px; height: calc(100% - 20px); background: #c9a84c18;
}
.timeline-dot {
  width: 34px; height: 34px; min-width: 34px;
  border-radius: 50%; border: 2px solid #c9a84c33;
  background: #0f1320; display: flex; align-items: center;
  justify-content: center; color: #c9a84c;
}

/* HOUR BLOCK */
.hour-block {
  background: linear-gradient(90deg, #c9a84c18, #c9a84c08);
  border-left: 3px solid #c9a84c;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px; margin-bottom: 10px; cursor: pointer;
  transition: all .2s;
}
.hour-block:hover { transform: translateX(4px); background: linear-gradient(90deg, #c9a84c28, #c9a84c10); }

/* JUDGE CARD */
.judge-card { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #c9a84c0d; }
.judge-card:last-child { border-bottom: none; }

/* TABS */
.tabs { display: flex; gap: 2px; background: #0f1320; padding: 4px; border-radius: 8px; border: 1px solid #c9a84c18; margin-bottom: 20px; }
.tab { padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; color: #70708a; transition: all .2s; }
.tab.active { background: #c9a84c; color: #07090f; font-weight: 500; }

/* PRIORITY DOT */
.prio-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

/* GOLD LINE */
.gold-line { height: 1px; background: linear-gradient(90deg, #c9a84c44, transparent); margin: 20px 0; }

/* FLOATING NEW */
.fab {
  position: fixed; bottom: 28px; right: 28px;
  background: linear-gradient(135deg, #c9a84c, #e8c96e);
  color: #07090f; border: none; border-radius: 14px;
  width: 52px; height: 52px; font-size: 24px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 8px 28px #c9a84c44;
  transition: all .2s; z-index: 50;
}
.fab:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 12px 36px #c9a84c66; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: #07090fcc; backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal {
  background: linear-gradient(135deg, #0d1018, #0a0c16);
  border: 1px solid #c9a84c33; border-radius: 16px;
  padding: 28px; width: 560px; max-width: 95vw;
  max-height: 85vh; overflow-y: auto;
}
.modal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px; font-weight: 700; color: #f5f0e8; margin-bottom: 20px;
}
.form-group { margin-bottom: 16px; }
.form-label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #c9a84c99; margin-bottom: 6px; display: block; }
.form-input {
  width: 100%; background: #0f1320; border: 1px solid #c9a84c22;
  border-radius: 8px; padding: 10px 14px; color: #e8e2d6;
  font-size: 13.5px; font-family: 'DM Sans', sans-serif;
  outline: none; transition: border .2s;
}
.form-input:focus { border-color: #c9a84c66; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* RESPONSIVE */
@media (max-width: 1100px) {
  .grid-4 { grid-template-columns: repeat(2,1fr); }
  .grid-3 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .sidebar { position: fixed; left: -260px; height: 100vh; transition: left .3s; }
  .sidebar.mobile-open { left: 0; }
  .sidebar.collapsed { width: 260px; min-width: 260px; }
  .grid-4, .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .content { padding: 16px; }
  .topbar { padding: 0 16px; }
  .topbar-title { font-size: 18px; }
  .form-grid { grid-template-columns: 1fr; }
}
`;

/* ─── DATA ────────────────────────────────────────────────── */
const LAWYERS = [
  { id: 1, name: "Dra. Valentina Torres", specialty: "Derecho Civil", cases: 12, hours: 187, avatar: "https://randomuser.me/api/portraits/women/44.jpg", status: "Activo", phone: "+52 55 1234-5678", email: "v.torres@lexfirm.com" },
  { id: 2, name: "Dr. Rodrigo Fuentes", specialty: "Derecho Penal", cases: 8, hours: 142, avatar: "https://randomuser.me/api/portraits/men/32.jpg", status: "Activo", phone: "+52 55 2345-6789", email: "r.fuentes@lexfirm.com" },
  { id: 3, name: "Lic. Camila Reyes", specialty: "Derecho Mercantil", cases: 15, hours: 214, avatar: "https://randomuser.me/api/portraits/women/68.jpg", status: "Activo", phone: "+52 55 3456-7890", email: "c.reyes@lexfirm.com" },
  { id: 4, name: "Dr. Andrés Molina", specialty: "Derecho Laboral", cases: 6, hours: 98, avatar: "https://randomuser.me/api/portraits/men/75.jpg", status: "Licencia", phone: "+52 55 4567-8901", email: "a.molina@lexfirm.com" },
  { id: 5, name: "Lic. Isabela Mendoza", specialty: "Derecho Familiar", cases: 10, hours: 160, avatar: "https://randomuser.me/api/portraits/women/21.jpg", status: "Activo", phone: "+52 55 5678-9012", email: "i.mendoza@lexfirm.com" },
];

const CASES = [
  { id: "LEX-2025-001", name: "González vs. Constructora Delta", client: "Miguel González", lawyer: "Dra. Valentina Torres", lawyerImg: "https://randomuser.me/api/portraits/women/44.jpg", tribunal: "2° Tribunal Civil CDMX", judge: "Juez Marco Salinas", status: "Activo", priority: "Alta", hours: 47, maxHours: 100, date: "12 Ene 2025", category: "Civil", nextHearing: "28 Feb 2025" },
  { id: "LEX-2025-002", name: "Caso Fiscal Grupo Horizonte", client: "Grupo Horizonte S.A.", lawyer: "Lic. Camila Reyes", lawyerImg: "https://randomuser.me/api/portraits/women/68.jpg", tribunal: "Tribunal Fiscal Federal", judge: "Jueza Patricia Vidal", status: "Pendiente", priority: "Media", hours: 23, maxHours: 80, date: "20 Ene 2025", category: "Mercantil", nextHearing: "05 Mar 2025" },
  { id: "LEX-2025-003", name: "Estado vs. Ramírez Ochoa", client: "Defensa E. Ramírez", lawyer: "Dr. Rodrigo Fuentes", lawyerImg: "https://randomuser.me/api/portraits/men/32.jpg", tribunal: "Juzgado Penal Norte", judge: "Juez Carlos Ibáñez", status: "Urgente", priority: "Urgente", hours: 68, maxHours: 120, date: "03 Feb 2025", category: "Penal", nextHearing: "21 Feb 2025" },
  { id: "LEX-2025-004", name: "Divorcio Herrera-Castillo", client: "Ana Herrera", lawyer: "Lic. Isabela Mendoza", lawyerImg: "https://randomuser.me/api/portraits/women/21.jpg", tribunal: "Tribunal Familiar CDMX", judge: "Jueza Sofía Blanco", status: "Activo", priority: "Media", hours: 31, maxHours: 60, date: "14 Feb 2025", category: "Familiar", nextHearing: "10 Mar 2025" },
  { id: "LEX-2025-005", name: "Despido Injustificado López", client: "Pedro López", lawyer: "Dr. Andrés Molina", lawyerImg: "https://randomuser.me/api/portraits/men/75.jpg", tribunal: "Junta Local Conciliación", judge: "Árbitro Luis Peña", status: "Apelación", priority: "Media", hours: 55, maxHours: 90, date: "08 Ene 2025", category: "Laboral", nextHearing: "15 Mar 2025" },
  { id: "LEX-2025-006", name: "Sucesión Testamentaria Mora", client: "Familia Mora", lawyer: "Dra. Valentina Torres", lawyerImg: "https://randomuser.me/api/portraits/women/44.jpg", tribunal: "Notaría Pública 42", judge: "Notario R. Esperanza", status: "Cerrado", priority: "Baja", hours: 28, maxHours: 40, date: "10 Nov 2024", category: "Civil", nextHearing: "—" },
  { id: "LEX-2025-007", name: "Fusión Empresarial TechMX", client: "TechMX Group", lawyer: "Lic. Camila Reyes", lawyerImg: "https://randomuser.me/api/portraits/women/68.jpg", tribunal: "COFECE", judge: "Comisionado A. Ríos", status: "Activo", priority: "Alta", hours: 82, maxHours: 150, date: "01 Feb 2025", category: "Mercantil", nextHearing: "25 Feb 2025" },
];

const HOURS_DATA = [
  { mes: "Sep", horas: 312, meta: 350 }, { mes: "Oct", horas: 398, meta: 350 },
  { mes: "Nov", horas: 287, meta: 350 }, { mes: "Dic", horas: 220, meta: 350 },
  { mes: "Ene", horas: 401, meta: 350 }, { mes: "Feb", horas: 344, meta: 350 },
];

const CASE_TYPE_DATA = [
  { name: "Civil", value: 32, color: "#c9a84c" },
  { name: "Penal", value: 18, color: "#e05555" },
  { name: "Mercantil", value: 28, color: "#5b8dee" },
  { name: "Laboral", value: 14, color: "#4caf7d" },
  { name: "Familiar", value: 8, color: "#b06bd4" },
];

const TIME_ENTRIES = [
  { id: 1, case: "LEX-2025-003", caseName: "Estado vs. Ramírez Ochoa", lawyer: "Dr. Rodrigo Fuentes", lawyerImg: "https://randomuser.me/api/portraits/men/32.jpg", hours: 3.5, date: "Hoy 09:00", desc: "Revisión de expediente y preparación de defensa", billable: true },
  { id: 2, case: "LEX-2025-007", caseName: "Fusión TechMX", lawyer: "Lic. Camila Reyes", lawyerImg: "https://randomuser.me/api/portraits/women/68.jpg", hours: 5.0, date: "Hoy 08:30", desc: "Due diligence y análisis regulatorio COFECE", billable: true },
  { id: 3, case: "LEX-2025-001", caseName: "González vs. Constructora Delta", lawyer: "Dra. Valentina Torres", lawyerImg: "https://randomuser.me/api/portraits/women/44.jpg", hours: 2.0, date: "Ayer 14:00", desc: "Llamada cliente y revisión de pruebas", billable: false },
  { id: 4, case: "LEX-2025-004", caseName: "Divorcio Herrera-Castillo", lawyer: "Lic. Isabela Mendoza", lawyerImg: "https://randomuser.me/api/portraits/women/21.jpg", hours: 1.5, date: "Ayer 10:00", desc: "Audiencia de mediación familiar", billable: true },
  { id: 5, case: "LEX-2025-002", caseName: "Caso Fiscal Grupo Horizonte", lawyer: "Lic. Camila Reyes", lawyerImg: "https://randomuser.me/api/portraits/women/68.jpg", hours: 4.0, date: "19 Feb", desc: "Preparación de alegatos y documentación fiscal", billable: true },
];

const HEARINGS = [
  { date: "21 Feb", case: "Estado vs. Ramírez", tribunal: "Juzgado Penal Norte", time: "09:00", type: "Urgente" },
  { date: "25 Feb", case: "Fusión TechMX", tribunal: "COFECE", time: "11:30", type: "Activo" },
  { date: "28 Feb", case: "González vs. Delta", tribunal: "2° Tribunal Civil", time: "10:00", type: "Activo" },
  { date: "05 Mar", case: "Grupo Horizonte", tribunal: "Tribunal Fiscal", time: "09:30", type: "Pendiente" },
  { date: "10 Mar", case: "Divorcio Herrera", tribunal: "Tribunal Familiar", time: "12:00", type: "Activo" },
];

const ACTIVITY = [
  { icon: <Gavel size={14} />, text: "Audiencia registrada: Estado vs. Ramírez", time: "Hace 20 min", color: "#e05555" },
  { icon: <FileText size={14} />, text: "Nuevo documento adjunto en LEX-2025-007", time: "Hace 1h", color: "#5b8dee" },
  { icon: <Clock size={14} />, text: "5h registradas — Lic. Camila Reyes", time: "Hace 2h", color: "#c9a84c" },
  { icon: <CheckCircle size={14} />, text: "Caso LEX-2024-006 marcado como Cerrado", time: "Ayer", color: "#4caf7d" },
  { icon: <Users size={14} />, text: "Cliente TechMX Group añadido al sistema", time: "Ayer", color: "#b06bd4" },
];

/* ─── HELPERS ─────────────────────────────────────────────── */
const statusBadge = (s) => {
  const map = { Activo: "badge-active", Pendiente: "badge-pending", Urgente: "badge-urgent", Cerrado: "badge-closed", Apelación: "badge-appeal" };
  const dots = { Activo: "#4caf7d", Pendiente: "#f5a623", Urgente: "#e05555", Cerrado: "#70708a", Apelación: "#5b8dee" };
  return <span className={`badge ${map[s] || "badge-pending"}`}><span className="prio-dot" style={{ background: dots[s] || "#f5a623" }} />{s}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: "#0d1018", border: "1px solid #c9a84c33", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "#c9a84c", fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 13 }}>{p.name}: <b>{p.value}</b></p>)}
    </div>
  );
  return null;
};

/* ─── VIEWS ───────────────────────────────────────────────── */

/* DASHBOARD */
function Dashboard() {
  const [count, setCount] = useState({ cases: 0, hours: 0, lawyers: 0, hearings: 0 });
  useEffect(() => {
    const targets = { cases: 51, hours: 641, lawyers: 5, hearings: 12 };
    const dur = 1200; const steps = 40; const interval = dur / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const p = step / steps;
      setCount({ cases: Math.round(targets.cases * p), hours: Math.round(targets.hours * p), lawyers: Math.round(targets.lawyers * p), hearings: Math.round(targets.hearings * p) });
      if (step >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* HERO BANNER */}
      <div className="card" style={{ marginBottom: 20, position: "relative", overflow: "hidden", padding: 0, border: "none" }}>
        <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80" alt="Law" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12, display: "block", filter: "brightness(.35)" }} />
        <div style={{ position: "absolute", inset: 0, padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#c9a84c", marginBottom: 6 }}>Panel de Control</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1 }}>Bienvenido de regreso,<br /><span style={{ color: "#c9a84c" }}>Dr. Alejandro Vargas</span></h2>
          <p style={{ color: "#9090a8", fontSize: 13, marginTop: 6 }}>Tienes <b style={{ color: "#e05555" }}>3 audiencias urgentes</b> esta semana · Jueves 20 Feb 2025</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid-4">
        {[
          { icon: <Briefcase size={20} />, val: count.cases, label: "Casos Activos", change: "+8%", up: true, color: "#c9a84c", bg: "#c9a84c18", Icon: Briefcase },
          { icon: <Clock size={20} />, val: count.hours, label: "Horas Registradas", change: "+12%", up: true, color: "#5b8dee", bg: "#5b8dee18", Icon: Clock },
          { icon: <Users size={20} />, val: count.lawyers, label: "Abogados Activos", change: "=", up: null, color: "#4caf7d", bg: "#4caf7d18", Icon: Users },
          { icon: <Gavel size={20} />, val: count.hearings, label: "Audiencias este Mes", change: "-2", up: false, color: "#e05555", bg: "#e0555518", Icon: Gavel },
        ].map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.val}{i === 1 ? "h" : ""}</div>
            <div className="stat-label">{s.label}</div>
            {s.up !== null && <div className={`stat-change ${s.up ? "up" : "down"}`}>{s.up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{s.change} vs. mes anterior</div>}
            <s.Icon size={72} className="stat-bg" style={{ color: s.color }} />
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid-2">
        <div className="card">
          <div className="sec-header">
            <div><div className="sec-title">Horas por Mes</div><div className="sec-subtitle">vs. meta mensual (350h)</div></div>
            <BarChart2 size={18} style={{ color: "#c9a84c88" }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={HOURS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#c9a84c0d" />
              <XAxis dataKey="mes" stroke="#70708a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#70708a" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="horas" stroke="#c9a84c" fill="url(#gradH)" strokeWidth={2} name="Horas" />
              <Area type="monotone" dataKey="meta" stroke="#c9a84c44" fill="none" strokeWidth={1} strokeDasharray="4 4" name="Meta" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="sec-header">
            <div><div className="sec-title">Casos por Área</div><div className="sec-subtitle">Distribución actual</div></div>
            <PieIcon size={18} style={{ color: "#c9a84c88" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={CASE_TYPE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {CASE_TYPE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {CASE_TYPE_DATA.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, minWidth: 10 }} />
                  <span style={{ fontSize: 12, color: "#9090a8", flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#e8e2d6" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT CASES + ACTIVITY */}
      <div className="grid-2">
        <div className="card">
          <div className="sec-header">
            <div><div className="sec-title">Casos Recientes</div></div>
            <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Ver todos</button>
          </div>
          {CASES.slice(0, 4).map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #c9a84c0d" }}>
              <img src={c.lawyerImg} alt="" className="avatar" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#e8e2d6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                <p style={{ fontSize: 11, color: "#70708a" }}>{c.lawyer} · {c.judge}</p>
              </div>
              {statusBadge(c.status)}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="sec-header"><div className="sec-title">Actividad Reciente</div></div>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot" style={{ borderColor: a.color + "66", color: a.color }}>{a.icon}</div>
              <div>
                <p style={{ fontSize: 13, color: "#e8e2d6" }}>{a.text}</p>
                <p style={{ fontSize: 11, color: "#70708a", marginTop: 2 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRÓXIMAS AUDIENCIAS */}
      <div className="card">
        <div className="sec-header">
          <div><div className="sec-title">Próximas Audiencias</div><div className="sec-subtitle">Siguiente mes</div></div>
          <button className="btn btn-outline" style={{ padding: "7px 14px", fontSize: 12 }}><Calendar size={14} />Calendario completo</button>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {HEARINGS.map((h, i) => (
            <div key={i} style={{ minWidth: 180, background: "#0f1320", border: "1px solid #c9a84c18", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a84c", marginBottom: 6 }}>{h.date} · {h.time}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#e8e2d6", marginBottom: 4 }}>{h.case}</p>
              <p style={{ fontSize: 11, color: "#70708a" }}>{h.tribunal}</p>
              <div style={{ marginTop: 8 }}>{statusBadge(h.type)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* CASOS */
function Cases({ onAdd }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const tabs = ["Todos", "Activo", "Urgente", "Pendiente", "Apelación", "Cerrado"];
  const filtered = CASES.filter(c => {
    const matchTab = filter === "Todos" || c.status === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      <div className="sec-header">
        <div><div className="sec-title">Gestión de Casos</div><div className="sec-subtitle">{CASES.length} casos en el sistema</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost"><Download size={14} />Exportar</button>
          <button className="btn btn-gold" onClick={onAdd}><Plus size={14} />Nuevo Caso</button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="search-bar" style={{ maxWidth: "none", flex: 1 }}>
          <Search size={15} style={{ color: "#555568" }} />
          <input placeholder="Buscar por caso, cliente, abogado…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-ghost"><Filter size={14} />Filtros</button>
      </div>

      {/* TABS */}
      <div className="tabs">
        {tabs.map(t => <span key={t} className={`tab ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>{t}</span>)}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Expediente</th><th>Caso / Cliente</th><th>Abogado</th>
                <th>Tribunal</th><th>Juez</th><th>Horas</th>
                <th>Status</th><th>Próx. Audiencia</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td><span style={{ fontSize: 11, color: "#c9a84c", fontFamily: "monospace" }}>{c.id}</span></td>
                  <td>
                    <p style={{ fontWeight: 500, color: "#e8e2d6", fontSize: 13 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: "#70708a" }}>{c.client}</p>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={c.lawyerImg} alt="" className="avatar" />
                      <span style={{ fontSize: 12 }}>{c.lawyer.split(" ").slice(0, 2).join(" ")}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "#9090a8" }}>{c.tribunal}</td>
                  <td style={{ fontSize: 12, color: "#9090a8" }}>{c.judge}</td>
                  <td>
                    <div style={{ marginBottom: 4, fontSize: 12 }}>{c.hours}h / {c.maxHours}h</div>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${(c.hours / c.maxHours) * 100}%`, background: c.hours / c.maxHours > .8 ? "#e05555" : "linear-gradient(90deg,#c9a84c,#e8c96e)" }} />
                    </div>
                  </td>
                  <td>{statusBadge(c.status)}</td>
                  <td style={{ fontSize: 12, color: "#70708a" }}>{c.nextHearing}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={e => { e.stopPropagation(); setSelected(c); }}><Eye size={13} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={e => e.stopPropagation()}><Edit size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CASE DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>{selected.id} · {selected.category}</p>
                <div className="modal-title" style={{ marginBottom: 0 }}>{selected.name}</div>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Cliente", val: selected.client },
                { label: "Área", val: selected.category },
                { label: "Status", val: statusBadge(selected.status) },
                { label: "Prioridad", val: selected.priority },
                { label: "Fecha Inicio", val: selected.date },
                { label: "Próx. Audiencia", val: selected.nextHearing },
              ].map((f, i) => (
                <div key={i} style={{ background: "#0f1320", borderRadius: 8, padding: "12px 14px", border: "1px solid #c9a84c18" }}>
                  <p style={{ fontSize: 10, color: "#c9a84c88", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{f.label}</p>
                  <p style={{ fontSize: 13, color: "#e8e2d6", fontWeight: 500 }}>{f.val}</p>
                </div>
              ))}
            </div>

            <div className="gold-line" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { icon: <Users size={15} />, label: "Abogado Asignado", val: selected.lawyer },
                { icon: <Scale size={15} />, label: "Tribunal", val: selected.tribunal },
                { icon: <Gavel size={15} />, label: "Juez / Árbitro", val: selected.judge },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0f1320", borderRadius: 8, padding: "12px 14px", border: "1px solid #c9a84c18" }}>
                  <div style={{ color: "#c9a84c" }}>{r.icon}</div>
                  <div>
                    <p style={{ fontSize: 10, color: "#70708a", marginBottom: 2 }}>{r.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{r.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "#c9a84c88", marginBottom: 6 }}>HORAS TRABAJADAS</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{selected.hours}h de {selected.maxHours}h</span>
                <span style={{ fontSize: 13, color: "#c9a84c" }}>{Math.round((selected.hours / selected.maxHours) * 100)}%</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${(selected.hours / selected.maxHours) * 100}%`, background: selected.hours / selected.maxHours > .8 ? "#e05555" : undefined }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-gold" style={{ flex: 1 }}><Clock size={14} />Registrar Horas</button>
              <button className="btn btn-outline"><FileText size={14} />Documentos</button>
              <button className="btn btn-ghost"><Edit size={14} />Editar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* HORAS */
function Hours() {
  const total = TIME_ENTRIES.reduce((a, b) => a + b.hours, 0);
  const billable = TIME_ENTRIES.filter(e => e.billable).reduce((a, b) => a + b.hours, 0);

  return (
    <>
      <div className="sec-header">
        <div><div className="sec-title">Centro de Horas</div><div className="sec-subtitle">Registro y control de tiempo por caso</div></div>
        <button className="btn btn-gold"><Plus size={14} />Registrar Tiempo</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Horas (Feb)", val: `${total}h`, sub: "Acumuladas este mes", color: "#c9a84c" },
          { label: "Horas Facturables", val: `${billable}h`, sub: `${Math.round((billable / total) * 100)}% del total`, color: "#4caf7d" },
          { label: "No Facturables", val: `${(total - billable).toFixed(1)}h`, sub: "Administrativo/Interno", color: "#70708a" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e8e2d6", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#70708a", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="sec-title" style={{ marginBottom: 16 }}>Entradas de Tiempo</div>
          {TIME_ENTRIES.map(e => (
            <div key={e.id} className="hour-block">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <img src={e.lawyerImg} alt="" className="avatar" style={{ width: 26, height: 26 }} />
                  <span style={{ fontSize: 12, color: "#9090a8" }}>{e.lawyer.split(" ").slice(0, 2).join(" ")}</span>
                  <span style={{ fontSize: 10, letterSpacing: 1, color: "#c9a84c88", fontFamily: "monospace" }}>{e.case}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{e.hours}h</span>
                  <span className={`badge ${e.billable ? "badge-active" : "badge-closed"}`} style={{ fontSize: 10 }}>{e.billable ? "Facturable" : "Interno"}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#e8e2d6" }}>{e.caseName}</p>
              <p style={{ fontSize: 11, color: "#70708a", marginTop: 3 }}>{e.desc}</p>
              <p style={{ fontSize: 10, color: "#555568", marginTop: 5 }}>{e.date}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="sec-title" style={{ marginBottom: 14 }}>Horas por Abogado</div>
            {LAWYERS.map(l => (
              <div key={l.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <img src={l.avatar} alt="" className="avatar" style={{ width: 26, height: 26 }} />
                  <span style={{ fontSize: 12, flex: 1 }}>{l.name.split(" ").slice(0, 3).join(" ")}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#c9a84c" }}>{l.hours}h</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(l.hours / 250) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-title" style={{ marginBottom: 14 }}>Horas Mensuales</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={HOURS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9a84c0d" />
                <XAxis dataKey="mes" stroke="#70708a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#70708a" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="horas" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

/* ABOGADOS */
function LawyersView() {
  return (
    <>
      <div className="sec-header">
        <div><div className="sec-title">Abogados del Despacho</div><div className="sec-subtitle">{LAWYERS.length} profesionistas registrados</div></div>
        <button className="btn btn-gold"><Plus size={14} />Agregar Abogado</button>
      </div>

      <div className="grid-3">
        {LAWYERS.map(l => (
          <div key={l.id} className="card" style={{ textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: 14, right: 14 }}>
              <span className={`badge ${l.status === "Activo" ? "badge-active" : "badge-pending"}`}>{l.status}</span>
            </div>
            <img src={l.avatar} alt={l.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #c9a84c44", marginBottom: 12 }} />
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#f5f0e8" }}>{l.name}</div>
            <div style={{ fontSize: 12, color: "#c9a84c", marginBottom: 14 }}>{l.specialty}</div>

            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#c9a84c" }}>{l.cases}</div>
                <div style={{ fontSize: 11, color: "#70708a" }}>Casos</div>
              </div>
              <div style={{ width: 1, background: "#c9a84c18" }} />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#c9a84c" }}>{l.hours}h</div>
                <div style={{ fontSize: 11, color: "#70708a" }}>Horas</div>
              </div>
            </div>

            <div style={{ textAlign: "left", background: "#0f1320", borderRadius: 8, padding: "10px 12px", border: "1px solid #c9a84c18" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Mail size={13} style={{ color: "#c9a84c" }} />
                <span style={{ fontSize: 11, color: "#9090a8" }}>{l.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={13} style={{ color: "#c9a84c" }} />
                <span style={{ fontSize: 11, color: "#9090a8" }}>{l.phone}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center", padding: "7px 10px", fontSize: 12 }}><Eye size={13} />Ver casos</button>
              <button className="btn btn-ghost" style={{ padding: "7px 10px" }}><Edit size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* TRIBUNALES */
function Tribunals() {
  const tribunals = [...new Set(CASES.map(c => c.tribunal))].map(t => ({
    name: t,
    cases: CASES.filter(c => c.tribunal === t),
    judge: CASES.find(c => c.tribunal === t)?.judge,
  }));

  return (
    <>
      <div className="sec-header">
        <div><div className="sec-title">Tribunales y Jueces</div><div className="sec-subtitle">Jurisdicciones activas</div></div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <img src="https://images.unsplash.com/photo-1505664194779-8beaceb93174?w=1400&q=80" alt="Legal" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, filter: "brightness(.3)", display: "block" }} />
      </div>

      <div className="grid-2">
        {tribunals.map((t, i) => (
          <div key={i} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: "#c9a84c18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c" }}>
                <Scale size={20} />
              </div>
              <span style={{ fontSize: 11, color: "#c9a84c", background: "#c9a84c18", padding: "3px 8px", borderRadius: 20 }}>{t.cases.length} caso{t.cases.length > 1 ? "s" : ""}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#f5f0e8", marginBottom: 4 }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Gavel size={13} style={{ color: "#c9a84c88" }} />
              <span style={{ fontSize: 12, color: "#9090a8" }}>{t.judge}</span>
            </div>
            <div className="gold-line" style={{ margin: "10px 0" }} />
            {t.cases.map((c, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 12, color: "#e8e2d6" }}>{c.name.length > 28 ? c.name.slice(0, 28) + "…" : c.name}</p>
                  <p style={{ fontSize: 11, color: "#70708a" }}>{c.lawyer.split(" ").slice(0, 2).join(" ")}</p>
                </div>
                {statusBadge(c.status)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* DOCUMENTOS */
function Documents() {
  const docs = [
    { name: "Escrito Inicial - González vs Delta.pdf", case: "LEX-2025-001", size: "2.4 MB", date: "12 Ene 2025", type: "PDF", color: "#e05555" },
    { name: "Contrato de Servicios TechMX.docx", case: "LEX-2025-007", size: "890 KB", date: "02 Feb 2025", type: "DOC", color: "#5b8dee" },
    { name: "Pruebas Fotográficas - Ramírez.zip", case: "LEX-2025-003", size: "45 MB", date: "05 Feb 2025", type: "ZIP", color: "#f5a623" },
    { name: "Acuerdo Fiscal Horizonte Q4.xlsx", case: "LEX-2025-002", size: "1.2 MB", date: "21 Ene 2025", type: "XLS", color: "#4caf7d" },
    { name: "Sentencia Previa - Herrera.pdf", case: "LEX-2025-004", size: "3.1 MB", date: "15 Feb 2025", type: "PDF", color: "#e05555" },
    { name: "Notificación Juzgado Penal.pdf", case: "LEX-2025-003", size: "450 KB", date: "18 Feb 2025", type: "PDF", color: "#e05555" },
  ];

  return (
    <>
      <div className="sec-header">
        <div><div className="sec-title">Gestión Documental</div><div className="sec-subtitle">{docs.length} documentos en el sistema</div></div>
        <button className="btn btn-gold"><Plus size={14} />Subir Documento</button>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div className="search-bar" style={{ maxWidth: "none", flex: 1 }}>
            <Search size={15} style={{ color: "#555568" }} />
            <input placeholder="Buscar documentos…" />
          </div>
          <button className="btn btn-ghost"><Filter size={14} />Tipo</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Archivo</th><th>Expediente</th><th>Tipo</th><th>Tamaño</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: d.color + "18", border: `1px solid ${d.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: d.color, letterSpacing: 0.5 }}>{d.type}</div>
                      <span style={{ fontSize: 13, color: "#e8e2d6" }}>{d.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 11, fontFamily: "monospace", color: "#c9a84c" }}>{d.case}</span></td>
                  <td><span style={{ fontSize: 11, color: "#9090a8" }}>{d.type}</span></td>
                  <td style={{ fontSize: 12, color: "#70708a" }}>{d.size}</td>
                  <td style={{ fontSize: 12, color: "#70708a" }}>{d.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Eye size={13} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Download size={13} /></button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* NEW CASE MODAL */
function NewCaseModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="modal-title">Nuevo Caso</div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Nombre del Caso</label><input className="form-input" placeholder="Ej. García vs. Inmobiliaria XYZ" /></div>
          <div className="form-group"><label className="form-label">Cliente</label><input className="form-input" placeholder="Nombre del cliente" /></div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Abogado Asignado</label>
            <select className="form-input">
              {LAWYERS.map(l => <option key={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Área Legal</label>
            <select className="form-input">
              {["Civil", "Penal", "Mercantil", "Laboral", "Familiar", "Fiscal"].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Tribunal</label><input className="form-input" placeholder="Nombre del tribunal" /></div>
          <div className="form-group"><label className="form-label">Juez / Árbitro</label><input className="form-input" placeholder="Nombre del juez" /></div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Prioridad</label>
            <select className="form-input">
              {["Alta", "Media", "Baja", "Urgente"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Horas Estimadas</label><input className="form-input" type="number" placeholder="100" /></div>
        </div>
        <div className="form-group"><label className="form-label">Descripción / Notas</label><textarea className="form-input" rows={3} placeholder="Descripción del caso…" /></div>
        <div className="form-group"><label className="form-label">Próxima Audiencia</label><input className="form-input" type="date" /></div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center" }}><Plus size={14} />Crear Caso</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ─────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);

  const NAV = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "casos", icon: <Briefcase size={18} />, label: "Casos", badge: 7 },
    { id: "horas", icon: <Clock size={18} />, label: "Centro de Horas" },
    { id: "abogados", icon: <Users size={18} />, label: "Abogados" },
    { id: "tribunales", icon: <Scale size={18} />, label: "Tribunales" },
    { id: "documentos", icon: <FileText size={18} />, label: "Documentos" },
  ];
  const NAV2 = [
    { id: "calendario", icon: <Calendar size={18} />, label: "Calendario" },
    { id: "config", icon: <Settings size={18} />, label: "Configuración" },
  ];

  const navClick = (id) => { setPage(id); setMobileOpen(false); };
  const sideClass = `sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`;

  const titles = { dashboard: "Panel General", casos: "Gestión de Casos", horas: "Centro de Horas", abogados: "Equipo Legal", tribunales: "Tribunales & Jueces", documentos: "Documentos", calendario: "Calendario", config: "Configuración" };

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className={sideClass}>
          <div className="sidebar-logo">
            <div className="logo-icon"><Scale size={20} /></div>
            <div className="logo-text"><h1>LexFirm</h1><p>Legal Management</p></div>
          </div>

          <div className="nav-section" style={{ flex: 1 }}>
            <div className="nav-label">{!collapsed && "Principal"}</div>
            {NAV.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => navClick(n.id)} title={n.label}>
                {n.icon}
                <span>{n.label}</span>
                {n.badge && !collapsed && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
            <div style={{ margin: "10px 0 4px" }} className="nav-label">{!collapsed && "Sistema"}</div>
            {NAV2.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => navClick(n.id)} title={n.label}>
                {n.icon}<span>{n.label}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="user-card">
              <img src="https://randomuser.me/api/portraits/men/40.jpg" alt="" className="user-avatar" />
              <div className="user-info" style={{ overflow: collapsed ? "hidden" : "visible" }}>
                <p>Dr. A. Vargas</p><span>Socio Director</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="main">
          <div className="topbar">
            <button className="icon-btn" onClick={() => { setCollapsed(c => !c); setMobileOpen(o => !o); }}>
              <Menu size={16} />
            </button>
            <span className="topbar-title">{titles[page]}</span>
            <div className="search-bar">
              <Search size={15} style={{ color: "#555568" }} />
              <input placeholder="Buscar expedientes, clientes…" />
            </div>
            <div className="topbar-actions">
              <div className="icon-btn"><Bell size={16} /><div className="notif-dot" /></div>
              <div className="icon-btn"><RefreshCw size={16} /></div>
              <img src="https://randomuser.me/api/portraits/men/40.jpg" alt="" style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #c9a84c44", cursor: "pointer" }} />
            </div>
          </div>

          <div className="content">
            {page === "dashboard" && <Dashboard />}
            {page === "casos" && <Cases onAdd={() => setShowNewCase(true)} />}
            {page === "horas" && <Hours />}
            {page === "abogados" && <LawyersView />}
            {page === "tribunales" && <Tribunals />}
            {page === "documentos" && <Documents />}
            {(page === "calendario" || page === "config") && (
              <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#c9a84c18", border: "1px solid #c9a84c33", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#c9a84c" }}>
                  {page === "calendario" ? <Calendar size={28} /> : <Settings size={28} />}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#f5f0e8", marginBottom: 8 }}>
                  {page === "calendario" ? "Calendario de Audiencias" : "Configuración del Sistema"}
                </div>
                <p style={{ fontSize: 13, color: "#70708a" }}>Esta sección está lista para integrarse con los datos de tu despacho.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowNewCase(true)} title="Nuevo Caso"><Plus size={22} /></button>

      {/* MODALS */}
      {showNewCase && <NewCaseModal onClose={() => setShowNewCase(false)} />}

      {/* MOBILE OVERLAY */}
      {mobileOpen && <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 99 }} onClick={() => setMobileOpen(false)} />}
    </>
  );
}
