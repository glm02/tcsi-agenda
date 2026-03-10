export const DEFAULT_ADE = "https://edt.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=13655&projectId=1&calType=ical&firstDate=2025-08-18&lastDate=2026-08-01";

export const LINKS = {
  ADE: "https://edt.univ-lyon1.fr/direct/index.jsp",
  MAIL: "https://mail.univ-lyon1.fr/owa",
  DOCS: "https://wwwgeii.univ-lyon1.fr/depot_certif",
  MOODLE: "https://moodle.univ-lyon1.fr/",
  MIRE: "https://wwwgeii.univ-lyon1.fr/mire_geii.php",
  CROUS: "https://www.crous-lyon.fr/restaurant/restaurant-iut-gratte-ciel/",
  TCL: "https://www.tcl.fr/se-deplacer/info-trafic"
};

export const USEFUL_LINKS = [
  { name: 'Moodle', url: LINKS.MOODLE, color: 'bg-orange-500', icon: 'GraduationCap' as const },
  { name: 'Mire GEII', url: LINKS.MIRE, color: 'bg-emerald-500', icon: 'FileText' as const },
  { name: 'ADE Direct', url: LINKS.ADE, color: 'bg-indigo-500', icon: 'Calendar' as const },
  { name: 'Mail Univ', url: LINKS.MAIL, color: 'bg-sky-500', icon: 'Mail' as const },
  { name: 'Justificatifs', url: LINKS.DOCS, color: 'bg-purple-500', icon: 'Paperclip' as const },
  { name: 'Info Trafic TCL', url: LINKS.TCL, color: 'bg-red-500', icon: 'Train' as const }
];

export interface ModuleConfig {
  id: string;
  short: string;
  label: string;
  coef1: number;
  coef2: number;
  coef3?: number;
  cat: string;
}

export const MODULES_CONFIG_GEII_S1: ModuleConfig[] = [
  { id: 'R1.01', short: 'Maths 1', label: 'Mathématiques', coef1: 2.0, coef2: 0, cat: 'Fonda' },
  { id: 'R1.02', short: 'Phys 1', label: 'Physique', coef1: 0, coef2: 2.0, cat: 'Fonda' },
  { id: 'S1.1', short: 'SAÉ 1.1', label: 'SAÉ Decouverte', coef1: 1.5, coef2: 1.5, cat: 'SAÉ' },
];

export const MODULES_CONFIG_GEII_S2: ModuleConfig[] = [
  { id: 'R2.01', short: 'AN2', label: 'Analyse', coef1: 1.1, coef2: 0, cat: 'Fonda' },
  { id: 'R2.02', short: 'CC2', label: 'Culture Com', coef1: 1.1, coef2: 0, cat: 'Trans' },
  { id: 'R2.03', short: 'VE2', label: 'Vie Entr.', coef1: 0.8, coef2: 0, cat: 'Trans' },
  { id: 'R2.04', short: 'OML2', label: 'Outils Maths', coef1: 2.6, coef2: 0, cat: 'Fonda' },
  { id: 'R2.05', short: 'PPP2', label: 'Projet Pro', coef1: 0.8, coef2: 0.2, cat: 'Trans' },
  { id: 'R2.06', short: 'AUTO2', label: 'Automatisme', coef1: 0, coef2: 2.6, cat: 'Tech' },
  { id: 'R2.07', short: 'INFO2', label: 'Info Indus', coef1: 0, coef2: 2.6, cat: 'Tech' },
  { id: 'R2.08', short: 'ELEN2', label: 'Élec/Énergie', coef1: 1.3, coef2: 1.3, cat: 'Tech' },
  { id: 'R2.09', short: 'ENER2', label: 'Énergie', coef1: 1.3, coef2: 1.3, cat: 'Tech' },
  { id: 'R2.10', short: 'PApp2', label: 'Physique App', coef1: 0, coef2: 1.0, cat: 'Fonda' },
  { id: 'S2.1', short: 'SAÉ 2.1', label: 'SAÉ CAPA', coef1: 2.5, coef2: 2.5, cat: 'SAÉ' },
  { id: 'S2.2', short: 'SAÉ 2.2', label: 'SAÉ Robot', coef1: 2.5, coef2: 2.5, cat: 'SAÉ' },
  { id: 'PF2', short: 'PORTF', label: 'Portfolio S2', coef1: 1.0, coef2: 1.0, cat: 'SAÉ' },
];

export const MODULES_CONFIG_TCSI_S1: ModuleConfig[] = [
  { id: 'R1.01', short: 'Marketing', label: 'Fond. market & comportement', coef1: 6, coef2: 0, coef3: 0, cat: 'Tech' },
  { id: 'R1.02', short: 'Vente', label: 'Fondamentaux de la vente', coef1: 0, coef2: 5, coef3: 0, cat: 'Tech' },
  { id: 'R1.03', short: 'Com Tech', label: 'Communication Technique', coef1: 0, coef2: 0, coef3: 4, cat: 'Tech' },
  { id: 'R1.04', short: 'Cult Tech', label: 'Culture Technologique', coef1: 0, coef2: 4, coef3: 0, cat: 'Tech' },
  { id: 'R1.05', short: 'Env Eco', label: 'Env. économique entreprise', coef1: 1, coef2: 1, coef3: 1, cat: 'Trans' },
  { id: 'R1.06', short: 'Env Juridique', label: 'Env. juridique entreprise', coef1: 1, coef2: 1, coef3: 1, cat: 'Trans' },
  { id: 'R1.07', short: 'Res. Sci.', label: 'Ressources scientifiques', coef1: 4, coef2: 0, coef3: 0, cat: 'Fonda' },
  { id: 'R1.08', short: 'Finances', label: 'Éléments financiers', coef1: 0, coef2: 4, coef3: 0, cat: 'Trans' },
  { id: 'R1.09', short: 'Orga', label: 'Rôle & organisation entreprise', coef1: 1, coef2: 1, coef3: 1, cat: 'Trans' },
  { id: 'R1.10', short: 'Projet', label: 'Initiation conduite projet', coef1: 0, coef2: 2, coef3: 2, cat: 'Trans' },
  { id: 'R1.11', short: 'Anglais', label: 'Langue A: Anglais', coef1: 1, coef2: 1, coef3: 2, cat: 'Trans' },
  { id: 'R1.12', short: 'Langue B', label: 'Langue B: Commerce', coef1: 1, coef2: 1, coef3: 1, cat: 'Trans' },
  { id: 'R1.13', short: 'Syst Auto', label: 'Systèmes auto. connectés', coef1: 3, coef2: 0, coef3: 0, cat: 'Tech' },
  { id: 'R1.14', short: 'ECC', label: 'Expression, com & culture', coef1: 0, coef2: 0, coef3: 4, cat: 'Trans' },
  { id: 'R1.15', short: 'PPP', label: 'Projet Pro. Perso.', coef1: 0, coef2: 0, coef3: 3, cat: 'Trans' },
  { id: 'S1.01', short: 'SAE Market', label: 'Marketing: offre simple', coef1: 14, coef2: 0, coef3: 0, cat: 'SAÉ' },
  { id: 'S1.02', short: 'SAE Vente', label: 'Vente: prospection', coef1: 0, coef2: 14, coef3: 0, cat: 'SAÉ' },
  { id: 'S1.03', short: 'SAE Com', label: 'Com: support print', coef1: 0, coef2: 0, coef3: 14, cat: 'SAÉ' },
];

export const MODULES_CONFIG_TCSI_S2: ModuleConfig[] = [
  { id: 'R2.01', short: 'Marketing 2', label: 'Marketing S2', coef1: 1.2, coef2: 1.2, cat: 'Tech' },
  { id: 'R2.02', short: 'Négo', label: 'Négociation S2', coef1: 1.5, coef2: 1.5, cat: 'Tech' },
  { id: 'S2.01', short: 'SAE 2.1', label: 'Projet TCSI 2', coef1: 2.0, coef2: 2.0, cat: 'SAÉ' },
];

export interface TaskData {
  module: string;
  title: string;
  end: string;
  type: string;
}

const baseTasks: TaskData[] = [
  { module: 'R2.09', title: 'QCM_TD1', end: '2026-02-13', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD2', end: '2026-03-04', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD3', end: '2026-03-06', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD4', end: '2026-03-13', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD6', end: '2026-03-27', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD8', end: '2026-04-24', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD9', end: '2026-04-30', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD11', end: '2026-05-08', type: 'QCM' },
  { module: 'R2.09', title: 'QCM_TD12', end: '2026-05-21', type: 'QCM' },
  { module: 'R2.10', title: 'QCM1_Séance 1', end: '2026-02-06', type: 'QCM' },
  { module: 'R2.10', title: 'QCM2_Séance 2', end: '2026-02-13', type: 'QCM' },
  { module: 'R2.10', title: 'QCM3 - Devoir', end: '2026-02-27', type: 'DEVOIR' },
  { module: 'R2.10', title: 'QCM4', end: '2026-03-06', type: 'QCM' },
  { module: 'R2.10', title: 'QCM5', end: '2026-03-13', type: 'QCM' },
  { module: 'R2.10', title: 'QCM6', end: '2026-03-20', type: 'QCM' },
  { module: 'R2.10', title: 'QCM7', end: '2026-03-28', type: 'QCM' },
  { module: 'R2.10', title: 'QCM8', end: '2026-04-04', type: 'QCM' },
  { module: 'R2.10', title: 'QCM10', end: '2026-04-18', type: 'QCM' },
  { module: 'R2.10', title: 'QCM11', end: '2026-05-09', type: 'QCM' },
  { module: 'R2.10', title: 'QCM12', end: '2026-05-16', type: 'QCM' },
  { module: 'R2.10', title: 'QCM13', end: '2026-05-23', type: 'QCM' },
  { module: 'R2.10', title: 'QCM14', end: '2026-05-30', type: 'QCM' },
];

// Generate math QCMs
const startDate = new Date('2026-02-02');
for (let i = 0; i < 10; i++) {
  const d1 = new Date(startDate);
  d1.setDate(startDate.getDate() + (i * 7));
  const d2 = new Date(startDate);
  d2.setDate(startDate.getDate() + (i * 7) + 3);
  baseTasks.push({ module: 'R2.04', title: `QCM Hebdo ${i + 1}.1`, end: d1.toISOString().split('T')[0], type: 'MATHS' });
  baseTasks.push({ module: 'R2.04', title: `QCM Hebdo ${i + 1}.2`, end: d2.toISOString().split('T')[0], type: 'MATHS' });
}

export const TASKS_DATA = baseTasks;
