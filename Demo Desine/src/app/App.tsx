import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin, Navigation2, Users, Shield, Star, ChevronRight, Menu, X,
  ArrowRight, Car, Bike, Clock, Calendar, CheckCircle, Bell, Settings,
  LogOut, Search, ChevronDown, Phone, Mail, MessageSquare, HelpCircle,
  AlertTriangle, TrendingUp, BarChart2, UserCheck, Activity, Plus,
  Eye, EyeOff, Check, RefreshCw, Wifi, ChevronLeft, Hash,
  Map, BookOpen, Zap, Lock, Share2, Award,
  MoreVertical, Edit2, Trash2, FileText, Download, Filter, User,
  Home, Compass, LifeBuoy, Info, Layers, ArrowUpRight, Circle,
  Navigation, Loader, Send, ThumbsUp, ThumbsDown, Headphones,
  AlertCircle, XCircle, Globe, Building, PlusCircle, MinusCircle,
  ToggleLeft, ToggleRight, Table, Grid, List, CreditCard, Repeat,
  ChevronUp, Maximize2, GraduationCap
} from "lucide-react";

// ========================= TYPES =========================
type Page =
  | "cover" | "home" | "how-it-works" | "login" | "register"
  | "otp-verify" | "rider-dashboard" | "ride-details" | "ride-negotiation"
  | "driver-dashboard" | "offer-ride" | "driver-requests"
  | "active-trip-rider" | "active-trip-driver"
  | "start-otp" | "complete-otp" | "trip-history" | "profile"
  | "help-center" | "safety-center" | "contact-us"
  | "admin-dashboard" | "admin-universities" | "admin-users";

type Role = "guest" | "rider" | "driver" | "admin";

interface AppState {
  page: Page;
  role: Role;
  isLoggedIn: boolean;
}

// ========================= MOCK DATA =========================
const UNIVERSITIES = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "BITS Pilani", "Delhi University",
  "Manipal University", "VIT Vellore", "Jadavpur University", "IISC Bangalore",
  "Amity University", "SRM University", "Anna University"
];

const RIDES = [
  {
    id: "1", driver: "Arjun Sharma", avatar: "AS", rating: 4.8, trips: 43,
    vehicle: "Honda Activa 6G", vehicleType: "bike", color: "Pearl White",
    plateNo: "DL 4C 7823", from: "IIT Delhi Gate 1", to: "Hauz Khas Metro",
    time: "8:30 AM", date: "Today", seats: 1, match: 96,
    pickup: "0.3 km", verified: true, price: null
  },
  {
    id: "2", driver: "Priya Nair", avatar: "PN", rating: 4.9, trips: 87,
    vehicle: "Maruti Swift Dzire", vehicleType: "car", color: "Silver",
    plateNo: "DL 8A 3311", from: "South Campus Gate", to: "AIIMS Metro",
    time: "9:00 AM", date: "Today", seats: 3, match: 88,
    pickup: "0.6 km", verified: true, price: null
  },
  {
    id: "3", driver: "Rohan Mehra", avatar: "RM", rating: 4.6, trips: 21,
    vehicle: "Bajaj Pulsar 150", vehicleType: "bike", color: "Black",
    plateNo: "DL 2E 9945", from: "Hostel Block C", to: "Green Park Metro",
    time: "8:45 AM", date: "Today", seats: 1, match: 79,
    pickup: "1.1 km", verified: true, price: null
  },
];

const REQUESTS = [
  {
    id: "r1", rider: "Sneha Kapoor", avatar: "SK", university: "IIT Delhi",
    verified: true, from: "Gate 2, IIT Delhi", to: "Hauz Khas Metro Station",
    compatibility: 94, time: "8:30 AM", date: "Today"
  },
  {
    id: "r2", rider: "Dev Patel", avatar: "DP", university: "IIT Delhi",
    verified: true, from: "Hostel Block B", to: "Hauz Khas Metro Station",
    compatibility: 87, time: "8:30 AM", date: "Today"
  },
  {
    id: "r3", rider: "Anika Singh", avatar: "AS", university: "IIT Delhi",
    verified: false, from: "Faculty Block", to: "Green Park Metro",
    compatibility: 72, time: "9:00 AM", date: "Today"
  },
];

const TRIPS = [
  {
    id: "t1", status: "upcoming", from: "IIT Delhi Gate 1", to: "Hauz Khas Metro",
    date: "Aug 22, 2026", time: "8:30 AM", driver: "Arjun Sharma", vehicle: "Honda Activa"
  },
  {
    id: "t2", status: "completed", from: "South Campus", to: "AIIMS Metro",
    date: "Aug 20, 2026", time: "9:00 AM", driver: "Priya Nair", vehicle: "Swift Dzire"
  },
  {
    id: "t3", status: "completed", from: "IIT Delhi Gate 2", to: "Green Park Metro",
    date: "Aug 18, 2026", time: "8:45 AM", driver: "Rohan Mehra", vehicle: "Pulsar 150"
  },
  {
    id: "t4", status: "cancelled", from: "Hostel Block C", to: "Saket Metro",
    date: "Aug 15, 2026", time: "7:30 AM", driver: "Karan Verma", vehicle: "Honda City"
  },
];

const ADMIN_STATS = [
  { label: "Total Users", value: "12,847", change: "+8.3%", icon: Users, color: "text-blue-600 bg-blue-50" },
  { label: "Verified Users", value: "9,214", change: "+5.1%", icon: UserCheck, color: "text-teal-600 bg-teal-50" },
  { label: "Active Rides", value: "341", change: "+12.4%", icon: Activity, color: "text-green-600 bg-green-50" },
  { label: "Completed Trips", value: "48,392", change: "+3.7%", icon: CheckCircle, color: "text-indigo-600 bg-indigo-50" },
  { label: "Pending Verifications", value: "278", change: "-14.2%", icon: Clock, color: "text-amber-600 bg-amber-50" },
  { label: "Universities", value: "47", change: "+2", icon: Building, color: "text-purple-600 bg-purple-50" },
];

const ADMIN_UNIVERSITIES = [
  { id: "u1", name: "IIT Delhi", domain: "iitd.ac.in", users: 2341, status: "active" },
  { id: "u2", name: "IIT Bombay", domain: "iitb.ac.in", users: 3012, status: "active" },
  { id: "u3", name: "BITS Pilani", domain: "bits-pilani.ac.in", users: 1876, status: "active" },
  { id: "u4", name: "Delhi University", domain: "du.ac.in", users: 4521, status: "active" },
  { id: "u5", name: "Manipal University", domain: "manipal.edu", users: 1234, status: "pending" },
  { id: "u6", name: "Amity University", domain: "amity.edu", users: 987, status: "disabled" },
];

const FAQS = [
  {
    q: "How does university verification work?",
    a: "We send a verification link to your official university email (.ac.in or .edu domain). Once you click the link and complete OTP verification, your account gets the Verified badge."
  },
  {
    q: "Is Campunex free to use?",
    a: "Yes, Campunex is completely free. We do not charge any service fees or commissions. Riders and drivers negotiate ride arrangements directly."
  },
  {
    q: "What vehicles are allowed?",
    a: "Both bikes (two-wheelers) and cars (four-wheelers) are permitted. Drivers must upload valid vehicle documents and a valid driving licence during registration."
  },
  {
    q: "How does the OTP-based trip system work?",
    a: "Before the trip starts, the driver enters a 4-digit OTP shown on the rider's screen. After the trip ends, a second OTP confirms completion. This ensures both parties agree the ride happened."
  },
  {
    q: "What if a rider or driver doesn't show up?",
    a: "You can report a no-show through the app. Repeated no-shows result in warnings or account suspension. We take reliability seriously."
  },
  {
    q: "Can I ride with someone from a different university?",
    a: "Currently Campunex focuses on same-university or campus-adjacent rides. Cross-university rides may be enabled in future based on route compatibility."
  },
];

// ========================= UI COMPONENTS =========================

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function DynIcon({ icon: I, cls }: { icon: React.ElementType; cls?: string }) {
  return <I className={cls} />;
}

function Btn({
  children, onClick, variant = "primary", size = "md", className = "", disabled = false, type = "button"
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "teal";
  size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const variants = {
    primary: "bg-[#1e3a8a] text-white hover:bg-[#1d3271] active:scale-[0.98] shadow-sm",
    teal: "bg-[#14b8a6] text-white hover:bg-[#0d9488] active:scale-[0.98] shadow-sm",
    secondary: "bg-[#e0f2fe] text-[#1e3a8a] hover:bg-[#bae6fd] active:scale-[0.98]",
    outline: "border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#e0f2fe] active:scale-[0.98]",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, sizes[size], variants[variant], disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </button>
  );
}

function FormInput({
  label, type = "text", placeholder, value, onChange, icon: Icon, error, helper
}: {
  label?: string; type?: string; placeholder?: string; value?: string;
  onChange?: (v: string) => void; icon?: React.ElementType;
  error?: string; helper?: string;
}) {
  const [showPass, setShowPass] = useState(false);
  const inputType = type === "password" ? (showPass ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className={cn(
            "w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all",
            Icon && "pl-10",
            type === "password" && "pr-10",
            error ? "border-red-300 bg-red-50" : "border-slate-200"
          )}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full",
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
    )}>
      <ShieldCheck size={size === "sm" ? 10 : 12} />
      Verified
    </span>
  );
}

function ShieldCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L2 3.5V8c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V3.5L8 1z" fill="#14b8a6" opacity="0.3" />
      <path d="M8 1L2 3.5V8c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V3.5L8 1z" stroke="#14b8a6" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M5.5 8l1.5 1.5L10.5 6" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ name, size = "md", className = "" }: { name: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700", "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700"];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base", xl: "w-20 h-20 text-xl" };
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold flex-shrink-0", color, sizes[size], className)}>
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-slate-700">{rating}</span>
    </div>
  );
}

function MatchBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? "bg-teal-500" : percent >= 75 ? "bg-blue-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${percent}%` }} />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", percent >= 90 ? "text-teal-600" : percent >= 75 ? "text-blue-600" : "text-amber-600")}>
        {percent}%
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: "upcoming" | "active" | "completed" | "cancelled" | "pending" }) {
  const map = {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    active: "bg-teal-50 text-teal-700 border-teal-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize", map[status])}>
      {status}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", className)}>
      {children}
    </div>
  );
}

// ========================= SVG COMPONENTS =========================

function CampusMapSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background */}
      <rect width="420" height="320" rx="16" fill="#f0f9ff" />
      {/* Grid roads */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="320" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {[40, 80, 120, 160, 200, 240, 280].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="420" y2={y} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {/* Main roads */}
      <rect x="0" y="150" width="420" height="10" fill="#cbd5e1" rx="2" opacity="0.6" />
      <rect x="200" y="0" width="10" height="320" fill="#cbd5e1" rx="2" opacity="0.6" />
      {/* Campus blocks */}
      <rect x="55" y="55" width="70" height="55" rx="6" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5" />
      <text x="90" y="88" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="600">Main</text>
      <text x="90" y="98" textAnchor="middle" fill="#1d4ed8" fontSize="7">Building</text>
      <rect x="165" y="55" width="50" height="60" rx="6" fill="#ccfbf1" stroke="#5eead4" strokeWidth="1.5" />
      <text x="190" y="88" textAnchor="middle" fill="#0d9488" fontSize="8" fontWeight="600">Lab</text>
      <rect x="255" y="55" width="80" height="55" rx="6" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="1.5" />
      <text x="295" y="88" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="600">Library</text>
      <rect x="55" y="185" width="55" height="70" rx="6" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
      <text x="82" y="225" textAnchor="middle" fill="#92400e" fontSize="7" fontWeight="600">Hostel</text>
      <rect x="145" y="185" width="65" height="60" rx="6" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1.5" />
      <text x="177" y="218" textAnchor="middle" fill="#991b1b" fontSize="7" fontWeight="600">Canteen</text>
      <rect x="255" y="180" width="80" height="65" rx="6" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5" />
      <text x="295" y="216" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="600">Dept.</text>
      {/* Route path */}
      <path d="M90 110 L90 150 L200 155 L300 155 L300 180" stroke="#14b8a6" strokeWidth="3"
        strokeDasharray="8 4" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Start marker */}
      <circle cx="90" cy="108" r="8" fill="#14b8a6" />
      <circle cx="90" cy="108" r="4" fill="white" />
      {/* End marker */}
      <circle cx="300" cy="182" r="8" fill="#1e3a8a" />
      <path d="M296 178 L300 186 L304 178 Z" fill="white" />
      {/* Car icon */}
      <circle cx="195" cy="153" r="9" fill="#1e3a8a" />
      <path d="M190 153 L195 148 L200 153 L200 157 L190 157 Z" fill="white" />
      {/* Gate markers */}
      <rect x="75" y="260" width="40" height="20" rx="4" fill="#14b8a6" opacity="0.8" />
      <text x="95" y="274" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">GATE 1</text>
      <rect x="350" y="265" width="40" height="20" rx="4" fill="#1e3a8a" opacity="0.8" />
      <text x="370" y="279" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">METRO</text>
      {/* Pulse at car */}
      <circle cx="195" cy="153" r="14" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function RouteViz({ from, to, vertical = false }: { from: string; to: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-start gap-0 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 truncate">{from}</span>
        </div>
        <div className="flex items-start gap-2 pl-1.5">
          <div className="flex flex-col gap-0.5 mt-1 mb-1">
            {[0, 1, 2].map(i => <div key={i} className="w-0.5 h-1.5 bg-slate-300 rounded-full" />)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1e3a8a] flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 truncate">{to}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 min-w-0 text-sm text-slate-600">
      <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
      <span className="truncate font-medium">{from}</span>
      <ArrowRight className="w-3 h-3 flex-shrink-0 text-slate-300" />
      <div className="w-2 h-2 rounded-sm bg-[#1e3a8a] flex-shrink-0" />
      <span className="truncate font-medium">{to}</span>
    </div>
  );
}

function LiveMapSVG({ role }: { role: "rider" | "driver" }) {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPos(p => (p + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);
  const px = 80 + (220 * pos / 100);
  const py = 160 - Math.sin((pos / 100) * Math.PI) * 40;
  return (
    <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="280" rx="12" fill="#f0f9ff" />
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="280" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {[40, 80, 120, 160, 200, 240].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {/* Route */}
      <path d="M80 160 Q150 120 220 160 Q290 200 320 160" stroke="#c7d2fe" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M80 160 Q150 120 220 160 Q290 200 320 160" stroke="#4f46e5" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" fill="none" />
      {/* Start */}
      <circle cx="80" cy="160" r="10" fill="#14b8a6" />
      <circle cx="80" cy="160" r="5" fill="white" />
      <circle cx="80" cy="160" r="16" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
      {/* End */}
      <circle cx="320" cy="160" r="10" fill="#1e3a8a" />
      <circle cx="320" cy="160" r="5" fill="white" />
      {/* Moving car */}
      <circle cx={px} cy={py} r="12" fill="#1e3a8a" opacity="0.9" />
      <circle cx={px} cy={py} r="18" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.2" />
      {role === "driver" ? (
        <path d={`M${px - 5} ${py} L${px} ${py - 5} L${px + 5} ${py} L${px + 5} ${py + 4} L${px - 5} ${py + 4} Z`} fill="white" />
      ) : (
        <circle cx={px} cy={py} r="4" fill="white" />
      )}
      {/* Labels */}
      <rect x="60" y="180" width="44" height="16" rx="4" fill="white" />
      <text x="82" y="192" textAnchor="middle" fill="#0d9488" fontSize="8" fontWeight="700">START</text>
      <rect x="298" y="180" width="46" height="16" rx="4" fill="white" />
      <text x="321" y="192" textAnchor="middle" fill="#1e3a8a" fontSize="8" fontWeight="700">METRO</text>
      {/* Distance */}
      <rect x="155" y="100" width="90" height="22" rx="6" fill="#1e3a8a" opacity="0.9" />
      <text x="200" y="115" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">ETA: ~4 min</text>
    </svg>
  );
}

// ========================= NAVBAR =========================

function Navbar({ page, setPage, role, isLoggedIn, onLogout }: {
  page: Page; setPage: (p: Page) => void; role: Role; isLoggedIn: boolean; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isPublic = ["cover", "home", "how-it-works", "safety-center", "help-center", "contact-us"].includes(page);

  const navLinks = isLoggedIn ? (
    role === "admin"
      ? [{ label: "Dashboard", p: "admin-dashboard" }, { label: "Universities", p: "admin-universities" }, { label: "Users & Rides", p: "admin-users" }]
      : role === "driver"
        ? [{ label: "Dashboard", p: "driver-dashboard" }, { label: "Offer Ride", p: "offer-ride" }, { label: "Requests", p: "driver-requests" }, { label: "History", p: "trip-history" }]
        : [{ label: "Find Ride", p: "rider-dashboard" }, { label: "History", p: "trip-history" }]
  ) : [
    { label: "Home", p: "home" }, { label: "How It Works", p: "how-it-works" },
    { label: "Safety", p: "safety-center" }, { label: "Contact", p: "contact-us" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage(isLoggedIn ? (role === "admin" ? "admin-dashboard" : role === "driver" ? "driver-dashboard" : "rider-dashboard") : "home")}
          className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
            <Navigation2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[#1e3a8a] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Camp<span className="text-[#14b8a6]">unex</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <button key={l.p} onClick={() => setPage(l.p as Page)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                page === l.p ? "bg-[#e0f2fe] text-[#1e3a8a]" : "text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50")}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button onClick={() => setPage("profile")}
                className={cn("p-2 rounded-full transition-all", page === "profile" ? "bg-slate-100" : "hover:bg-slate-50")}>
                <Avatar name={role === "admin" ? "Admin User" : role === "driver" ? "Arjun Sharma" : "Sneha Kapoor"} size="sm" />
              </button>
              <button onClick={() => { setPage("profile"); }} className="p-2 rounded-full hover:bg-slate-50 text-slate-500">
                <Bell className="w-5 h-5" />
              </button>
              <Btn variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" />Logout</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={() => setPage("login")}>Login</Btn>
              <Btn variant="primary" size="sm" onClick={() => setPage("register")}>Get Started</Btn>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-slate-50">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-1">
          {navLinks.map(l => (
            <button key={l.p} onClick={() => { setPage(l.p as Page); setOpen(false); }}
              className={cn("px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all",
                page === l.p ? "bg-[#e0f2fe] text-[#1e3a8a]" : "text-slate-600 hover:bg-slate-50")}>
              {l.label}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-2 flex gap-2">
            {isLoggedIn ? (
              <Btn variant="ghost" size="sm" className="w-full" onClick={() => { onLogout(); setOpen(false); }}>
                <LogOut className="w-4 h-4" /> Logout
              </Btn>
            ) : (
              <>
                <Btn variant="outline" size="sm" className="flex-1" onClick={() => { setPage("login"); setOpen(false); }}>Login</Btn>
                <Btn variant="primary" size="sm" className="flex-1" onClick={() => { setPage("register"); setOpen(false); }}>Register</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ========================= FOOTER =========================

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="bg-[#0f172a] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
                <Navigation2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Camp<span className="text-[#14b8a6]">unex</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">Campus ride-matching for verified university students. Safe, smart, community-driven.</p>
            <p className="text-xs mt-4 text-slate-500">© 2026 Campunex. All rights reserved.</p>
          </div>
          {[
            { title: "Platform", links: [["Home", "home"], ["How It Works", "how-it-works"], ["Safety Center", "safety-center"]] },
            { title: "Support", links: [["Help Center", "help-center"], ["Contact Us", "contact-us"], ["Community Guidelines", "safety-center"]] },
            { title: "Legal", links: [["Terms of Service", "home"], ["Privacy Policy", "home"], ["Cookie Policy", "home"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, p]) => (
                  <li key={label}>
                    <button onClick={() => setPage(p as Page)}
                      className="text-sm hover:text-teal-400 transition-colors">{label}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">Built for university communities. Available across India.</p>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-teal-900/40 text-teal-400 border border-teal-800/50 px-2.5 py-1 rounded-full">Verified Platform</span>
            <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded-full">47 Universities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ========================= PAGE: COVER =========================

function CoverPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-10" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-[#1e3a8a] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Navigation2 className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-4xl text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Camp<span className="text-[#14b8a6]">unex</span>
          </span>
        </div>

        {/* Tagline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Your campus.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Your route.</span>
          {" "}Your ride.
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Connecting verified university students for safe, community-driven campus rides.
        </p>

        {/* Map visual */}
        <div className="w-full max-w-md mb-10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/30 border border-white/10">
          <CampusMapSVG />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Btn variant="teal" size="lg" onClick={() => setPage("home")}>
            Explore Campunex <ArrowRight className="w-5 h-5" />
          </Btn>
          <Btn variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white" onClick={() => setPage("login")}>
            Sign In
          </Btn>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-slate-500 text-sm">
          {[["47+", "Universities"], ["12K+", "Students"], ["48K+", "Rides"], ["4.8★", "Rating"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-white font-bold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{val}</div>
              <div className="text-xs">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: HOME =========================

function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f3460] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <CheckCircle className="w-3.5 h-3.5" /> University-verified rides only
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Campus rides,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                built for students.
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
              Campunex connects verified university students and campus commuters who share similar routes. Safe, free, and community-first.
            </p>
            <div className="flex flex-wrap gap-4">
              <Btn variant="teal" size="lg" onClick={() => setPage("register")}>
                <Search className="w-5 h-5" /> Find a Ride
              </Btn>
              <Btn size="lg" className="bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => setPage("register")}>
                <Car className="w-5 h-5" /> Offer a Ride
              </Btn>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 text-sm text-slate-400">
              {["No pricing pressure", "OTP-verified trips", "Live GPS tracking"].map(f => (
                <span key={f} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-400" />{f}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <CampusMapSVG className="w-full rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["47+", "Universities"], ["12,000+", "Verified Students"], ["48,000+", "Rides Completed"], ["4.8 / 5", "Safety Rating"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-extrabold text-teal-300" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v}</div>
              <div className="text-sm text-slate-300">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            How Campunex works
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Four simple steps to connect campus commuters going the same way.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: UserCheck, title: "Verify University", desc: "Confirm your identity with your official university email." },
            { step: "02", icon: MapPin, title: "Enter Route", desc: "Set your daily pickup point, destination and schedule." },
            { step: "03", icon: Users, title: "Find Match", desc: "Our algorithm surfaces the best-matching riders or drivers." },
            { step: "04", icon: Navigation2, title: "Ride Together", desc: "Confirm with OTP, track live, and rate the experience." },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow h-full">
                <div className="w-10 h-10 bg-[#e0f2fe] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#1e3a8a]" />
                </div>
                <div className="text-xs font-bold text-teal-500 mb-1 tracking-widest">{step}</div>
                <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
              {step !== "04" && (
                <div className="hidden md:flex absolute top-8 -right-3 z-10 w-6 items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Btn variant="outline" onClick={() => setPage("how-it-works")}>See full walkthrough <ChevronRight className="w-4 h-4" /></Btn>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-[#f0f9ff] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">Why Campunex</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Built for campus life
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: "bg-indigo-50 text-indigo-600", title: "University Verification", desc: "Every user is verified through their official university email. No outsiders, no unknown faces." },
              { icon: Map, color: "bg-teal-50 text-teal-600", title: "Smart Route Matching", desc: "Our algorithm scores compatibility based on route overlap, timing, and campus proximity." },
              { icon: Zap, color: "bg-amber-50 text-amber-600", title: "Live GPS Tracking", desc: "Families and friends can follow your trip in real time for complete peace of mind." },
              { icon: Lock, color: "bg-rose-50 text-rose-600", title: "OTP Trip Security", desc: "Two-OTP system ensures both departure and arrival are mutually confirmed." },
              { icon: Car, color: "bg-blue-50 text-blue-600", title: "Bikes & Cars", desc: "Whether you're on a scooter or a hatchback, Campunex accommodates both vehicle types." },
              { icon: Users, color: "bg-purple-50 text-purple-600", title: "Community First", desc: "Reputation system, community guidelines, and moderation keep the platform respectful." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <Card key={title} className="p-6 hover:shadow-md transition-shadow">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: Bike, type: "Bike Rides", desc: "Quick, affordable two-wheeler rides for solo commuters navigating campus routes.", features: ["1 pillion seat", "Faster through traffic", "Perfect for short routes", "Honda, Bajaj, TVS models"] },
            { icon: Car, type: "Car Rides", desc: "Comfortable four-wheeler rides with up to 3 co-passengers sharing the same route.", features: ["1–3 passenger seats", "Comfortable for longer commutes", "Rain and weather protection", "Maruti, Honda, Hyundai models"] },
          ].map(({ icon: Icon, type, desc, features }) => (
            <div key={type} className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white rounded-2xl p-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-teal-300" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{type}</h3>
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">{desc}</p>
              <ul className="space-y-2">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                    <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">Safety First</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Your safety is our<br />top priority
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Every feature in Campunex was designed with student safety in mind. From university-only access to OTP-secured trips, we have multiple layers of protection.
              </p>
              <div className="space-y-4">
                {[
                  { title: "University-only access", desc: "Only students with verified university emails can join." },
                  { title: "Driver document verification", desc: "Driving licence and vehicle RC are verified before anyone can offer a ride." },
                  { title: "Dual OTP system", desc: "Start and end OTPs prevent false trip reports." },
                  { title: "Emergency SOS button", desc: "One-tap emergency access during any active trip." },
                ].map(s => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{s.title}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Btn variant="teal" size="md" className="mt-6" onClick={() => setPage("safety-center")}>
                View Safety Center <ChevronRight className="w-4 h-4" />
              </Btn>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
              <h4 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safety Ratings</h4>
              {[
                { label: "Account Verification", val: 98 },
                { label: "Trip Completion Rate", val: 94 },
                { label: "Driver Compliance", val: 97 },
                { label: "User Satisfaction", val: 96 },
              ].map(({ label, val }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-sm font-bold text-teal-600">{val}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-2 rounded-full transition-all" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-widest">FAQ</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                  <div className="pt-3">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[#f8fafc] border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Community rules & guidelines</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: CheckCircle, color: "text-teal-500", rule: "Only use your official university email to register." },
              { icon: CheckCircle, color: "text-teal-500", rule: "Drivers must maintain valid driving licence and insured vehicle." },
              { icon: CheckCircle, color: "text-teal-500", rule: "Always confirm rides using the OTP system — no OTP, no trip." },
              { icon: CheckCircle, color: "text-teal-500", rule: "Treat co-riders with respect. Zero tolerance for harassment." },
              { icon: XCircle, color: "text-red-400", rule: "Do not share account credentials or allow non-students to use your profile." },
              { icon: XCircle, color: "text-red-400", rule: "No fare negotiation outside the Campunex platform." },
            ].map(({ icon: Icon, color, rule }) => (
              <div key={rule} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", color)} />
                <span className="text-sm text-slate-700">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to ride smarter?
          </h2>
          <p className="text-slate-300 text-lg mb-8">Join thousands of students already sharing routes across India's top universities.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Btn variant="teal" size="lg" onClick={() => setPage("register")}>
              Create free account <ArrowRight className="w-5 h-5" />
            </Btn>
            <Btn size="lg" className="bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => setPage("how-it-works")}>
              How it works
            </Btn>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========================= PAGE: HOW IT WORKS =========================

function HowItWorksPage({ setPage }: { setPage: (p: Page) => void }) {
  const steps = [
    {
      n: "01", icon: UserCheck, title: "Verify your university",
      desc: "Sign up with your official university email (e.g., name@iitd.ac.in). We send a 6-digit OTP to confirm your identity. Once verified, you get the Verified badge on your profile.",
      details: ["Use your official .ac.in or .edu email", "OTP expires in 10 minutes", "Re-verification required after 1 year", "Documents for drivers: DL + Vehicle RC"]
    },
    {
      n: "02", icon: MapPin, title: "Enter your route",
      desc: "Set your regular pickup location, destination, and preferred travel time. The more specific you are, the better our matching algorithm works.",
      details: ["Use address or landmark search", "Set recurring schedule or one-time ride", "Choose preferred vehicle type", "Set max pickup distance tolerance"]
    },
    {
      n: "03", icon: Users, title: "Find your match",
      desc: "Campunex calculates a route compatibility score for each potential match. Higher scores mean more overlapping routes and time windows.",
      details: ["Matching score based on route overlap %", "Considers departure time proximity", "Shows pickup distance from your location", "Filters by vehicle type and seats"]
    },
    {
      n: "04", icon: Navigation2, title: "Ride together",
      desc: "Accept a ride, get the start OTP, meet your driver, and confirm departure. Track the trip live and complete it with the end OTP.",
      details: ["Driver enters your 4-digit start OTP", "Live GPS tracking during trip", "SOS button always accessible", "End OTP confirms safe arrival"]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white py-16 px-4 sm:px-6 text-center">
        <span className="text-sm font-semibold text-teal-400 uppercase tracking-widest">Process</span>
        <h1 className="text-3xl md:text-5xl font-extrabold mt-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          How Campunex works
        </h1>
        <p className="text-slate-300 text-lg max-w-xl mx-auto">A simple, transparent process for safe campus ride-matching.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className={cn("grid md:grid-cols-2 gap-8 items-start", i % 2 === 1 && "md:grid-flow-dense")}>
                <div className={i % 2 === 1 ? "md:col-start-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="text-xs font-bold text-teal-500 tracking-widest uppercase">Step {step.n}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-5">{step.desc}</p>
                  <ul className="space-y-2">
                    {step.details.map(d => (
                      <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={cn("bg-gradient-to-br from-[#e0f2fe] to-[#ccfbf1] rounded-2xl p-8 flex items-center justify-center", i % 2 === 1 && "md:col-start-1 md:row-start-1")}>
                  <div className="w-full aspect-square max-w-48 bg-white/60 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-inner">
                    <div className="w-16 h-16 bg-[#1e3a8a] rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-teal-300" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#1e3a8a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.n}</div>
                    <div className="text-sm font-semibold text-slate-700 text-center px-4">{step.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16 bg-gradient-to-br from-[#1e3a8a] to-[#0f3460] rounded-2xl p-10 text-white">
          <h3 className="text-2xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to get started?</h3>
          <p className="text-slate-300 mb-6">It takes under 3 minutes to register and verify your university email.</p>
          <Btn variant="teal" size="lg" onClick={() => setPage("register")}>
            Create your account <ArrowRight className="w-5 h-5" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: LOGIN =========================

function LoginPage({ setPage, onLogin }: { setPage: (p: Page) => void; onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (role: Role = "rider") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(role);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center">
              <Navigation2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-[#1e3a8a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Camp<span className="text-[#14b8a6]">unex</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your campus account</p>
        </div>

        <Card className="p-8">
          <div className="space-y-4">
            <FormInput label="University Email" type="email" placeholder="you@iitd.ac.in" icon={Mail} value={email} onChange={setEmail} />
            <FormInput label="Password" type="password" placeholder="Enter your password" icon={Lock} value={password} onChange={setPassword} />
            <div className="flex justify-end">
              <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">Forgot password?</button>
            </div>
            <Btn variant="primary" size="lg" className="w-full" onClick={() => handleLogin("rider")} disabled={loading}>
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
            </Btn>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or continue with</span></div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 text-center space-y-2">
            <div className="text-xs text-slate-500">
              Demo: <button className="text-[#1e3a8a] font-semibold hover:underline" onClick={() => handleLogin("rider")}>Rider</button>
              {" · "}<button className="text-[#1e3a8a] font-semibold hover:underline" onClick={() => handleLogin("driver")}>Driver</button>
              {" · "}<button className="text-[#1e3a8a] font-semibold hover:underline" onClick={() => handleLogin("admin")}>Admin</button>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don&apos;t have an account?{" "}
          <button onClick={() => setPage("register")} className="text-[#1e3a8a] font-semibold hover:underline">Register here</button>
        </p>
      </div>
    </div>
  );
}

// ========================= PAGE: REGISTER =========================

function RegisterPage({ setPage }: { setPage: (p: Page) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center">
              <Navigation2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-[#1e3a8a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Camp<span className="text-[#14b8a6]">unex</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join your campus community today</p>
        </div>

        <Card className="p-8">
          <div className="space-y-4">
            <FormInput label="Full Name" placeholder="Sneha Kapoor" icon={User} value={name} onChange={setName} />
            <FormInput label="University Email" type="email" placeholder="sneha@iitd.ac.in" icon={Mail} value={email} onChange={setEmail} helper="Must be your official university email address" />
            <FormInput label="Password" type="password" placeholder="Create a strong password" icon={Lock} value={password} onChange={setPassword} />
            <SelectInput label="University" value={university} onChange={setUniversity} options={UNIVERSITIES} />
            <Btn variant="primary" size="lg" className="w-full" onClick={() => setPage("otp-verify")}>
              Create Account & Verify Email
            </Btn>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Register with Google
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">By registering you agree to our <button className="text-teal-600">Terms</button> and <button className="text-teal-600">Privacy Policy</button></p>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <button onClick={() => setPage("login")} className="text-[#1e3a8a] font-semibold hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}

// ========================= PAGE: OTP VERIFY =========================

function OTPVerifyPage({ setPage, onLogin }: { setPage: (p: Page) => void; onLogin: (role: Role) => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setVerified(true); }, 1500);
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email Verified!</h2>
          <p className="text-slate-500 text-sm mb-6">Your university email has been successfully verified. Welcome to Campunex!</p>
          <div className="flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 rounded-xl p-3 mb-6">
            <VerifiedBadge size="md" />
            <span className="text-sm text-teal-700 font-medium">IIT Delhi · Student</span>
          </div>
          <Btn variant="primary" size="lg" className="w-full" onClick={() => onLogin("rider")}>
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-[#1e3a8a]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verify your email</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">sneha@iitd.ac.in</span>
          </p>
        </div>

        <Card className="p-8">
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={cn(
                  "w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-50",
                  "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all",
                  digit ? "border-teal-400 text-teal-700" : "border-slate-200 text-slate-900"
                )}
              />
            ))}
          </div>

          <Btn variant="primary" size="lg" className="w-full mb-4" onClick={verify}
            disabled={otp.some(d => !d) || loading}>
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify Email"}
          </Btn>

          <div className="text-center text-sm text-slate-500">
            {countdown > 0 ? (
              <span>Resend code in <span className="font-semibold text-slate-700 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0:{countdown.toString().padStart(2, "0")}</span></span>
            ) : (
              <button className="text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 mx-auto"
                onClick={() => setCountdown(60)}>
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            )}
          </div>
        </Card>

        <button onClick={() => setPage("register")} className="flex items-center gap-1.5 text-slate-500 text-sm mx-auto mt-5 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Change email address
        </button>
      </div>
    </div>
  );
}

// ========================= PAGE: RIDER DASHBOARD =========================

function RiderDashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [from, setFrom] = useState("IIT Delhi Gate 1");
  const [to, setTo] = useState("Hauz Khas Metro");
  const [date, setDate] = useState("2026-08-22");
  const [time, setTime] = useState("08:30");
  const [filter, setFilter] = useState<"all" | "bike" | "car">("all");

  const filtered = RIDES.filter(r => filter === "all" || r.vehicleType === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm">Good morning,</p>
              <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sneha Kapoor</h1>
              <div className="flex items-center gap-2 mt-1"><VerifiedBadge /> <span className="text-xs text-slate-400">IIT Delhi</span></div>
            </div>
            <Avatar name="Sneha Kapoor" size="lg" className="bg-white/10 text-white" />
          </div>
          {/* Search card */}
          <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-lg">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-500" /> Search for rides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <FormInput placeholder="Pickup location" icon={MapPin} value={from} onChange={setFrom} />
              <FormInput placeholder="Destination" icon={Navigation2} value={to} onChange={setTo} />
              <FormInput type="date" icon={Calendar} value={date} onChange={setDate} />
              <FormInput type="time" icon={Clock} value={time} onChange={setTime} />
            </div>
            <Btn variant="teal" size="md" className="w-full">
              <Search className="w-4 h-4" /> Find Available Rides
            </Btn>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Results */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {filtered.length} rides found
              </h2>
              <div className="flex gap-2">
                {(["all", "bike", "car"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all",
                      filter === f ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}>
                    {f === "all" ? "All" : f === "bike" ? "🏍 Bikes" : "🚗 Cars"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map(ride => (
                <Card key={ride.id} className="p-5 cursor-pointer hover:shadow-md transition-all border-slate-100"
                  onClick={() => setPage("ride-details")}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={ride.driver} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ride.driver}</span>
                          {ride.verified && <VerifiedBadge />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={ride.rating} />
                          <span className="text-xs text-slate-400">{ride.trips} trips</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5">
                      {ride.vehicleType === "bike" ? <Bike className="w-4 h-4 text-teal-500" /> : <Car className="w-4 h-4 text-[#1e3a8a]" />}
                      <span className="text-xs font-medium text-slate-700 capitalize">{ride.vehicleType}</span>
                    </div>
                  </div>

                  <RouteViz from={ride.from} to={ride.to} vertical />

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center bg-slate-50 rounded-xl p-2">
                      <div className="text-xs text-slate-400 mb-0.5">Time</div>
                      <div className="text-sm font-bold text-slate-900">{ride.time}</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded-xl p-2">
                      <div className="text-xs text-slate-400 mb-0.5">Seats</div>
                      <div className="text-sm font-bold text-slate-900">{ride.seats} left</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded-xl p-2">
                      <div className="text-xs text-slate-400 mb-0.5">Pickup</div>
                      <div className="text-sm font-bold text-teal-600">{ride.pickup}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Route match</span>
                    </div>
                    <MatchBar percent={ride.match} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Map sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-20 space-y-4">
              <Card className="overflow-hidden">
                <div className="bg-slate-50 aspect-video">
                  <CampusMapSVG className="w-full h-full" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" /> IIT Delhi Gate 1
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#1e3a8a]" /> Hauz Khas Metro
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-slate-900 text-sm mb-3">Quick actions</h4>
                <div className="space-y-2">
                  <button onClick={() => setPage("trip-history")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-all">
                    <Clock className="w-4 h-4 text-slate-400" /> Trip history
                  </button>
                  <button onClick={() => setPage("safety-center")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-all">
                    <Shield className="w-4 h-4 text-slate-400" /> Safety center
                  </button>
                  <button onClick={() => setPage("profile")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-all">
                    <Settings className="w-4 h-4 text-slate-400" /> Profile settings
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: RIDE DETAILS =========================

function RideDetailsPage({ setPage }: { setPage: (p: Page) => void }) {
  const ride = RIDES[0];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setPage("rider-dashboard")} className="flex items-center gap-1.5 text-slate-500 text-sm mb-5 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to search
        </button>

        <Card className="overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={ride.driver} size="lg" className="bg-white/20 text-white" />
                <div>
                  <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ride.driver}</h2>
                  <div className="flex items-center gap-2">
                    <StarRating rating={ride.rating} />
                    <span className="text-blue-200 text-xs">{ride.trips} trips</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <VerifiedBadge />
                <div className="text-blue-200 text-xs mt-1">IIT Delhi</div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
              {ride.vehicleType === "bike" ? <Bike className="w-5 h-5 text-teal-300" /> : <Car className="w-5 h-5 text-teal-300" />}
              <div>
                <div className="font-semibold text-sm">{ride.vehicle} · {ride.color}</div>
                <div className="text-blue-200 text-xs font-mono">{ride.plateNo}</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-teal-500" /> Route details
              </h3>
              <RouteViz from={ride.from} to={ride.to} vertical />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Departure</div>
                <div className="font-bold text-slate-900">{ride.time}</div>
                <div className="text-xs text-slate-500">{ride.date}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Seats left</div>
                <div className="font-bold text-teal-600">{ride.seats}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400 mb-1">Match score</div>
                <div className="font-bold text-teal-600">{ride.match}%</div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="text-sm text-slate-600 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Pickup point is <span className="font-semibold text-slate-900">{ride.pickup} from your location</span>
              </div>
              <MatchBar percent={ride.match} />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Btn variant="outline" size="lg" onClick={() => setPage("ride-negotiation")}>
            <MessageSquare className="w-4 h-4" /> Make an Offer
          </Btn>
          <Btn variant="teal" size="lg" onClick={() => setPage("start-otp")}>
            <CheckCircle className="w-4 h-4" /> Request Ride
          </Btn>
        </div>

        <Card className="p-4 mt-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 text-sm">Verified safe ride</div>
              <div className="text-xs text-slate-500 mt-0.5">University ID, driver licence, and vehicle documents have been verified by Campunex.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ========================= PAGE: RIDE NEGOTIATION =========================

function RideNegotiationPage({ setPage }: { setPage: (p: Page) => void }) {
  const [message, setMessage] = useState("");
  const messages = [
    { sender: "driver", name: "Arjun Sharma", text: "Hi! I can pick you up at Gate 1 at 8:30 AM. I'm going to Hauz Khas Metro. Works for you?", time: "8:10 AM" },
    { sender: "rider", name: "Sneha Kapoor", text: "Hi Arjun! That works. Can you pick me up closer to the main gate? I'm usually near the library.", time: "8:11 AM" },
    { sender: "driver", name: "Arjun Sharma", text: "Sure, I can wait near the library gate for 5 minutes. Please be ready by 8:30 AM sharp.", time: "8:12 AM" },
    { sender: "rider", name: "Sneha Kapoor", text: "Perfect! I'll be ready. See you then.", time: "8:13 AM" },
    { sender: "system", name: "", text: "Both parties have agreed to the ride arrangement.", time: "8:13 AM" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => setPage("ride-details")} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Avatar name="Arjun Sharma" size="md" />
          <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Arjun Sharma <VerifiedBadge />
            </div>
            <div className="text-xs text-teal-500 flex items-center gap-1"><Circle className="w-2 h-2 fill-teal-500" /> Active</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">IIT Delhi → Hauz Khas Metro</div>
            <div className="text-xs font-semibold text-slate-700">8:30 AM · Today</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 space-y-3 overflow-auto">
        {messages.map((msg, i) => {
          if (msg.sender === "system") {
            return (
              <div key={i} className="flex justify-center">
                <div className="bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-xs text-teal-700 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" /> {msg.text}
                </div>
              </div>
            );
          }
          const isRider = msg.sender === "rider";
          return (
            <div key={i} className={cn("flex gap-3", isRider && "flex-row-reverse")}>
              <Avatar name={msg.name} size="sm" />
              <div className={cn("max-w-[75%]", isRider && "items-end flex flex-col")}>
                <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isRider ? "bg-[#1e3a8a] text-white rounded-tr-sm" : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm")}>
                  {msg.text}
                </div>
                <div className="text-xs text-slate-400 mt-1 px-1">{msg.time}</div>
              </div>
            </div>
          );
        })}

        {/* Agreement card */}
        <Card className="p-4 border-teal-200 bg-teal-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span className="font-bold text-teal-800 text-sm">Ride arrangement agreed</span>
          </div>
          <div className="space-y-1.5 text-xs text-teal-700">
            <div className="flex justify-between"><span>Pickup</span><span className="font-semibold">Library Gate, IIT Delhi</span></div>
            <div className="flex justify-between"><span>Time</span><span className="font-semibold">8:30 AM, Today</span></div>
            <div className="flex justify-between"><span>Destination</span><span className="font-semibold">Hauz Khas Metro</span></div>
          </div>
          <Btn variant="teal" size="sm" className="w-full mt-3" onClick={() => setPage("start-otp")}>
            Confirm & Get Start OTP
          </Btn>
        </Card>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <Btn variant="teal" size="md" onClick={() => setMessage("")}>
            <Send className="w-4 h-4" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: DRIVER DASHBOARD =========================

function DriverDashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Good morning, driver</p>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Arjun Sharma</h1>
            <div className="flex items-center gap-2 mt-1"><VerifiedBadge /> <span className="text-xs text-slate-400">Honda Activa · DL 4C 7823</span></div>
          </div>
          <Avatar name="Arjun Sharma" size="lg" className="bg-white/10 text-white" />
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[["Rides Offered", "43", TrendingUp], ["Completed", "38", CheckCircle], ["Pending Requests", "3", Bell], ["Rating", "4.8 ★", Star]].map(([label, val, Icon]) => (
            <div key={label as string} className="bg-white/10 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">{label as string}</div>
              <div className="text-xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{val as string}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Offered rides */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your offered rides</h2>
              <Btn variant="teal" size="sm" onClick={() => setPage("offer-ride")}><Plus className="w-4 h-4" /> New Ride</Btn>
            </div>

            {[
              { from: "IIT Delhi Gate 1", to: "Hauz Khas Metro", time: "8:30 AM", seats: 1, requests: 3, status: "active" },
              { from: "IIT Delhi Gate 2", to: "Lajpat Nagar", time: "6:00 PM", seats: 2, requests: 1, status: "upcoming" },
            ].map((r, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <RouteViz from={r.from} to={r.to} vertical />
                  <StatusPill status={r.status as any} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{r.time}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{r.seats} seat</span>
                  {r.requests > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <Bell className="w-3.5 h-3.5" />{r.requests} request{r.requests > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Btn variant="secondary" size="sm" onClick={() => setPage("driver-requests")}>View Requests</Btn>
                  {r.status === "active" && <Btn variant="teal" size="sm" onClick={() => setPage("active-trip-driver")}>Start Trip</Btn>}
                </div>
              </Card>
            ))}

            {/* Active trip indicator */}
            <Card className="p-5 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
                <span className="font-bold text-teal-800">Trip in progress</span>
              </div>
              <RouteViz from="IIT Delhi Gate 1" to="Hauz Khas Metro" />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-teal-700">Rider: Sneha Kapoor · ETA 4 min</span>
                <Btn variant="teal" size="sm" onClick={() => setPage("active-trip-driver")}>View live</Btn>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-slate-900 text-sm mb-3">Quick actions</h4>
              <div className="space-y-2">
                {[
                  ["Offer a Ride", "offer-ride", Plus],
                  ["View Requests", "driver-requests", Bell],
                  ["Trip History", "trip-history", Clock],
                  ["Profile", "profile", User],
                ].map(([label, p, Ico]) => (
                  <button key={label as string} onClick={() => setPage(p as Page)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-all">
                    <DynIcon icon={Ico as React.ElementType} cls="w-4 h-4 text-slate-400" />
                    {label as string}
                  </button>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-slate-900 text-sm mb-3">Vehicle</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Bike className="w-5 h-5 text-[#1e3a8a]" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Honda Activa 6G</div>
                  <div className="text-xs text-slate-400 font-mono">DL 4C 7823 · Pearl White</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">RC Verified</span>
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">DL Verified</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: OFFER A RIDE =========================

function OfferRidePage({ setPage }: { setPage: (p: Page) => void }) {
  const [vehicleType, setVehicleType] = useState<"bike" | "car">("bike");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("1");
  const [published, setPublished] = useState(false);

  if (published) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ride Published!</h2>
          <p className="text-slate-500 text-sm mb-6">Your ride is now live. Riders matching your route will see it and can send you requests.</p>
          <div className="grid grid-cols-2 gap-3">
            <Btn variant="outline" onClick={() => setPage("driver-dashboard")}>Dashboard</Btn>
            <Btn variant="teal" onClick={() => setPage("driver-requests")}>View Requests</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setPage("driver-dashboard")} className="flex items-center gap-1.5 text-slate-500 text-sm mb-6 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Offer a ride</h1>

        <Card className="p-6 space-y-6">
          {/* Vehicle type */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-3">Choose vehicle type</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ type: "bike" as const, icon: Bike, label: "Bike", sub: "1 pillion seat" }, { type: "car" as const, icon: Car, label: "Car", sub: "Up to 3 passengers" }].map(v => (
                <button key={v.type} onClick={() => setVehicleType(v.type)}
                  className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    vehicleType === v.type ? "border-[#1e3a8a] bg-[#e0f2fe]" : "border-slate-200 bg-white hover:bg-slate-50")}>
                  <v.icon className={cn("w-6 h-6", vehicleType === v.type ? "text-[#1e3a8a]" : "text-slate-400")} />
                  <div>
                    <div className={cn("font-bold text-sm", vehicleType === v.type ? "text-[#1e3a8a]" : "text-slate-700")}>{v.label}</div>
                    <div className="text-xs text-slate-400">{v.sub}</div>
                  </div>
                  {vehicleType === v.type && <CheckCircle className="w-4 h-4 text-teal-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <FormInput label="Pickup location" placeholder="e.g. IIT Delhi Gate 1" icon={MapPin} value={from} onChange={setFrom} />
            <FormInput label="Destination" placeholder="e.g. Hauz Khas Metro Station" icon={Navigation2} value={to} onChange={setTo} />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Date" type="date" icon={Calendar} value={date} onChange={setDate} />
              <FormInput label="Departure time" type="time" icon={Clock} value={time} onChange={setTime} />
            </div>
            <SelectInput label="Available seats" value={seats} onChange={setSeats} options={vehicleType === "bike" ? ["1"] : ["1", "2", "3"]} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              By publishing this ride you agree to follow Campunex community guidelines. Only offer rides you intend to complete.
            </div>
          </div>

          <Btn variant="teal" size="lg" className="w-full" onClick={() => setPublished(true)}>
            <Zap className="w-5 h-5" /> Publish Ride
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ========================= PAGE: DRIVER REQUESTS =========================

function DriverRequestsPage({ setPage }: { setPage: (p: Page) => void }) {
  const [requests, setRequests] = useState(REQUESTS.map(r => ({ ...r, status: "pending" as "pending" | "accepted" | "declined" })));

  const handle = (id: string, action: "accepted" | "declined") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setPage("driver-dashboard")} className="flex items-center gap-1.5 text-slate-500 text-sm mb-5 hover:text-slate-700">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ride Requests</h1>
          <span className="text-sm text-slate-500">{requests.filter(r => r.status === "pending").length} pending</span>
        </div>

        <div className="space-y-4">
          {requests.map(req => (
            <Card key={req.id} className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={req.rider} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.rider}</span>
                    {req.verified && <VerifiedBadge />}
                  </div>
                  <span className="text-xs text-slate-500">{req.university}</span>
                </div>
                <StatusPill status={req.status} />
              </div>

              <RouteViz from={req.from} to={req.to} vertical />

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.time}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.date}</span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">Route compatibility</span>
                </div>
                <MatchBar percent={req.compatibility} />
              </div>

              {req.status === "pending" && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Btn variant="danger" size="sm" onClick={() => handle(req.id, "declined")}>
                    <X className="w-4 h-4" /> Decline
                  </Btn>
                  <Btn variant="teal" size="sm" onClick={() => handle(req.id, "accepted")}>
                    <Check className="w-4 h-4" /> Accept
                  </Btn>
                </div>
              )}
              {req.status === "accepted" && (
                <div className="mt-4 flex items-center gap-2 text-teal-600 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> Request accepted
                </div>
              )}
              {req.status === "declined" && (
                <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm font-semibold">
                  <X className="w-4 h-4" /> Declined
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: ACTIVE TRIP =========================

function ActiveTripPage({ role, setPage }: { role: "rider" | "driver"; setPage: (p: Page) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Live map */}
      <div className="flex-1 relative">
        <LiveMapSVG role={role} />

        {/* Header overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-xs text-slate-500">Active trip</div>
              <div className="font-bold text-slate-900 text-sm">IIT Delhi → Hauz Khas Metro</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold text-teal-600">LIVE</span>
            </div>
          </div>
        </div>

        {/* ETA overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="bg-[#1e3a8a] text-white rounded-full px-5 py-2.5 flex items-center gap-3 shadow-lg">
            <Navigation2 className="w-4 h-4 text-teal-300" />
            <span className="text-sm font-bold">ETA ~4 min</span>
            <span className="text-slate-300 text-xs">· 2.3 km remaining</span>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white rounded-t-3xl shadow-2xl px-4 sm:px-6 pt-6 pb-8">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        {role === "rider" ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <Avatar name="Arjun Sharma" size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Arjun Sharma</span>
                  <VerifiedBadge />
                </div>
                <div className="text-sm text-slate-500">Honda Activa · DL 4C 7823</div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
                  <Phone className="w-5 h-5 text-slate-600" />
                </button>
                <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <Avatar name="Sneha Kapoor" size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Sneha Kapoor</span>
                  <VerifiedBadge />
                </div>
                <div className="text-sm text-slate-500">IIT Delhi · Rider</div>
              </div>
              <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
                <Phone className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Elapsed</div>
            <div className="font-bold text-slate-900 tabular-nums text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">Distance</div>
            <div className="font-bold text-teal-600 text-sm">2.3 km</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">ETA</div>
            <div className="font-bold text-slate-900 text-sm">~4 min</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setSosActive(!sosActive)}
            className={cn("flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
              sosActive ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100")}>
            <AlertTriangle className="w-4 h-4" />
            {sosActive ? "SOS ACTIVE" : "SOS / Help"}
          </button>
          <Btn variant="teal" size="md" onClick={() => setPage("complete-otp")}>
            <CheckCircle className="w-4 h-4" /> End Trip
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: START OTP =========================

function StartOTPPage({ setPage, onStart }: { setPage: (p: Page) => void; onStart: () => void }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };

  const verify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); onStart(); }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-[#1e3a8a]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Start Trip OTP</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Ask your rider to share their 4-digit start OTP to begin the trip
          </p>
        </div>

        <Card className="p-8">
          <div className="flex justify-center gap-4 mb-6">
            {otp.map((d, i) => (
              <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric"
                maxLength={1} value={d} onChange={e => handle(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); }}
                className={cn(
                  "w-14 h-16 text-center text-2xl font-extrabold rounded-xl border-2 bg-slate-50 transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400",
                  d ? "border-teal-400 text-teal-700 bg-teal-50" : "border-slate-200",
                  "font-mono"
                )}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            ))}
          </div>
          <Btn variant="teal" size="lg" className="w-full" onClick={verify}
            disabled={otp.some(d => !d) || verifying}>
            {verifying ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</> : "Confirm & Start Trip"}
          </Btn>
        </Card>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Only start the trip once you physically meet the rider and they share the OTP with you. Do not accept OTPs over message.</p>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: COMPLETE OTP =========================

function CompleteOTPPage({ setPage }: { setPage: (p: Page) => void }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [done, setDone] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trip Completed!</h2>
          <p className="text-slate-500 text-sm mb-2">IIT Delhi Gate 1 → Hauz Khas Metro</p>
          <p className="text-xs text-slate-400 mb-6">Duration: 18 min · 4.8 km</p>
          <div className="bg-slate-50 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Rate your experience</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} className="p-1">
                  <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Btn variant="outline" onClick={() => setPage("rider-dashboard")}>Find next ride</Btn>
            <Btn variant="teal" onClick={() => setPage("trip-history")}>View history</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Complete Trip</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Enter the 4-digit completion OTP to securely finish the trip
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center mb-5">
            <RouteViz from="IIT Delhi Gate 1" to="Hauz Khas Metro" />
            <p className="text-xs text-slate-400 mt-2">Trip duration: 18 min</p>
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {otp.map((d, i) => (
              <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric"
                maxLength={1} value={d} onChange={e => handle(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); }}
                className={cn(
                  "w-14 h-16 text-center text-2xl font-extrabold rounded-xl border-2 bg-slate-50 transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400",
                  d ? "border-teal-400 text-teal-700 bg-teal-50" : "border-slate-200"
                )}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            ))}
          </div>
          <Btn variant="teal" size="lg" className="w-full" disabled={otp.some(d => !d)} onClick={() => setDone(true)}>
            Complete Trip
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ========================= PAGE: TRIP HISTORY =========================

function TripHistoryPage({ setPage }: { setPage: (p: Page) => void }) {
  const [tab, setTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const filtered = TRIPS.filter(t => tab === "all" || t.status === tab);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trip History</h1>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["all", "upcoming", "completed", "cancelled"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all capitalize",
                tab === t ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">No {tab} trips found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(trip => (
              <Card key={trip.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <RouteViz from={trip.from} to={trip.to} vertical />
                  <StatusPill status={trip.status as any} />
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{trip.time}</span>
                </div>
                <div className="border-t border-slate-50 mt-3 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Avatar name={trip.driver} size="sm" />
                    <span>{trip.driver} · {trip.vehicle}</span>
                  </div>
                  {trip.status === "upcoming" && (
                    <Btn variant="secondary" size="sm" onClick={() => setPage("ride-details")}>View</Btn>
                  )}
                  {trip.status === "completed" && (
                    <button className="text-xs text-teal-600 font-semibold hover:underline">Rate trip</button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========================= PAGE: PROFILE =========================

function ProfilePage({ setPage, role, onLogout }: { setPage: (p: Page) => void; role: Role; onLogout: () => void }) {
  const user = role === "admin" ? { name: "Admin User", email: "admin@campunex.in", uni: "Campunex HQ", role: "Administrator" }
    : role === "driver" ? { name: "Arjun Sharma", email: "arjun@iitd.ac.in", uni: "IIT Delhi", role: "Driver" }
    : { name: "Sneha Kapoor", email: "sneha@iitd.ac.in", uni: "IIT Delhi", role: "Rider" };

  const sections = [
    { title: "Account", items: [["Edit profile", Edit2], ["Change password", Lock], ["University verification", UserCheck]] },
    { title: "Preferences", items: [["Notification settings", Bell], ["Privacy settings", Shield], ["Language & region", Globe]] },
    { title: "Support", items: [["Help Center", HelpCircle], ["Report a problem", AlertTriangle], ["Contact us", Mail]] },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Profile</h1>

        <Card className="p-6 mb-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <VerifiedBadge size="md" />
                <span className="text-xs bg-[#e0f2fe] text-[#1e3a8a] border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold">{user.role}</span>
                <span className="text-xs text-slate-400">{user.uni}</span>
              </div>
            </div>
          </div>

          {role === "rider" && (
            <div className="grid grid-cols-3 gap-3 mt-5 border-t border-slate-50 pt-4">
              {[["12", "Total Rides"], ["10", "Completed"], ["4.8★", "Rating"]].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v}</div>
                  <div className="text-xs text-slate-400">{l}</div>
                </div>
              ))}
            </div>
          )}
          {role === "driver" && (
            <div className="grid grid-cols-3 gap-3 mt-5 border-t border-slate-50 pt-4">
              {[["43", "Rides Given"], ["38", "Completed"], ["4.8★", "Rating"]].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v}</div>
                  <div className="text-xs text-slate-400">{l}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-3">
          {sections.map(sec => (
            <Card key={sec.title} className="overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sec.title}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {sec.items.map(([label, Ico]) => (
                  <button key={label as string}
                    onClick={() => label === "Help Center" ? setPage("help-center") : label === "Contact us" ? setPage("contact-us") : undefined}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <DynIcon icon={Ico as React.ElementType} cls="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{label as string}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                  </button>
                ))}
              </div>
            </Card>
          ))}

          <button onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold text-sm hover:bg-red-100 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: HELP CENTER =========================

function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    { icon: User, label: "Account", color: "bg-blue-50 text-blue-600" },
    { icon: UserCheck, label: "Verification", color: "bg-teal-50 text-teal-600" },
    { icon: Car, label: "Rides", color: "bg-purple-50 text-purple-600" },
    { icon: Shield, label: "Safety", color: "bg-green-50 text-green-600" },
    { icon: Settings, label: "Technical", color: "bg-amber-50 text-amber-600" },
    { icon: Headphones, label: "Support", color: "bg-rose-50 text-rose-600" },
  ];

  const filtered = FAQS.filter(f => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white px-4 sm:px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Help Center</h1>
        <p className="text-slate-300 mb-6">Find answers or contact our support team</p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for help..."
            className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none shadow-lg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {!search && (
          <>
            <h2 className="font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Browse categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {categories.map(c => (
                <button key={c.label} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all text-left">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.color)}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <h2 className="font-extrabold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {search ? `Results for "${search}"` : "Frequently asked questions"}
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No results found. Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((f, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900 text-sm">{f.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                    <div className="pt-3">{f.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Card className="mt-8 p-6 text-center">
          <Headphones className="w-8 h-8 text-teal-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Still need help?</h3>
          <p className="text-sm text-slate-500 mb-4">Our support team typically responds within 2 hours.</p>
          <Btn variant="teal" size="md">Contact Support</Btn>
        </Card>
      </div>
    </div>
  );
}

// ========================= PAGE: SAFETY CENTER =========================

function SafetyCenterPage() {
  const features = [
    { icon: UserCheck, title: "University Verification", desc: "Every user is verified through their official university email. Non-university outsiders cannot access the platform." },
    { icon: Hash, title: "OTP Trip Security", desc: "A 4-digit OTP verifies trip start and a separate OTP confirms completion. This creates a tamper-proof record of every journey." },
    { icon: Map, title: "Live GPS Tracking", desc: "All trips are tracked in real time. Share your live trip link with a trusted contact for added safety." },
    { icon: FileText, title: "Driver & Vehicle Verification", desc: "Every driver must upload a valid driving licence and vehicle registration certificate before they can offer rides." },
    { icon: AlertTriangle, title: "Reporting & Moderation", desc: "Report unsafe behavior through the app. Our team reviews all reports within 24 hours with zero-tolerance for violations." },
    { icon: BookOpen, title: "Community Guidelines", desc: "Clear behavioral standards govern every interaction on Campunex. Repeated violations lead to account suspension." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0f172a] via-[#0f3460] to-[#1e3a8a] text-white px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-teal-300" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safety Center</h1>
        <p className="text-slate-300 max-w-xl mx-auto text-lg">Your safety is built into every feature of Campunex. Here's exactly how we protect you.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {features.map(f => (
            <Card key={f.title} className="p-6">
              <div className="w-10 h-10 bg-[#e0f2fe] rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[#1e3a8a]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>

        {/* Emergency */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Emergency contacts</h3>
              <p className="text-sm text-red-700 mb-3">In an emergency during an active trip, tap the SOS button inside the app. This will notify:</p>
              <ul className="space-y-1 text-sm text-red-700">
                {["Campunex 24/7 safety team", "Your registered emergency contact", "Nearest police station (via 112)"].map(c => (
                  <li key={c} className="flex items-center gap-2"><Check className="w-3.5 h-3.5" />{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: CONTACT US =========================

function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Message Sent!</h2>
          <p className="text-slate-500 text-sm mb-5">We'll respond within 2 business hours to {email || "your email"}.</p>
          <Btn variant="teal" onClick={() => setSent(false)}>Send another message</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white px-4 sm:px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Contact Us</h1>
        <p className="text-slate-300">We're here to help. Reach out and we'll respond promptly.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="font-extrabold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send a message</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormInput label="Your name" placeholder="Sneha Kapoor" icon={User} value={name} onChange={setName} />
                <FormInput label="Email address" type="email" placeholder="sneha@iitd.ac.in" icon={Mail} value={email} onChange={setEmail} />
              </div>
              <SelectInput label="Issue type" value={type} onChange={setType} options={["Account & Verification", "Ride Issues", "Safety Concern", "Technical Problem", "Feature Request", "Other"]} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
              </div>
              <Btn variant="teal" size="lg" className="w-full" onClick={() => setSent(true)}>
                <Send className="w-4 h-4" /> Send Message
              </Btn>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", val: "support@campunex.in", color: "bg-blue-50 text-blue-600" },
            { icon: Phone, title: "Phone", val: "+91 98765 43210", color: "bg-teal-50 text-teal-600" },
            { icon: Clock, title: "Hours", val: "Mon–Sat, 9 AM – 8 PM", color: "bg-amber-50 text-amber-600" },
          ].map(c => (
            <Card key={c.title} className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.color)}>
                  <c.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">{c.title}</div>
                  <div className="font-semibold text-slate-900 text-sm">{c.val}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: ADMIN DASHBOARD =========================

function AdminDashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0f172a] text-white px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Campunex Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-full">System Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {ADMIN_STATS.map(stat => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={cn("text-xs font-bold", stat.change.startsWith("+") ? "text-teal-600" : "text-red-500")}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent activity */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent activity</h3>
                <Btn variant="ghost" size="sm">View all</Btn>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { type: "verification", user: "Rahul Singh", detail: "IIT Delhi verification approved", time: "2 min ago", icon: UserCheck, color: "text-teal-600" },
                  { type: "ride", user: "Priya Nair", detail: "Completed ride: South Campus → AIIMS Metro", time: "8 min ago", icon: CheckCircle, color: "text-green-600" },
                  { type: "report", user: "Admin", detail: "Safety report #892 reviewed and closed", time: "15 min ago", icon: Shield, color: "text-blue-600" },
                  { type: "university", user: "Admin", detail: "Manipal University domain pending approval", time: "1 hr ago", icon: Building, color: "text-amber-600" },
                  { type: "suspension", user: "System", detail: "Account suspended: 3 no-shows in 7 days", time: "2 hrs ago", icon: AlertTriangle, color: "text-red-500" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-all">
                    <div className={cn("w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5", a.color)}>
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 font-medium">{a.detail}</div>
                      <div className="text-xs text-slate-400 mt-0.5">By {a.user} · {a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick nav */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-slate-900 text-sm mb-3">Admin sections</h4>
              <div className="space-y-2">
                {[
                  ["University Management", "admin-universities", Building],
                  ["User & Ride Management", "admin-users", Users],
                  ["Help Center", "help-center", HelpCircle],
                  ["Contact", "contact-us", Mail],
                ].map(([label, p, Ico]) => (
                  <button key={label as string} onClick={() => setPage(p as Page)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-all">
                    <DynIcon icon={Ico as React.ElementType} cls="w-4 h-4 text-slate-400" />
                    {label as string}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Active trips */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 text-sm">Live trips</h4>
                <span className="text-xs bg-teal-50 text-teal-600 font-semibold px-2 py-0.5 rounded-full">341 active</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { from: "IIT Delhi", to: "Hauz Khas", status: "In transit" },
                  { from: "BITS Pilani", to: "Pilani Town", status: "In transit" },
                  { from: "VIT Vellore", to: "Vellore Bus Stand", status: "Starting" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="truncate flex-1">{t.from} → {t.to}</span>
                    <span className="text-teal-600 font-medium">{t.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================= PAGE: ADMIN UNIVERSITIES =========================

function AdminUniversitiesPage() {
  const [unis, setUnis] = useState(ADMIN_UNIVERSITIES);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const toggle = (id: string, target: "active" | "disabled") => {
    setUnis(prev => prev.map(u => u.id === id ? { ...u, status: target } : u));
  };

  const approve = (id: string) => {
    setUnis(prev => prev.map(u => u.id === id ? { ...u, status: "active" } : u));
  };

  const remove = (id: string) => {
    setUnis(prev => prev.filter(u => u.id !== id));
  };

  const add = () => {
    if (!newName || !newDomain) return;
    setUnis(prev => [...prev, { id: `u${Date.now()}`, name: newName, domain: newDomain, users: 0, status: "pending" }]);
    setNewName(""); setNewDomain(""); setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>University Management</h1>
            <p className="text-sm text-slate-500">{unis.length} universities configured</p>
          </div>
          <Btn variant="teal" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" /> Add University
          </Btn>
        </div>

        {showAdd && (
          <Card className="p-5 mb-5 border-teal-200 bg-teal-50">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Add new university</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <FormInput placeholder="University name" icon={Building} value={newName} onChange={setNewName} />
              <FormInput placeholder="Email domain (e.g. iitd.ac.in)" icon={Mail} value={newDomain} onChange={setNewDomain} />
              <div className="flex gap-2">
                <Btn variant="teal" size="md" className="flex-1" onClick={add}>Add</Btn>
                <Btn variant="ghost" size="md" onClick={() => setShowAdd(false)}>Cancel</Btn>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["University", "Domain", "Users", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {unis.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-[#1e3a8a]" />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{u.domain}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700 font-semibold">{u.users.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={u.status as any} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {u.status === "pending" && (
                          <button onClick={() => approve(u.id)} className="text-xs font-semibold text-teal-600 hover:underline">Approve</button>
                        )}
                        {u.status === "active" && (
                          <button onClick={() => toggle(u.id, "disabled")} className="text-xs font-semibold text-amber-600 hover:underline">Disable</button>
                        )}
                        {u.status === "disabled" && (
                          <button onClick={() => toggle(u.id, "active")} className="text-xs font-semibold text-teal-600 hover:underline">Enable</button>
                        )}
                        <button onClick={() => remove(u.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ========================= PAGE: ADMIN USERS =========================

function AdminUsersPage() {
  const [viewTab, setViewTab] = useState<"verification" | "users" | "rides" | "map">("verification");
  const queue = [
    { id: "q1", name: "Rohan Mehra", email: "rohan@iitd.ac.in", uni: "IIT Delhi", type: "Student", submitted: "Aug 21, 2026", docs: "ID + DL" },
    { id: "q2", name: "Kavya Reddy", email: "kavya@bits-pilani.ac.in", uni: "BITS Pilani", type: "Driver", submitted: "Aug 21, 2026", docs: "ID + DL + RC" },
    { id: "q3", name: "Aryan Joshi", email: "aryan@du.ac.in", uni: "Delhi University", type: "Student", submitted: "Aug 20, 2026", docs: "ID" },
  ];

  const users = [
    { id: "u1", name: "Sneha Kapoor", email: "sneha@iitd.ac.in", role: "Rider", status: "active", verified: true, trips: 12 },
    { id: "u2", name: "Arjun Sharma", email: "arjun@iitd.ac.in", role: "Driver", status: "active", verified: true, trips: 43 },
    { id: "u3", name: "Dev Patel", email: "dev@iitb.ac.in", role: "Rider", status: "suspended", verified: true, trips: 5 },
    { id: "u4", name: "Anika Singh", email: "anika@du.ac.in", role: "Rider", status: "pending", verified: false, trips: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>User & Ride Management</h1>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["verification", "users", "rides", "map"] as const).map(t => (
            <button key={t} onClick={() => setViewTab(t)}
              className={cn("px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all",
                viewTab === t ? "bg-[#1e3a8a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {t === "verification" ? "Verification Queue" : t === "map" ? "Map View" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {viewTab === "verification" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{queue.length} pending verifications</p>
            {queue.map(q => (
              <Card key={q.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={q.name} size="md" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{q.name}</div>
                      <div className="text-xs text-slate-500">{q.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{q.uni} · {q.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Submitted</div>
                    <div className="text-xs font-semibold text-slate-700">{q.submitted}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Documents: {q.docs}</span>
                  <StatusPill status="pending" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg py-2 hover:bg-slate-50">View Docs</button>
                  <button className="text-xs font-semibold text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50">Reject</button>
                  <button className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg py-2 hover:bg-teal-100">Approve</button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {viewTab === "users" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["User", "Email", "Role", "Trips", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{u.name}</div>
                            {u.verified && <VerifiedBadge />}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                          u.role === "Driver" ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700")}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{u.trips}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={u.status as any} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs text-blue-600 font-semibold hover:underline">View</button>
                          {u.status === "active" && <button className="text-xs text-red-500 font-semibold hover:underline">Suspend</button>}
                          {u.status === "suspended" && <button className="text-xs text-teal-600 font-semibold hover:underline">Reinstate</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {viewTab === "rides" && (
          <div className="space-y-3">
            {[
              { id: "R4821", from: "IIT Delhi Gate 1", to: "Hauz Khas Metro", driver: "Arjun Sharma", rider: "Sneha Kapoor", status: "active", time: "8:30 AM" },
              { id: "R4820", from: "South Campus", to: "AIIMS Metro", driver: "Priya Nair", rider: "Rahul Singh", status: "completed", time: "9:00 AM" },
              { id: "R4819", from: "BITS Pilani Main Gate", to: "Pilani Town Bus Stand", driver: "Karan Verma", rider: "Aisha Mohammed", status: "active", time: "8:15 AM" },
            ].map(r => (
              <Card key={r.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{r.id}</span>
                  <StatusPill status={r.status as any} />
                </div>
                <RouteViz from={r.from} to={r.to} />
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Driver: <span className="font-semibold text-slate-700">{r.driver}</span></span>
                  <span>Rider: <span className="font-semibold text-slate-700">{r.rider}</span></span>
                  <span><Clock className="w-3 h-3 inline mr-0.5" />{r.time}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {viewTab === "map" && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Live trip map — 341 active trips</h3>
              <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> Live feed
              </div>
            </div>
            <div className="aspect-video bg-slate-100">
              <CampusMapSVG className="w-full h-full" />
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-teal-500" />Active trips (341)</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-amber-400" />Starting soon (58)</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded-full bg-slate-300" />Completed today (1,847)</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ========================= MAIN APP =========================

export default function App() {
  const [state, setState] = useState<AppState>({ page: "cover", role: "guest", isLoggedIn: false });

  const setPage = useCallback((page: Page) => {
    setState(s => ({ ...s, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onLogin = useCallback((role: Role) => {
    setState({ page: role === "admin" ? "admin-dashboard" : role === "driver" ? "driver-dashboard" : "rider-dashboard", role, isLoggedIn: true });
    window.scrollTo({ top: 0 });
  }, []);

  const onLogout = useCallback(() => {
    setState({ page: "home", role: "guest", isLoggedIn: false });
  }, []);

  const { page, role, isLoggedIn } = state;

  const noNavPages: Page[] = ["cover", "active-trip-rider", "active-trip-driver", "start-otp", "complete-otp"];
  const showNav = !noNavPages.includes(page);

  const renderPage = () => {
    switch (page) {
      case "cover": return <CoverPage setPage={setPage} />;
      case "home": return <><HomePage setPage={setPage} /><Footer setPage={setPage} /></>;
      case "how-it-works": return <><HowItWorksPage setPage={setPage} /><Footer setPage={setPage} /></>;
      case "login": return <LoginPage setPage={setPage} onLogin={onLogin} />;
      case "register": return <RegisterPage setPage={setPage} />;
      case "otp-verify": return <OTPVerifyPage setPage={setPage} onLogin={onLogin} />;
      case "rider-dashboard": return <RiderDashboardPage setPage={setPage} />;
      case "ride-details": return <RideDetailsPage setPage={setPage} />;
      case "ride-negotiation": return <RideNegotiationPage setPage={setPage} />;
      case "driver-dashboard": return <DriverDashboardPage setPage={setPage} />;
      case "offer-ride": return <OfferRidePage setPage={setPage} />;
      case "driver-requests": return <DriverRequestsPage setPage={setPage} />;
      case "active-trip-rider": return <ActiveTripPage role="rider" setPage={setPage} />;
      case "active-trip-driver": return <ActiveTripPage role="driver" setPage={setPage} />;
      case "start-otp": return <StartOTPPage setPage={setPage} onStart={() => setPage("active-trip-rider")} />;
      case "complete-otp": return <CompleteOTPPage setPage={setPage} />;
      case "trip-history": return <TripHistoryPage setPage={setPage} />;
      case "profile": return <ProfilePage setPage={setPage} role={role} onLogout={onLogout} />;
      case "help-center": return <><HelpCenterPage /><Footer setPage={setPage} /></>;
      case "safety-center": return <><SafetyCenterPage /><Footer setPage={setPage} /></>;
      case "contact-us": return <><ContactUsPage /><Footer setPage={setPage} /></>;
      case "admin-dashboard": return <AdminDashboardPage setPage={setPage} />;
      case "admin-universities": return <AdminUniversitiesPage />;
      case "admin-users": return <AdminUsersPage />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {showNav && <Navbar page={page} setPage={setPage} role={role} isLoggedIn={isLoggedIn} onLogout={onLogout} />}
      <main>{renderPage()}</main>
    </div>
  );
}
