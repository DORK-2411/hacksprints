import insforge from './insforgeClient';

export interface Career {
  id: string;
  title: string;
  avg_salary: number;
  growth_rate: number;
  skills_required: string[];
  demand_level: number;
  category: string;
  description: string;
  emoji?: string;  // optional emoji for display in UI
}

// Fetch all careers from InsForge
export async function fetchCareers(): Promise<Career[]> {
  const { data, error } = await insforge.database
    .from('careers')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching careers:', error);
    return [];
  }
  return data as Career[];
}

// Fetch a single career by id
export async function fetchCareerById(id: string): Promise<Career | null> {
  const { data, error } = await insforge.database
    .from('careers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching career:', error);
    return null;
  }
  return data as Career;
}

// --- Pure logic helpers (no API needed) ---

export const LOCATION_MULTIPLIERS: Record<string, { label: string; multiplier: number }> = {
  india: { label: 'India 🇮🇳', multiplier: 1.0 },
  usa: { label: 'USA 🇺🇸', multiplier: 2.0 },
  uk: { label: 'UK 🇬🇧', multiplier: 1.6 },
  canada: { label: 'Canada 🇨🇦', multiplier: 1.5 },
  germany: { label: 'Germany 🇩🇪', multiplier: 1.4 },
  australia: { label: 'Australia 🇦🇺', multiplier: 1.7 },
  singapore: { label: 'Singapore 🇸🇬', multiplier: 1.8 },
};

/** Simulate 10-year salary growth */
export function simulateSalary(
  baseSalary: number,
  growthRate: number,
  years: number = 10,
  locationMultiplier: number = 1,
): { year: number; salary: number }[] {
  const result = [];
  let salary = baseSalary * locationMultiplier;
  for (let year = 0; year <= years; year++) {
    result.push({ year, salary: Math.round(salary) });
    salary = salary + salary * growthRate;
  }
  return result;
}

/** Compute skill match percentage */
export function computeSkillMatch(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());
  const matching = requiredSkills.filter((s) =>
    normalizedUser.some(
      (u) =>
        u === s.toLowerCase().trim() ||
        u.includes(s.toLowerCase().trim()) ||
        s.toLowerCase().trim().includes(u),
    ),
  );
  return Math.round((matching.length / requiredSkills.length) * 100);
}

/** Compute Decision Confidence Score */
export function computeConfidenceScore(
  skillMatch: number,
  demandLevel: number,
  growthRate: number,
): number {
  const score = skillMatch * 0.5 + demandLevel * 10 * 0.3 + growthRate * 100 * 0.2;
  return Math.min(Math.round(score), 100);
}

/** Get missing skills */
export function getMissingSkills(userSkills: string[], requiredSkills: string[]): string[] {
  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());
  return requiredSkills.filter(
    (s) =>
      !normalizedUser.some(
        (u) =>
          u === s.toLowerCase().trim() ||
          u.includes(s.toLowerCase().trim()) ||
          s.toLowerCase().trim().includes(u),
      ),
  );
}

/** Get trend indicator */
export function getTrend(growthRate: number): {
  label: string;
  icon: string;
  color: string;
  bg: string;
} {
  if (growthRate > 0.15)
    return { label: 'High Growth', icon: '🚀', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (growthRate >= 0.08)
    return { label: 'Stable', icon: '📊', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  return { label: 'Declining', icon: '⚠️', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
}

/** Generate career roadmap */
export function generateRoadmap(career: Career, missingSkills: string[]): {
  phase: string;
  duration: string;
  skills: string[];
  projects: string[];
}[] {
  const skillsToLearn = missingSkills.length > 0 ? missingSkills : career.skills_required.slice(0, 3);
  const third = Math.ceil(skillsToLearn.length / 3);

  const projectIdeas: Record<string, string[]> = {
    Technology: [
      `Build a full-stack ${career.title.split(' ')[0]} portfolio project`,
      `Contribute to an open-source ${career.skills_required[0]} project`,
      `Deploy a production-ready ${career.title} showcase app`,
    ],
    Design: [
      'Create a Figma design system from scratch',
      'Redesign a popular app and document your process',
      'Build a UX case study with user research',
    ],
    Business: [
      'Develop a go-to-market strategy for a SaaS product',
      'Create a product roadmap and present to stakeholders',
      'Analyze and document a real-world product launch',
    ],
    Finance: [
      'Build a financial model for a startup',
      'Create an investment thesis for a public company',
      'Automate financial reporting with Excel/Python',
    ],
  };

  const projects = projectIdeas[career.category] || projectIdeas['Technology'];

  return [
    {
      phase: 'Beginner',
      duration: '0–3 months',
      skills: skillsToLearn.slice(0, third),
      projects: [projects[0]],
    },
    {
      phase: 'Intermediate',
      duration: '3–8 months',
      skills: skillsToLearn.slice(third, third * 2),
      projects: [projects[1]],
    },
    {
      phase: 'Advanced',
      duration: '8–12 months',
      skills: skillsToLearn.slice(third * 2),
      projects: [projects[2]],
    },
  ];
}
