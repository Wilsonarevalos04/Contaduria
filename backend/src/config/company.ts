import path from 'path';
import fs from 'fs';

function resolveAssetPath(filename: string): string {
  const p1 = path.join(__dirname, '../assets', filename);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.resolve(__dirname, '../../src/assets', filename);
  if (fs.existsSync(p2)) return p2;
  const p3 = path.resolve(__dirname, '../../../frontend/public', filename);
  if (fs.existsSync(p3)) return p3;
  return p1;
}

// Configuración y datos corporativos oficiales para el backend y generación de documentos
export const COMPANY_CONFIG = {
  name: 'ASESORIA CONTABLE CP. ARTURO AREVALOS',
  shortName: 'Asesoría Contable',
  accountant: 'CP. Arturo Arévalos',
  title: 'Contador Público',
  activity: 'Servicios de contabilidad',
  location: 'Yasy Cañy-Canindeyu.',
  email: 'arevalosarturo2@gmail.com',
  phone: '+595 984 508139',
  website: 'www.dnit.com.py',
  logoPath: resolveAssetPath('logo.png'),
  bannerPath: resolveAssetPath('banner.png'),
  colors: {
    primaryNavy: '#0E0F3D', // Azul marino corporativo extraído del logotipo oficial
    navyDark: '#070822',
    accentBlue: '#1E40AF',
    incomeGreen: '#16A34A',
    voidRed: '#DC2626',
    borderGray: '#E2E8F0',
    textMain: '#0F172A',
    textMuted: '#475569',
  },
};
