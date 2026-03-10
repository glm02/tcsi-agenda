// Extended profile for hub (DB columns can be added via migration)
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
};
