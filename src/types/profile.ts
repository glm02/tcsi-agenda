export const CROUS_LYON_OPTIONS = [
  { id: 'r1267', label: "Resto' U Puvis de Chavannes" },
  { id: 'r803', label: "Resto' U Les Quais" },
  { id: 'r358', label: "Resto' U Manufacture des Tabacs" },
  { id: 'r351', label: "Restaurant Monod" },
  { id: 'r225', label: "Cafétéria des Quais" },
  { id: 'r245', label: "Cafétéria Bistrot de la Manu" },
  { id: 'r975', label: "Cafétéria Lyon Sud" }
];
export interface StudentProfile {
  firstName: string;
  lastName: string;
  adeUrl: string;
  quickNote?: string;
  avatarUrl?: string | null;
  pseudo?: string | null;
  theme?: 'light' | 'dark' | 'system' | 'geii' | 'iut';
  accentColor?: string | null;
  dashboardPreference?: 'grades' | 'planning' | 'exams' | 'workload';
  blurGrades?: boolean;
  rankingVisible?: boolean;
  filiere?: 'GEII' | 'TCSI';
  crousName?: string;
}

export const DEFAULT_PROFILE: StudentProfile = {
  firstName: '',
  lastName: '',
  adeUrl: '',
  quickNote: '',
  avatarUrl: null,
  pseudo: null,
  theme: 'system',
  accentColor: null,
  dashboardPreference: 'grades',
  blurGrades: false,
  rankingVisible: true,
  filiere: 'GEII',
  crousName: 'r1267',
};
