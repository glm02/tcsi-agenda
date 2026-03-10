import { 
  MODULES_CONFIG_GEII_S1, 
  MODULES_CONFIG_GEII_S2, 
  MODULES_CONFIG_TCSI_S1, 
  MODULES_CONFIG_TCSI_S2 
} from './constants';

export interface Grade {
  id: string;
  value: string;
  coef: string;
  name: string;
}

export const calcAvg = (grades: Grade[] | undefined): string | null => {
  if (!grades || grades.length === 0) return null;
  let p = 0, c = 0;
  grades.forEach(g => {
    p += parseFloat(g.value) * parseFloat(g.coef);
    c += parseFloat(g.coef);
  });
  return c === 0 ? '0' : (p / c).toFixed(2);
};

export const getGradeColor = (val: string | null): string => {
  if (val === null || val === "—") return "text-muted-foreground";
  const v = parseFloat(val);
  if (v < 10) return "text-destructive";
  if (v < 12) return "text-warning";
  if (v < 14) return "text-primary";
  return "text-success";
};

export const getModuleName = (id: string): string => {
  const allModules = [
    ...MODULES_CONFIG_GEII_S1, 
    ...MODULES_CONFIG_GEII_S2, 
    ...MODULES_CONFIG_TCSI_S1, 
    ...MODULES_CONFIG_TCSI_S2
  ];
  const mod = allModules.find(m => m.id === id);
  return mod ? mod.label : id;
};

// Auto Import Parser
// Extracts R1.01 or S1.01 style codes and nearby grades from raw text.
export const parseTranscript = (text: string, currentModules: any[]) => {
  const extracted: { moduleId: string; grades: { value: string, name: string }[] }[] = [];
  
  // Basic regex assuming "R1.01 - Mathématiques : 14.5" or similar format
  currentModules.forEach(mod => {
    // Escape strings for regex
    const regex = new RegExp(`(${mod.id.replace('.', '\\.')}|${mod.short})[\\s\\S]{0,50}?(\\d{1,2}[.,]\\d{1,3})`, 'gi');
    let match;
    const grades = [];
    while ((match = regex.exec(text)) !== null) {
      grades.push({
        value: match[2].replace(',', '.'),
        name: `Import Auto (${mod.short})`
      });
    }
    if (grades.length > 0) {
      extracted.push({ moduleId: mod.id, grades });
    }
  });

  return extracted;
};
