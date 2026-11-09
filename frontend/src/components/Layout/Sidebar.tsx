import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Landmark,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'statement' | 'entities' | 'receipts';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openNewTxModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openNewTxModal,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Libro Diario', icon: BookOpen },
    { id: 'statement' as NavTab, label: 'Extracto de Cuenta', icon: Landmark },
    { id: 'entities' as NavTab, label: 'Clientes', icon: Users },
    { id: 'receipts' as NavTab, label: 'Recibos Oficiales', icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-[#070822] text-slate-300 flex flex-col shrink-0 border-r border-[#171954]/60 select-none min-h-screen">
      {/* Brand Header con Logotipo Oficial AR */}
      <div className="p-4 border-b border-[#171954]/60 flex items-center gap-3 bg-[#0E0F3D]/50">
        <img
          src="/logo.png"
          alt="AR Asesoría Contable"
          className="w-11 h-11 rounded-xl shadow-md border border-white/20 object-cover shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-extrabold text-white text-[13px] leading-tight tracking-tight uppercase">
            Asesoría Contable
          </h1>
          <p className="text-xs font-bold text-sky-400 leading-tight truncate">
            CP. ARTURO AREVALOS
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            Yasy Cañy-Canindeyu
          </p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        <button
          onClick={openNewTxModal}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-950/40 transition-all duration-200 active:scale-[0.98]"
        >
          <span className="text-lg leading-none">+</span>
          <span className="text-sm">Nueva Operación</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 mt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${isActive
                  ? 'bg-[#0E0F3D] text-white font-semibold shadow-inner border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#171954]/40'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User & Database Status Footer */}
      <div className="p-4 border-t border-[#171954]/60 bg-[#070822]/90">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] text-emerald-400 font-medium">PostgreSQL 17 Conectado</span>
        </div>
        <div className="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-[#171954]/50">
          <img
            src="/logo.png"
            alt="CP. Arturo Arévalos"
            className="w-8 h-8 rounded-full object-cover border border-sky-400/40 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">CP. Arturo Arévalos</p>
            <p className="text-[10px] text-slate-400 truncate" title="arevalosarturo2@gmail.com">
              arevalosarturo2@gmail.com
            </p>
            <p className="text-[10px] text-sky-400 truncate flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" /> Administrador Contable
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
