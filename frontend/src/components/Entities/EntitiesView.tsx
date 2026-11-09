import React, { useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Entity, EntityType } from '../../types';
import { api } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';

interface EntitiesViewProps {
  entities: Entity[];
  loading: boolean;
  onRefresh: () => void;
  onOpenNewEntityModal: (type?: EntityType) => void;
  onEditEntity: (entity: Entity) => void;
  onViewEntityDetail: (id: string) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  loading,
  onRefresh,
  onOpenNewEntityModal,
  onEditEntity,
  onViewEntityDetail,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | EntityType>('ALL');
  const [search, setSearch] = useState('');

  const filteredEntities = entities.filter((e) => {
    if (filterType !== 'ALL' && e.entity_type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.document_number.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const clientCount = entities.filter((e) => e.entity_type === 'CLIENT').length;
  const supplierCount = entities.filter((e) => e.entity_type === 'SUPPLIER').length;

  const handleDelete = async (e: Entity) => {
    if (confirm(`¿Eliminar entidad fiscal "${e.name}"?`)) {
      try {
        await api.deleteEntity(e.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'No se pudo eliminar la entidad');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Controles superiores */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Pestañas de filtro */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({entities.length})
          </button>
          <button
            onClick={() => setFilterType('CLIENT')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'CLIENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Clientes ({clientCount})
          </button>
          <button
            onClick={() => setFilterType('SUPPLIER')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterType === 'SUPPLIER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Proveedores ({supplierCount})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Razón Social o RUC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none"
          />
        </div>

        {/* Botón Nueva Entidad */}
        <button
          onClick={() => onOpenNewEntityModal(filterType === 'SUPPLIER' ? 'SUPPLIER' : 'CLIENT')}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-emerald-600/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Entidad</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Entidades */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Cargando directorio de entidades...</div>
      ) : filteredEntities.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold text-sm">No se encontraron entidades registradas</p>
          <p className="text-slate-400 text-xs mt-1">
            Puedes dar de alta clientes y proveedores para asociarles transacciones y recibos.
          </p>
          <button
            onClick={() => onOpenNewEntityModal()}
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold py-2 px-4 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Agregar Primera Entidad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((e) => {
            const isClient = e.entity_type === 'CLIENT';
            return (
              <div
                key={e.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isClient ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">
                          {e.name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          RUC: {e.document_number}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isClient
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isClient ? 'Cliente' : 'Proveedor'}
                    </span>
                  </div>

                  {/* Datos de contacto */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    {e.phone && (
                      <p className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{e.phone}</span>
                      </p>
                    )}
                    {e.email && (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{e.email}</span>
                      </p>
                    )}
                    {e.address && (
                      <p className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{e.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Métricas y Acciones */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Operaciones
                    </span>
                    <span className="text-xs font-bold text-slate-700 mono-num">
                      {e.total_transactions || 0} movimientos
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewEntityDetail(e.id)}
                      title="Ver Historial"
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditEntity(e)}
                      title="Editar"
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(e)}
                      title="Eliminar"
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
