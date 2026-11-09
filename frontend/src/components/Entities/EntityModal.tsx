import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Entity, EntityType } from '../../types';
import { api } from '../../api/client';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (entity: Entity) => void;
  entityToEdit?: Entity | null;
  defaultType?: EntityType;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityToEdit,
  defaultType = 'CLIENT',
}) => {
  const [entityType, setEntityType] = useState<EntityType>(defaultType);
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entityToEdit) {
      setEntityType(entityToEdit.entity_type);
      setName(entityToEdit.name);
      setDocumentNumber(entityToEdit.document_number);
      setEmail(entityToEdit.email || '');
      setPhone(entityToEdit.phone || '');
      setAddress(entityToEdit.address || '');
    } else {
      setEntityType(defaultType);
      setName('');
      setDocumentNumber('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
    setError(null);
  }, [entityToEdit, defaultType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre o razón social es obligatorio');
      return;
    }

    if (!documentNumber.trim()) {
      setError('El número de documento o RUC es obligatorio');
      return;
    }

    try {
      setSubmitting(true);
      if (entityToEdit) {
        const res = await api.updateEntity(entityToEdit.id, {
          entity_type: entityType,
          name: name.trim(),
          document_number: documentNumber.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        });
        onSuccess(res.data);
      } else {
        const res = await api.createEntity({
          entity_type: entityType,
          name: name.trim(),
          document_number: documentNumber.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        });
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar los datos de la entidad');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transition-all animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {entityToEdit ? 'Editar Entidad Fiscal' : 'Registrar Nueva Entidad'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Tipo: Cliente vs Proveedor */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Tipo de Entidad
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setEntityType('CLIENT')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  entityType === 'CLIENT'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cliente (Receptor)
              </button>
              <button
                type="button"
                onClick={() => setEntityType('SUPPLIER')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  entityType === 'SUPPLIER'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Proveedor (Emisor)
              </button>
            </div>
          </div>

          {/* Nombre / Razón Social */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nombre o Razón Social *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Inversiones del Este S.A."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* RUC / Documento */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              RUC o Cédula de Identidad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 80012345-6 o 4.150.220"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none mono-num"
            />
          </div>

          {/* Correo y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </label>
              <input
                type="email"
                placeholder="contacto@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Teléfono
              </label>
              <input
                type="text"
                placeholder="0981-123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Dirección Fiscal
            </label>
            <input
              type="text"
              placeholder="Ej: Avda. España 1420, Asunción"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : entityToEdit ? 'Actualizar' : 'Guardar Entidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
