import { useState } from "react";
import { Search, Filter, CheckCircle, Clock, GraduationCap, LogOut, DollarSign, Users, AlertCircle, TrendingUp, Bell, Download, Eye } from "lucide-react";

interface TreasuryDashboardProps {
  onLogout: () => void;
}

type Status = "all" | "pending" | "paid" | "overdue";

const payments = [
  { id: "ORD-2026-04821", student: "Carlos Andrade", career: "Ing. Informática", amount: 1120, status: "pending", date: "2026-06-15", avatar: "CA" },
  { id: "ORD-2026-04822", student: "María Sánchez", career: "Administración", amount: 840, status: "paid", date: "2026-06-10", avatar: "MS" },
  { id: "ORD-2026-04823", student: "José Ramírez", career: "Contabilidad", amount: 700, status: "paid", date: "2026-06-08", avatar: "JR" },
  { id: "ORD-2026-04824", student: "Ana López", career: "Derecho", amount: 980, status: "overdue", date: "2026-05-28", avatar: "AL" },
  { id: "ORD-2026-04825", student: "Pedro Gómez", career: "Medicina", amount: 1400, status: "pending", date: "2026-06-16", avatar: "PG" },
  { id: "ORD-2026-04826", student: "Lucía Torres", career: "Ing. Civil", amount: 1050, status: "paid", date: "2026-06-12", avatar: "LT" },
  { id: "ORD-2026-04827", student: "Miguel Herrera", career: "Psicología", amount: 770, status: "overdue", date: "2026-05-30", avatar: "MH" },
  { id: "ORD-2026-04828", student: "Sofía Vargas", career: "Arquitectura", amount: 1260, status: "pending", date: "2026-06-17", avatar: "SV" },
  { id: "ORD-2026-04829", student: "Diego Mora", career: "Ing. Electrónica", amount: 910, status: "paid", date: "2026-06-09", avatar: "DM" },
  { id: "ORD-2026-04830", student: "Valentina Cruz", career: "Nutrición", amount: 630, status: "pending", date: "2026-06-18", avatar: "VC" },
];

const statusConfig = {
  pending: { label: "Pendiente", bg: "bg-[#FEF3C7]", text: "text-[#92400E]", icon: Clock },
  paid: { label: "Pagado", bg: "bg-[#F0FDF4]", text: "text-[#065F46]", icon: CheckCircle },
  overdue: { label: "Vencido", bg: "bg-[#FEF2F2]", text: "text-[#991B1B]", icon: AlertCircle },
};

const avatarColors: Record<string, string> = {
  CA: "from-blue-400 to-blue-600",
  MS: "from-pink-400 to-pink-600",
  JR: "from-green-400 to-green-600",
  AL: "from-purple-400 to-purple-600",
  PG: "from-orange-400 to-orange-600",
  LT: "from-teal-400 to-teal-600",
  MH: "from-red-400 to-red-600",
  SV: "from-yellow-400 to-yellow-600",
  DM: "from-indigo-400 to-indigo-600",
  VC: "from-rose-400 to-rose-600",
};
