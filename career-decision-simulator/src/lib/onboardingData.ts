// Static data for the guided onboarding wizard

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  keywords: string[];
}

export interface Domain {
  id: string;
  label: string;
  categoryId: string;
}

export interface CareerOption {
  id: string;
  title: string;
  domainId: string;
  emoji: string;
  salaryRange: string;
  demand: 'High' | 'Medium' | 'Low';
}

// ── 1. Career Categories ──────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    id: 'engineering',
    label: 'Engineering & Technology',
    icon: '⚙️',
    color: 'violet',
    description: 'Build the digital and physical world',
    keywords: ['software', 'coding', 'ai', 'developer', 'tech', 'mechanics', 'construction', 'electronics'],
  },
  {
    id: 'law',
    label: 'Law',
    icon: '⚖️',
    color: 'amber',
    description: 'Advocate, advise and uphold justice',
    keywords: ['legal', 'court', 'lawyer', 'attorney', 'rights', 'justice', 'corporate law', 'criminal'],
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: '🏥',
    color: 'emerald',
    description: 'Heal, diagnose and advance healthcare',
    keywords: ['doctor', 'nurse', 'hospital', 'health', 'surgery', 'psychiatry', 'clinic', 'medicine'],
  },
  {
    id: 'pharma',
    label: 'Pharma',
    icon: '💊',
    color: 'teal',
    description: 'Discover and develop life-saving drugs',
    keywords: ['medicine', 'drugs', 'research', 'chemistry', 'pharmacy', 'clinical', 'biology', 'lab'],
  },
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    color: 'pink',
    description: 'Shape how the world looks and feels',
    keywords: ['art', 'ui', 'ux', 'graphic', 'fashion', 'creative', 'interior', 'visual', 'aesthetics'],
  },
  {
    id: 'architecture',
    label: 'Architecture & Planning',
    icon: '🏛️',
    color: 'orange',
    description: 'Design spaces and built environments',
    keywords: ['buildings', 'construction', 'urban', 'city', 'landscape', 'planning', 'structure'],
  },
  {
    id: 'humanities',
    label: 'Humanities & Arts',
    icon: '📚',
    color: 'rose',
    description: 'Explore culture, history and expression',
    keywords: ['history', 'literature', 'writing', 'journalism', 'psychology', 'culture', 'arts', 'media'],
  },
  {
    id: 'education',
    label: 'Teacher Education',
    icon: '🎓',
    color: 'indigo',
    description: 'Shape the next generation of minds',
    keywords: ['school', 'teaching', 'professor', 'college', 'students', 'learning', 'academic', 'research'],
  },
  {
    id: 'management',
    label: 'Management & Commerce',
    icon: '💼',
    color: 'blue',
    description: 'Lead organisations and drive business',
    keywords: ['business', 'finance', 'marketing', 'hr', 'mba', 'startup', 'leadership', 'sales', 'logistics'],
  },
  {
    id: 'sciences',
    label: 'Math & Sciences',
    icon: '🔬',
    color: 'cyan',
    description: 'Solve fundamental problems with data',
    keywords: ['math', 'physics', 'chemistry', 'biology', 'data', 'statistics', 'research', 'analytics'],
  },
];

// ── 2. Domains per Category ───────────────────────────────────────────────────
export const DOMAINS: Domain[] = [
  // Engineering & Technology
  { id: 'cse', label: 'Computer Science Engineering', categoryId: 'engineering' },
  { id: 'mech', label: 'Mechanical Engineering', categoryId: 'engineering' },
  { id: 'civil', label: 'Civil Engineering', categoryId: 'engineering' },
  { id: 'aero', label: 'Aeronautical Engineering', categoryId: 'engineering' },
  { id: 'electrical', label: 'Electrical Engineering', categoryId: 'engineering' },
  { id: 'biotech', label: 'Biotechnology Engineering', categoryId: 'engineering' },

  // Law
  { id: 'corporate-law', label: 'Corporate & Business Law', categoryId: 'law' },
  { id: 'criminal-law', label: 'Criminal Law', categoryId: 'law' },
  { id: 'ip-law', label: 'Intellectual Property Law', categoryId: 'law' },
  { id: 'constitutional-law', label: 'Constitutional Law', categoryId: 'law' },

  // Medical
  { id: 'mbbs', label: 'MBBS / General Medicine', categoryId: 'medical' },
  { id: 'surgery', label: 'Surgery & Specialisations', categoryId: 'medical' },
  { id: 'psychiatry', label: 'Psychiatry & Mental Health', categoryId: 'medical' },
  { id: 'radiology', label: 'Radiology & Diagnostics', categoryId: 'medical' },

  // Pharma
  { id: 'pharmacology', label: 'Pharmacology & Drug Discovery', categoryId: 'pharma' },
  { id: 'clinical-research', label: 'Clinical Research', categoryId: 'pharma' },
  { id: 'regulatory', label: 'Regulatory Affairs', categoryId: 'pharma' },

  // Design
  { id: 'ux-design', label: 'UX / Product Design', categoryId: 'design' },
  { id: 'graphic-design', label: 'Graphic & Visual Design', categoryId: 'design' },
  { id: 'fashion-design', label: 'Fashion Design', categoryId: 'design' },
  { id: 'interior-design', label: 'Interior Design', categoryId: 'design' },

  // Architecture
  { id: 'urban-design', label: 'Urban & City Planning', categoryId: 'architecture' },
  { id: 'landscape', label: 'Landscape Architecture', categoryId: 'architecture' },
  { id: 'structural', label: 'Structural Architecture', categoryId: 'architecture' },

  // Humanities & Arts
  { id: 'history', label: 'History & Archaeology', categoryId: 'humanities' },
  { id: 'literature', label: 'Literature & Creative Writing', categoryId: 'humanities' },
  { id: 'journalism', label: 'Journalism & Media', categoryId: 'humanities' },
  { id: 'psychology', label: 'Psychology & Behavioural Science', categoryId: 'humanities' },

  // Teacher Education
  { id: 'primary-edu', label: 'Primary & Secondary Education', categoryId: 'education' },
  { id: 'higher-edu', label: 'Higher Education & Research', categoryId: 'education' },
  { id: 'special-edu', label: 'Special Education', categoryId: 'education' },

  // Management & Commerce
  { id: 'mba', label: 'MBA / Business Administration', categoryId: 'management' },
  { id: 'finance-commerce', label: 'Finance & Accounting', categoryId: 'management' },
  { id: 'marketing', label: 'Marketing & Brand Strategy', categoryId: 'management' },
  { id: 'hr', label: 'Human Resources', categoryId: 'management' },
  { id: 'logistics', label: 'Supply Chain & Logistics', categoryId: 'management' },

  // Math & Sciences
  { id: 'data-science-math', label: 'Data Science & Statistics', categoryId: 'sciences' },
  { id: 'physics', label: 'Physics & Astrophysics', categoryId: 'sciences' },
  { id: 'chemistry', label: 'Chemistry & Materials', categoryId: 'sciences' },
  { id: 'biology', label: 'Life Sciences & Genetics', categoryId: 'sciences' },
];

// ── 3. Career Options per Domain (2+ each) ───────────────────────────────────
export const CAREER_OPTIONS: CareerOption[] = [
  // CSE
  { id: 'software-dev', title: 'Software Developer', domainId: 'cse', emoji: '💻', salaryRange: '₹6–30L', demand: 'High' },
  { id: 'data-scientist', title: 'Data Scientist', domainId: 'cse', emoji: '📊', salaryRange: '₹8–35L', demand: 'High' },
  { id: 'cybersecurity', title: 'Cybersecurity Analyst', domainId: 'cse', emoji: '🔐', salaryRange: '₹7–28L', demand: 'High' },
  { id: 'ai-engineer', title: 'AI / ML Engineer', domainId: 'cse', emoji: '🤖', salaryRange: '₹10–45L', demand: 'High' },
  { id: 'cloud-architect', title: 'Cloud Architect', domainId: 'cse', emoji: '☁️', salaryRange: '₹15–50L', demand: 'High' },
  { id: 'devops', title: 'DevOps Engineer', domainId: 'cse', emoji: '🔧', salaryRange: '₹8–32L', demand: 'High' },

  // Mech
  { id: 'mech-design', title: 'Mechanical Design Engineer', domainId: 'mech', emoji: '🔩', salaryRange: '₹4–18L', demand: 'Medium' },
  { id: 'robotics', title: 'Robotics Engineer', domainId: 'mech', emoji: '🦾', salaryRange: '₹6–25L', demand: 'High' },
  { id: 'thermal', title: 'Thermal / HVAC Engineer', domainId: 'mech', emoji: '🌡️', salaryRange: '₹4–16L', demand: 'Medium' },

  // Civil
  { id: 'structural-eng', title: 'Structural Engineer', domainId: 'civil', emoji: '🏗️', salaryRange: '₹4–20L', demand: 'Medium' },
  { id: 'project-manager-civil', title: 'Construction Project Manager', domainId: 'civil', emoji: '📐', salaryRange: '₹6–25L', demand: 'Medium' },

  // Aero
  { id: 'aerospace-eng', title: 'Aerospace Engineer', domainId: 'aero', emoji: '🚀', salaryRange: '₹6–30L', demand: 'Medium' },
  { id: 'avionics', title: 'Avionics Engineer', domainId: 'aero', emoji: '✈️', salaryRange: '₹5–24L', demand: 'Medium' },
  
  // Electrical
  { id: 'electrical-eng', title: 'Electrical Engineer', domainId: 'electrical', emoji: '⚡', salaryRange: '₹5–22L', demand: 'Medium' },
  { id: 'power-systems', title: 'Power Systems Engineer', domainId: 'electrical', emoji: '🔋', salaryRange: '₹4–18L', demand: 'Medium' },

  // Biotech
  { id: 'biotech-eng', title: 'Biotechnologist', domainId: 'biotech', emoji: '🧬', salaryRange: '₹4–20L', demand: 'Low' },
  { id: 'clinical-data', title: 'Clinical Data Analyst', domainId: 'biotech', emoji: '🔬', salaryRange: '₹5–18L', demand: 'Medium' },

  // Law
  { id: 'corporate-lawyer', title: 'Corporate Lawyer', domainId: 'corporate-law', emoji: '🏢', salaryRange: '₹8–50L', demand: 'High' },
  { id: 'legal-counsel', title: 'In-House Legal Counsel', domainId: 'corporate-law', emoji: '📋', salaryRange: '₹10–40L', demand: 'High' },
  { id: 'criminal-lawyer', title: 'Criminal Defence Lawyer', domainId: 'criminal-law', emoji: '⚖️', salaryRange: '₹4–30L', demand: 'Medium' },
  { id: 'public-prosecutor', title: 'Public Prosecutor', domainId: 'criminal-law', emoji: '🔨', salaryRange: '₹5–20L', demand: 'Medium' },
  { id: 'ip-lawyer', title: 'IP / Patent Attorney', domainId: 'ip-law', emoji: '💡', salaryRange: '₹6–35L', demand: 'Medium' },
  { id: 'trademark-lawyer', title: 'Trademark Lawyer', domainId: 'ip-law', emoji: '™️', salaryRange: '₹5–25L', demand: 'Medium' },
  { id: 'constitutional-lawyer', title: 'Constitutional Lawyer', domainId: 'constitutional-law', emoji: '📜', salaryRange: '₹5–30L', demand: 'Low' },
  { id: 'human-rights-lawyer', title: 'Human Rights Advocate', domainId: 'constitutional-law', emoji: '🤝', salaryRange: '₹3–15L', demand: 'Low' },

  // Medical
  { id: 'general-physician', title: 'General Physician', domainId: 'mbbs', emoji: '👨‍⚕️', salaryRange: '₹6–30L', demand: 'High' },
  { id: 'pediatrician', title: 'Pediatrician', domainId: 'mbbs', emoji: '👶', salaryRange: '₹8–35L', demand: 'High' },
  { id: 'surgeon', title: 'General Surgeon', domainId: 'surgery', emoji: '🔬', salaryRange: '₹15–80L', demand: 'High' },
  { id: 'neurosurgeon', title: 'Neurosurgeon', domainId: 'surgery', emoji: '🧠', salaryRange: '₹20–100L+', demand: 'High' },
  { id: 'psychiatrist', title: 'Psychiatrist', domainId: 'psychiatry', emoji: '🛋️', salaryRange: '₹10–50L', demand: 'High' },
  { id: 'clinical-psychologist', title: 'Clinical Psychologist', domainId: 'psychiatry', emoji: '🧠', salaryRange: '₹4–20L', demand: 'Medium' },
  { id: 'radiologist', title: 'Radiologist', domainId: 'radiology', emoji: '🩻', salaryRange: '₹12–60L', demand: 'High' },
  { id: 'mri-specialist', title: 'MRI Specialist', domainId: 'radiology', emoji: '☢️', salaryRange: '₹10–40L', demand: 'Medium' },

  // Pharma
  { id: 'pharmacologist', title: 'Pharmacologist', domainId: 'pharmacology', emoji: '💊', salaryRange: '₹5–25L', demand: 'Medium' },
  { id: 'drug-researcher', title: 'Drug Discovery Scientist', domainId: 'pharmacology', emoji: '🔬', salaryRange: '₹6–30L', demand: 'High' },
  { id: 'clinical-research-coord', title: 'Clinical Research Coordinator', domainId: 'clinical-research', emoji: '📋', salaryRange: '₹4–15L', demand: 'Medium' },
  { id: 'trial-manager', title: 'Clinical Trial Manager', domainId: 'clinical-research', emoji: '📊', salaryRange: '₹8–25L', demand: 'Medium' },
  { id: 'regulatory-specialist', title: 'Regulatory Affairs Specialist', domainId: 'regulatory', emoji: '⚖️', salaryRange: '₹5–20L', demand: 'Medium' },
  { id: 'compliance-officer', title: 'Compliance Officer', domainId: 'regulatory', emoji: '📑', salaryRange: '₹6–24L', demand: 'High' },

  // Design
  { id: 'ux-designer', title: 'UX Designer', domainId: 'ux-design', emoji: '🎨', salaryRange: '₹5–25L', demand: 'High' },
  { id: 'product-designer', title: 'Product Designer', domainId: 'ux-design', emoji: '✏️', salaryRange: '₹8–35L', demand: 'High' },
  { id: 'graphic-designer', title: 'Graphic Designer', domainId: 'graphic-design', emoji: '🖼️', salaryRange: '₹3–18L', demand: 'Medium' },
  { id: 'motion-designer', title: 'Motion Graphics Designer', domainId: 'graphic-design', emoji: '🎬', salaryRange: '₹4–20L', demand: 'Medium' },
  { id: 'fashion-designer', title: 'Fashion Designer', domainId: 'fashion-design', emoji: '👗', salaryRange: '₹4–25L', demand: 'Medium' },
  { id: 'apparel-merchandiser', title: 'Apparel Merchandiser', domainId: 'fashion-design', emoji: '🛍️', salaryRange: '₹5–18L', demand: 'Medium' },
  { id: 'interior-designer', title: 'Interior Designer', domainId: 'interior-design', emoji: '🛋️', salaryRange: '₹4–25L', demand: 'Medium' },
  { id: 'space-planner', title: 'Space Planner', domainId: 'interior-design', emoji: '📐', salaryRange: '₹5–20L', demand: 'Medium' },

  // Architecture
  { id: 'urban-planner', title: 'Urban Planner', domainId: 'urban-design', emoji: '🏙️', salaryRange: '₹5–22L', demand: 'Medium' },
  { id: 'city-developer', title: 'City Development Consultant', domainId: 'urban-design', emoji: '🌆', salaryRange: '₹6–30L', demand: 'Medium' },
  { id: 'landscape-arch', title: 'Landscape Architect', domainId: 'landscape', emoji: '🌳', salaryRange: '₹4–18L', demand: 'Low' },
  { id: 'eco-designer', title: 'Ecological Designer', domainId: 'landscape', emoji: '🌿', salaryRange: '₹5–15L', demand: 'Low' },
  { id: 'structural-arch', title: 'Structural Architect', domainId: 'structural', emoji: '🏛️', salaryRange: '₹6–35L', demand: 'High' },
  { id: 'building-restorer', title: 'Building Restorer', domainId: 'structural', emoji: '🔨', salaryRange: '₹5–20L', demand: 'Medium' },

  // Humanities & Arts
  { id: 'historian', title: 'Historian / Archivist', domainId: 'history', emoji: '🏺', salaryRange: '₹3–12L', demand: 'Low' },
  { id: 'archaeologist', title: 'Archaeologist', domainId: 'history', emoji: '⛏️', salaryRange: '₹4–15L', demand: 'Low' },
  { id: 'author', title: 'Author / Writer', domainId: 'literature', emoji: '✍️', salaryRange: '₹3–20L', demand: 'Medium' },
  { id: 'editor', title: 'Publishing Editor', domainId: 'literature', emoji: '📚', salaryRange: '₹4–15L', demand: 'Low' },
  { id: 'journalist', title: 'Journalist', domainId: 'journalism', emoji: '📰', salaryRange: '₹3–18L', demand: 'Medium' },
  { id: 'pr-specialist', title: 'Public Relations Specialist', domainId: 'journalism', emoji: '🎤', salaryRange: '₹4–25L', demand: 'High' },
  { id: 'counseling-psychologist', title: 'Counseling Psychologist', domainId: 'psychology', emoji: '🗣️', salaryRange: '₹4–20L', demand: 'High' },
  { id: 'behavioral-scientist', title: 'Behavioral Scientist', domainId: 'psychology', emoji: '🧠', salaryRange: '₹6–30L', demand: 'Medium' },

  // Teacher Education
  { id: 'primary-teacher', title: 'Primary School Teacher', domainId: 'primary-edu', emoji: '🎒', salaryRange: '₹3–10L', demand: 'High' },
  { id: 'high-school-teacher', title: 'High School Teacher', domainId: 'primary-edu', emoji: '🏫', salaryRange: '₹4–15L', demand: 'High' },
  { id: 'professor', title: 'University Professor', domainId: 'higher-edu', emoji: '🎓', salaryRange: '₹8–30L', demand: 'Medium' },
  { id: 'academic-researcher', title: 'Academic Researcher', domainId: 'higher-edu', emoji: '🔬', salaryRange: '₹6–25L', demand: 'Low' },
  { id: 'special-ed-teacher', title: 'Special Educator', domainId: 'special-edu', emoji: '🤝', salaryRange: '₹4–15L', demand: 'High' },
  { id: 'speech-therapist', title: 'Speech Therapist', domainId: 'special-edu', emoji: '🗣️', salaryRange: '₹5–20L', demand: 'Medium' },

  // Management
  { id: 'product-manager', title: 'Product Manager', domainId: 'mba', emoji: '📦', salaryRange: '₹12–50L', demand: 'High' },
  { id: 'strategy-consultant', title: 'Strategy Consultant', domainId: 'mba', emoji: '🧩', salaryRange: '₹15–60L', demand: 'High' },
  { id: 'financial-analyst', title: 'Financial Analyst', domainId: 'finance-commerce', emoji: '💹', salaryRange: '₹5–25L', demand: 'High' },
  { id: 'investment-banker', title: 'Investment Banker', domainId: 'finance-commerce', emoji: '🏦', salaryRange: '₹10–70L', demand: 'High' },
  { id: 'marketing-manager', title: 'Marketing Manager', domainId: 'marketing', emoji: '📣', salaryRange: '₹6–30L', demand: 'Medium' },
  { id: 'brand-strategist', title: 'Brand Strategist', domainId: 'marketing', emoji: '🌟', salaryRange: '₹5–22L', demand: 'Medium' },
  { id: 'hr-manager', title: 'HR Manager', domainId: 'hr', emoji: '👥', salaryRange: '₹6–25L', demand: 'High' },
  { id: 'talent-acquisition', title: 'Talent Acquisition Lead', domainId: 'hr', emoji: '🎯', salaryRange: '₹5–20L', demand: 'Medium' },
  { id: 'supply-chain-mgr', title: 'Supply Chain Manager', domainId: 'logistics', emoji: '🚛', salaryRange: '₹6–28L', demand: 'High' },
  { id: 'logistics-analyst', title: 'Logistics Analyst', domainId: 'logistics', emoji: '📦', salaryRange: '₹4–15L', demand: 'Medium' },

  // Sciences
  { id: 'data-analyst', title: 'Data Analyst', domainId: 'data-science-math', emoji: '📈', salaryRange: '₹4–20L', demand: 'High' },
  { id: 'ml-researcher', title: 'Machine Learning Researcher', domainId: 'data-science-math', emoji: '🔭', salaryRange: '₹10–50L', demand: 'High' },
  { id: 'research-scientist', title: 'Research Scientist (Physics)', domainId: 'physics', emoji: '⚛️', salaryRange: '₹4–20L', demand: 'Low' },
  { id: 'astrophysicist', title: 'Astrophysicist', domainId: 'physics', emoji: '🌌', salaryRange: '₹5–25L', demand: 'Low' },
  { id: 'analytical-chemist', title: 'Analytical Chemist', domainId: 'chemistry', emoji: '⚗️', salaryRange: '₹4–18L', demand: 'Medium' },
  { id: 'materials-scientist', title: 'Materials Scientist', domainId: 'chemistry', emoji: '💎', salaryRange: '₹5–22L', demand: 'Medium' },
  { id: 'microbiologist', title: 'Microbiologist', domainId: 'biology', emoji: '🦠', salaryRange: '₹4–15L', demand: 'Medium' },
  { id: 'geneticist', title: 'Geneticist', domainId: 'biology', emoji: '🧬', salaryRange: '₹6–25L', demand: 'Low' },
];

// ── 4. Onboarding state types ─────────────────────────────────────────────────
export interface OnboardingState {
  categoryId: string | null;
  domainId: string | null;
  selectedCareerIds: string[];
  profile: {
    leadership: number;
    communication: number;
    analytical: number;
    management: number;
    workPreferences: {
      teamType: 'team' | 'solo';
      workNature: 'creative' | 'analytical';
      pace: 'stable' | 'fast';
      interaction: 'people' | 'technical';
    };
    currentSkills: string[];
  };
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  categoryId: null,
  domainId: null,
  selectedCareerIds: [],
  profile: {
    leadership: 50,
    communication: 50,
    analytical: 50,
    management: 50,
    workPreferences: {
      teamType: 'team',
      workNature: 'creative',
      pace: 'stable',
      interaction: 'people',
    },
    currentSkills: [],
  },
};

export const SKILL_OPTIONS = [
  // Generic
  'Programming', 'Data Analysis', 'Design', 'Problem Solving',
  'Communication', 'Leadership', 'Project Management', 'Research',
  'Writing', 'Mathematics', 'Critical Thinking', 'Teamwork',
  'Public Speaking', 'Negotiation', 'Finance', 'Marketing',
  
  // Specific Tech
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 
  'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
  'React', 'Next.js', 'Angular', 'Vue.js', 'Node.js', 'Django',
  'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow',

  // Tools & Platforms
  'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 
  'Figma', 'Adobe Creative Suite', 'AutoCAD', 'SolidWorks',
  'Excel', 'Tableau', 'Power BI', 'Google Analytics', 'SEO'
];
