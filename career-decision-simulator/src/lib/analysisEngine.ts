// Analysis engine — generates insights and scores from the onboarding profile

import { OnboardingState, CAREER_OPTIONS, CareerOption } from './onboardingData';

export interface CareerAnalysis {
  career: CareerOption;
  confidenceScore: number;     // 0–100
  skillMatchScore: number;     // 0–100
  personalityScore: number;    // 0–100 (from sliders)
  automationRisk: number;      // 0-100
  gapSkills: string[];
  insights: string[];
}


export interface AnalysisResult {
  careers: CareerAnalysis[];
  winner: CareerOption | null;
  insightText: string;
  recommendation: string;
  roadmapCareer: CareerOption | null;
}

// Trait → career affinity map (which traits boost which career types)
const CAREER_AFFINITY: Record<string, Record<string, number>> = {
  leadership: {
    'product-manager': 0.9, 'strategy-consultant': 0.85, 'marketing-manager': 0.8,
    'investment-banker': 0.75, 'corporate-lawyer': 0.7, 'brand-strategist': 0.65,
    'general-physician': 0.5, 'surgeon': 0.55,
  },
  analytical: {
    'data-scientist': 0.95, 'ai-engineer': 0.9, 'ml-researcher': 0.9,
    'data-analyst': 0.85, 'financial-analyst': 0.85, 'cybersecurity': 0.8,
    'radiologist': 0.75, 'research-scientist': 0.9, 'investment-banker': 0.8,
  },
  communication: {
    'corporate-lawyer': 0.9, 'marketing-manager': 0.9, 'brand-strategist': 0.85,
    'strategy-consultant': 0.85, 'product-manager': 0.8, 'journalist': 0.9,
    'psychiatrist': 0.85, 'general-physician': 0.7,
  },
  management: {
    'product-manager': 0.9, 'strategy-consultant': 0.85, 'investment-banker': 0.8,
    'financial-analyst': 0.7, 'project-manager-civil': 0.85, 'marketing-manager': 0.75,
  },
};

// Required skills per career (simplified for analysis engine)
const CAREER_SKILLS: Record<string, string[]> = {
  'software-dev': ['Programming', 'Problem Solving', 'Mathematics', 'Teamwork'],
  'data-scientist': ['Programming', 'Data Analysis', 'Mathematics', 'Research', 'Critical Thinking'],
  'ai-engineer': ['Programming', 'Mathematics', 'Data Analysis', 'Research'],
  'cybersecurity': ['Programming', 'Critical Thinking', 'Research', 'Problem Solving'],
  'cloud-architect': ['Cloud Platforms (AWS/Azure/GCP)', 'System Design', 'Serverless Architecture', 'Networking & Security', 'Cost Optimization'],
  'devops': ['Linux / Bash Scripting', 'CI/CD (Jenkins/Actions)', 'Containerisation (Docker)', 'Orchestration (Kubernetes)', 'Infrastructure as Code (Terraform)', 'Monitoring (Prometheus)'],
  'product-manager': ['Communication', 'Leadership', 'Project Management', 'Critical Thinking'],
  'ux-designer': ['Design', 'Communication', 'Research', 'Critical Thinking'],
  'product-designer': ['Design', 'Communication', 'Problem Solving'],
  'graphic-designer': ['Design', 'Communication', 'Critical Thinking'],
  'financial-analyst': ['Mathematics', 'Data Analysis', 'Critical Thinking', 'Finance'],
  'investment-banker': ['Finance', 'Mathematics', 'Communication', 'Negotiation'],
  'marketing-manager': ['Communication', 'Marketing', 'Leadership', 'Writing'],
  'brand-strategist': ['Communication', 'Marketing', 'Critical Thinking', 'Writing'],
  'corporate-lawyer': ['Communication', 'Research', 'Critical Thinking', 'Writing'],
  'strategy-consultant': ['Critical Thinking', 'Communication', 'Research', 'Leadership'],
  'data-analyst': ['Data Analysis', 'Mathematics', 'Programming', 'Critical Thinking'],
  'general-physician': ['Communication', 'Research', 'Critical Thinking', 'Problem Solving'],
  'surgeon': ['Problem Solving', 'Research', 'Critical Thinking', 'Teamwork'],
};

/** Compute personality alignment score (0–100) based on slider values */
function personalityScore(careerId: string, profile: OnboardingState['profile']): number {
  const traits = ['leadership', 'analytical', 'communication', 'management'] as const;
  let totalWeight = 0;
  let weightedSum = 0;

  for (const trait of traits) {
    const affinity = CAREER_AFFINITY[trait]?.[careerId] ?? 0.4; // default neutral affinity
    const traitValue = profile[trait] / 100; // normalise 0–1
    weightedSum += traitValue * affinity;
    totalWeight += affinity;
  }

  const raw = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;
  return Math.min(Math.round(raw), 100);
}

/** Compute skill match (0–100) from current skills vs required skills */
function skillMatch(userSkills: string[], careerId: string): number {
  const required = CAREER_SKILLS[careerId] ?? [];
  if (required.length === 0) return 60; // default
  const matched = required.filter((r) =>
    userSkills.some((u) => u.toLowerCase() === r.toLowerCase()),
  );
  return Math.round((matched.length / required.length) * 100);
}

/** Get gap skills */
function gapSkills(userSkills: string[], careerId: string): string[] {
  const required = CAREER_SKILLS[careerId] ?? [];
  return required.filter(
    (r) => !userSkills.some((u) => u.toLowerCase() === r.toLowerCase()),
  );
}

/** Work preference alignment boost */
function preferenceScore(careerId: string, prefs: OnboardingState['profile']['workPreferences']): number {
  let boost = 0;
  
  const designRoles = ['ux-designer', 'product-designer', 'graphic-designer', 'motion-designer', 'fashion-designer', 'interior-designer', 'architecture'];
  const dataRoles = ['data-scientist', 'ai-engineer', 'data-analyst', 'cybersecurity', 'financial-analyst', 'cloud-architect'];
  const peopleRoles = ['product-manager', 'marketing-manager', 'hr', 'general-physician', 'psychiatrist', 'surgeon', 'corporate-lawyer'];
  const techRoles = ['software-dev', 'ai-engineer', 'cybersecurity', 'cloud-architect', 'devops', 'data-scientist', 'robotics'];

  // creativity slider: teamType, workNature, pace, interaction
  if (designRoles.includes(careerId) && prefs.workNature === 'creative') {
    boost += 10;
  } else if (dataRoles.includes(careerId) && prefs.workNature === 'analytical') {
    boost += 10;
  }
  
  if (peopleRoles.includes(careerId) && prefs.interaction === 'people') {
    boost += 10; 
  } else if (techRoles.includes(careerId) && prefs.interaction === 'technical') {
    boost += 10;
  }
  
  if (['investment-banker', 'ai-engineer', 'surgeon', 'startup'].includes(careerId) && prefs.pace === 'fast') {
    boost += 8;
  }

  if (['product-manager', 'devops', 'construction-manager'].includes(careerId) && prefs.teamType === 'team') {
    boost += 8;
  } else if (['data-analyst', 'graphic-designer', 'technical-writer'].includes(careerId) && prefs.teamType === 'solo') {
    boost += 8;
  }

  return Math.max(-10, Math.min(15, Math.round(boost)));
}

/** Final confidence score — blend of skill match + personality + work preferences */
function confidenceScore(
  sm: number,
  ps: number,
  prefBoost: number,
): number {
  const blended = sm * 0.45 + ps * 0.45 + 10 + prefBoost;
  return Math.min(Math.max(Math.round(blended), 0), 100);
}

// ── Main analysis function ────────────────────────────────────────────────────

export function analyse(state: OnboardingState): AnalysisResult {
  const selectedOptions = state.selectedCareerIds
    .map((id) => CAREER_OPTIONS.find((c) => c.id === id))
    .filter(Boolean) as CareerOption[];

  // Static mock for automation risk
  const AUTOMATION_RISK: Record<string, number> = {
    'software-dev': 35, 'data-scientist': 25, 'ai-engineer': 15, 'cybersecurity': 10,
    'cloud-architect': 12, 'devops': 20, 'product-manager': 18, 'ux-designer': 30,
    'product-designer': 28, 'graphic-designer': 55, 'financial-analyst': 45,
    'investment-banker': 38, 'marketing-manager': 40, 'brand-strategist': 35,
    'corporate-lawyer': 22, 'strategy-consultant': 20, 'data-analyst': 50,
    'general-physician': 5, 'surgeon': 2,
  };

  const careers: CareerAnalysis[] = selectedOptions.map((c) => {
    const sm = skillMatch(state.profile.currentSkills, c.id);
    const ps = personalityScore(c.id, state.profile);
    const prefBoost = preferenceScore(c.id, state.profile.workPreferences);
    const cs = confidenceScore(sm, ps, prefBoost);
    const gaps = gapSkills(state.profile.currentSkills, c.id);
    const risk = AUTOMATION_RISK[c.id] ?? 40;

    const insights: string[] = [];
    if (sm >= 70) insights.push(`Strong skill overlap with ${c.title} requirements.`);
    else if (sm >= 40) insights.push(`Moderate skill match — targeting a few key gaps will boost your fit significantly.`);
    else insights.push(`Low current skill match — but your profile shows potential for rapid upskilling.`);

    if (ps >= 70) insights.push(`Your personality traits align naturally with this career.`);
    else if (ps >= 50) insights.push(`Moderate personality alignment — you can succeed with deliberate skill-building.`);
    else insights.push(`This role would push you outside your comfort zone — high growth potential.`);

    if (prefBoost > 5) insights.push(`Your work style preferences naturally align with the daily reality of this career.`);
    else if (prefBoost < -5) insights.push(`Your ideal work environment differs somewhat from the typical day-to-day of this role.`);

    return { career: c, confidenceScore: cs, skillMatchScore: sm, personalityScore: ps, automationRisk: risk, gapSkills: gaps, insights };
  });

  // Sort descending by confidence
  careers.sort((a, b) => b.confidenceScore - a.confidenceScore);

  const winner = careers.length > 0 ? careers[0].career : null;
  const roadmapCareer = winner;

  // Generate personalised insight paragraph
  const traitDesc = (() => {
    const p = state.profile;
    const dominant =
      p.analytical >= 70 ? 'strong analytical thinking'
      : p.leadership >= 70 ? 'strong leadership potential'
      : p.communication >= 70 ? 'excellent communication skills'
      : p.management >= 70 ? 'solid management ability'
      : 'a balanced skill set';
    return dominant;
  })();

  const insightText =
    winner
      ? `You demonstrate ${traitDesc} and a unique set of work preferences. ` +
        `Our analysis suggests ${winner.title} as your strongest fit with a ${careers[0].confidenceScore}% confidence score. ` +
        (careers[1]
          ? `${careers[1].career.title} is also a solid alternative at ${careers[1].confidenceScore}%.`
          : '')
      : 'Complete all steps to receive your personalised career insight.';

  const recommendation =
    winner
      ? `Based on your skill profile, personality traits, and work style preferences, ` +
        `we recommend focusing on **${winner.title}**. ` +
        (careers[0].gapSkills.length > 0
          ? `Key skills to develop: ${careers[0].gapSkills.slice(0, 3).join(', ')}.`
          : `You already have a strong foundation — focus on specialisation and portfolio projects.`)
      : '';

  return { careers, winner, insightText, recommendation, roadmapCareer };
}

// ── Roadmap generation ────────────────────────────────────────────────────────

export interface RoadmapSkill {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  timeEstimate: string;
}

export interface RoadmapResource {
  title: string;
  platform: string;
  isFree: boolean;
  url: string;
}

export interface RoadmapPhase {
  phase: string;
  emoji: string;
  duration: string;
  skills: RoadmapSkill[];
  actions: string[];
  resources: RoadmapResource[];
  milestone: string;
}

export interface DetailedRoadmap {
  whyThisCareer: string[];
  weakAreas: string[];
  switchDifficulty: 'Easy' | 'Medium' | 'Hard';
  phases: RoadmapPhase[];
}

export function generateDetailedRoadmap(
  career: CareerOption,
  analysis: CareerAnalysis,
  state: OnboardingState
): DetailedRoadmap {
  
  // 1. Intelligence Integration Rules
  const highAutomationRisk = analysis.automationRisk > 30;
  const isHighDemand = career.demand === 'High';
  
  // 2. Additional output sections
  const whyThisCareer: string[] = [];
  if (analysis.skillMatchScore >= 70) whyThisCareer.push(`Strong overlap with your existing toolkit (${analysis.skillMatchScore}% skill match)`);
  if (isHighDemand) whyThisCareer.push(`Accelerated hiring market with excellent salary ceiling`);
  if (!highAutomationRisk) whyThisCareer.push(`Highly future-proof (${analysis.automationRisk}% automation risk)`);
  if (state.profile.workPreferences.workNature === 'creative' && ['ux-designer', 'product-designer', 'graphic-designer'].includes(career.id)) {
    whyThisCareer.push('Directly feeds your need for creative end-to-end design ownership');
  } else if (state.profile.workPreferences.workNature === 'analytical') {
    whyThisCareer.push('Leverages your natural preference for analytical, logic-driven systems');
  } else {
    whyThisCareer.push('Provides a balanced approach to logic and creative problem solving');
  }

  const weakAreas: string[] = analysis.gapSkills.slice(0, 3).map(skill => `Lack of production-level experience with ${skill}`);
  if (state.profile.workPreferences.interaction === 'people' && ['software-dev', 'data-scientist', 'devops', 'cloud-architect'].includes(career.id)) {
    weakAreas.push('Requires adapting to long periods of technical solo execution');
  } else if (state.profile.workPreferences.interaction === 'technical' && ['product-manager', 'marketing-manager', 'hr'].includes(career.id)) {
    weakAreas.push('Requires adapting to heavy cross-functional people collaboration');
  }

  let switchDifficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  if (analysis.skillMatchScore >= 80) switchDifficulty = 'Easy';
  else if (analysis.skillMatchScore < 40) switchDifficulty = 'Hard';

  // 3. Define Phase Content Libraries based on Career
  // In a full production app, this would be fetched from a database. For MVP, we provide highly specific maps.
  const careerDataMap: Record<string, {
    s1: RoadmapSkill[], a1: string[], r1: RoadmapResource[], m1: string,
    s2: RoadmapSkill[], a2: string[], r2: RoadmapResource[], m2: string,
    s3: RoadmapSkill[], a3: string[], r3: RoadmapResource[], m3: string
  }> = {
    'software-dev': {
      s1: [
        { name: 'JavaScript (ES6+, DOM binding)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'HTML5/CSS3 (Flexbox/Grid layout)', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Git & Command Line Workflow', priority: 'Medium', timeEstimate: '1 week' }
      ],
      a1: ['Build a responsive personal portfolio website', 'Create a dynamic To-Do App interacting with localStorage', 'Push all code to GitHub with proper commit hygiene'],
      r1: [{ title: 'JavaScript Full Course', platform: 'freeCodeCamp (YouTube)', isFree: true, url: 'https://youtube.com' }, { title: 'Modern HTML/CSS Bootcamp', platform: 'Udemy', isFree: false, url: 'https://udemy.com' }],
      m1: 'Deploy your first interactive website using Vercel or Netlify',
      s2: [
        { name: 'React (Hooks, Context, Router)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'State Management (Redux or Zustand)', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Tailwind CSS utility framework', priority: 'Low', timeEstimate: '1 week' }
      ],
      a2: ['Build a Movie Database Web App connecting to TMDB API', 'Clone a social media feed dashboard (UI only)'],
      r2: [{ title: 'React for Beginners', platform: 'Epic React', isFree: false, url: 'https://epicreact.dev' }],
      m2: 'Successfully fetch remote API data and render complex UI state',
      s3: [
        { name: 'Next.js & Server-Side Rendering', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Full-stack Auth Integration (OAuth)', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Data Structures for Interviews', priority: 'Low', timeEstimate: 'Ongoing' }
      ],
      a3: ['Launch a SaaS MVP with user authenticated dashboards', 'Complete 30 Easy/Medium LeetCode algorithmic problems'],
      r3: [{ title: 'Next.js Official Documentation', platform: 'Next.js', isFree: true, url: 'https://nextjs.org' }],
      m3: 'Pass technical interview mocks and deploy a full-stack SaaS'
    },
    'data-scientist': {
      s1: [
        { name: 'Python (NumPy, Pandas processing block)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Statistics & probability distributions', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'SQL for raw data extraction', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Write Python scripts to parse massive uncleaned CSV datasets', 'Solve 5 complex LeetCode SQL challenges', 'Calculate probability stats on a public dataset'],
      r1: [{ title: 'Introduction to Data Science in Python', platform: 'Coursera', isFree: true, url: 'https://coursera.org' }, { title: 'SQL Murder Mystery', platform: 'KnightLab', isFree: true, url: 'https://mystery.knightlab.com' }],
      m1: 'Successfully clean, validate, and query a 1,000,000+ row dataset',
      s2: [
        { name: 'Exploratory Data Analysis (EDA)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Data Visualization (Matplotlib/Seaborn)', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Scikit-learn algorithms baseline', priority: 'Low', timeEstimate: '3 weeks' }
      ],
      a2: ['Perform EDA on housing market data and publish findings', 'Build a predictive linear regression model', 'Visualise core distribution densities'],
      r2: [{ title: 'Kaggle Micro-courses', platform: 'Kaggle', isFree: true, url: 'https://kaggle.com/learn' }],
      m2: 'Publish a highly-rated notebook establishing predictive baselines on Kaggle',
      s3: [
        { name: 'Deep Learning fundamentals (PyTorch)', priority: 'Medium', timeEstimate: '4 weeks' },
        { name: 'Feature Engineering pipelines', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Model Deployment via FastAPI', priority: 'Low', timeEstimate: '2 weeks' }
      ],
      a3: ['Train a neural network image classifier', 'Deploy a model inference API endpoint in Docker'],
      r3: [{ title: 'Practical Deep Learning for Coders', platform: 'Fast.ai', isFree: true, url: 'https://course.fast.ai' }],
      m3: 'Deploy a live Machine Learning inference API that accepts JSON'
    },
    'ai-engineer': {
      s1: [
        { name: 'Python (async, type hints, dataclasses)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Linear Algebra & Calculus for ML', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Probability Theory & Bayesian Thinking', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Implement a from-scratch neural network in pure NumPy', 'Solve 10 Kaggle classification challenges', 'Read & summarize 3 foundational ML papers (Attention Is All You Need, ResNet, BERT)'],
      r1: [{ title: 'fast.ai Practical Deep Learning', platform: 'Fast.ai', isFree: true, url: 'https://course.fast.ai' }, { title: 'Deep Learning Specialization', platform: 'Coursera (deeplearning.ai)', isFree: false, url: 'https://coursera.org' }],
      m1: 'Train and evaluate a multi-class image classifier from scratch',
      s2: [
        { name: 'PyTorch (nn.Module, optimizers, custom datasets)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Transformer Architecture & Attention Mechanisms', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Hugging Face Transformers library', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Fine-tune a BERT model for sentiment classification on custom dataset', 'Build a text-to-image diffusion demo using Stable Diffusion API', 'Reproduce a research paper methodology end-to-end'],
      r2: [{ title: 'Hugging Face NLP Course', platform: 'Hugging Face', isFree: true, url: 'https://huggingface.co/learn' }],
      m2: 'Fine-tune and deploy a specialized LLM for a real-world task',
      s3: [
        { name: 'MLOps & Model Versioning (MLflow/DVC)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'LLM Evaluation & RLHF techniques', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Distributed Training (Ray, DeepSpeed)', priority: 'Medium', timeEstimate: '3 weeks' }
      ],
      a3: ['Build a production RAG pipeline with LangChain + vector DB', 'Implement a continuous training pipeline with automated evaluation metrics'],
      r3: [{ title: 'Full Stack LLM Bootcamp', platform: 'FSDL', isFree: true, url: 'https://fullstackdeeplearning.com' }],
      m3: 'Deploy a production-grade AI system handling real user traffic'
    },
    'cybersecurity': {
      s1: [
        { name: 'Networking Fundamentals (TCP/IP, DNS, HTTP)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Linux System Administration & Bash', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Python Scripting for Automation', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Set up a home lab with VirtualBox running Kali Linux and a vulnerable VM', 'Complete TryHackMe "Pre-Security" learning path', 'Write a port scanner in Python using socket library'],
      r1: [{ title: 'TryHackMe', platform: 'TryHackMe', isFree: true, url: 'https://tryhackme.com' }, { title: 'CompTIA Security+ Study Guide', platform: 'CompTIA', isFree: false, url: 'https://comptia.org' }],
      m1: 'Pass CompTIA Security+ certification exam',
      s2: [
        { name: 'Web Application Penetration Testing (OWASP Top 10)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'SIEM Tools (Splunk, ELK Stack)', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Network Traffic Analysis (Wireshark)', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Complete PortSwigger Web Security Academy labs (XSS, SQLi, IDOR)', 'Set up a Splunk instance and create custom dashboards for log analysis', 'Participate in a CTF (Capture The Flag) competition'],
      r2: [{ title: 'Web Security Academy', platform: 'PortSwigger', isFree: true, url: 'https://portswigger.net/web-security' }],
      m2: 'Discover and responsibly disclose a bug on a bug bounty platform',
      s3: [
        { name: 'Cloud Security Architecture (AWS/Azure)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Incident Response & Digital Forensics', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Zero Trust Architecture Design', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Design a threat model for a fictional SaaS product', 'Build an automated vulnerability scanner script & document findings'],
      r3: [{ title: 'SANS Cyber Aces', platform: 'SANS Institute', isFree: true, url: 'https://cyberaces.org' }],
      m3: 'Earn CEH or OSCP certification and land first bug bounty payout'
    },
    'devops': {
      s1: [
        { name: 'Linux Administration & Shell Scripting', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Git Advanced Workflows (branching, rebasing)', priority: 'High', timeEstimate: '1 week' },
        { name: 'Docker Containerization', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a1: ['Containerize a Node.js app with Docker Compose (app + DB + reverse proxy)', 'Automate server setup with a Bash provisioning script', 'Set up a Git monorepo with branch protection rules'],
      r1: [{ title: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', isFree: false, url: 'https://udemy.com' }, { title: 'The Linux Command Line (Book)', platform: 'No Starch Press', isFree: false, url: 'https://linuxcommand.org/tlcl.php' }],
      m1: 'Deploy a multi-container application to a cloud VM via Docker Compose',
      s2: [
        { name: 'CI/CD with GitHub Actions', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Kubernetes (Pods, Services, Deployments, Helm)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Infrastructure as Code (Terraform)', priority: 'Medium', timeEstimate: '3 weeks' }
      ],
      a2: ['Build a full CI/CD pipeline deploying to AWS ECS on every PR merge', 'Deploy a microservices app on a local Minikube cluster using Helm charts', 'Provision a 3-tier AWS infrastructure with Terraform'],
      r2: [{ title: 'KodeKloud DevOps Labs', platform: 'KodeKloud', isFree: false, url: 'https://kodekloud.com' }],
      m2: 'Achieve zero-downtime rolling deployments on a Kubernetes cluster',
      s3: [
        { name: 'Monitoring & Observability (Prometheus + Grafana)', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Cloud Certifications (AWS DevOps Professional)', priority: 'High', timeEstimate: '6 weeks' },
        { name: 'GitOps Methodology (ArgoCD, Flux)', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Build a complete observability stack with alerting for SLO violations', 'Implement GitOps workflow where git pushes auto-sync cluster state'],
      r3: [{ title: 'AWS DevOps Professional Exam Prep', platform: 'A Cloud Guru', isFree: false, url: 'https://acloudguru.com' }],
      m3: 'Earn AWS DevOps Professional certification and reduce deployment time by 80%'
    },
    'cloud-architect': {
      s1: [
        { name: 'Cloud Fundamentals (compute, storage, networking)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Networking (VPC, subnets, routing, NAT gateways)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Linux & CLI fluency', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Build a 3-tier web architecture on AWS (EC2, RDS, S3)', 'Set up a VPC with public/private subnets and NAT gateway', 'Pass AWS Cloud Practitioner exam'],
      r1: [{ title: 'AWS Skill Builder', platform: 'AWS', isFree: true, url: 'https://skillbuilder.aws' }, { title: 'A Cloud Guru', platform: 'A Cloud Guru', isFree: false, url: 'https://acloudguru.com' }],
      m1: 'Earn AWS Cloud Practitioner certification',
      s2: [
        { name: 'High Availability & Disaster Recovery design', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Serverless Architecture (Lambda, API Gateway)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Cost Optimization & FinOps principles', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Design a multi-AZ, auto-scaling web app architecture', 'Build a serverless API with Lambda, API Gateway, and DynamoDB', 'Run a cost analysis on an existing architecture and reduce spend by 30%'],
      r2: [{ title: 'AWS Solutions Architect Associate Course', platform: 'Udemy (Stephane Maarek)', isFree: false, url: 'https://udemy.com' }],
      m2: 'Earn AWS Solutions Architect Associate certification',
      s3: [
        { name: 'Multi-cloud Strategy & Migration Planning', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Kubernetes & EKS at scale', priority: 'Medium', timeEstimate: '3 weeks' },
        { name: 'Security Architecture & IAM Advanced', priority: 'High', timeEstimate: '3 weeks' }
      ],
      a3: ['Architect a complete cloud migration plan for a fictional on-premise company', 'Design a zero-trust security model for a multi-team cloud org'],
      r3: [{ title: 'AWS Solutions Architect Professional', platform: 'AWS', isFree: false, url: 'https://aws.amazon.com/certification' }],
      m3: 'Earn AWS Solutions Architect Professional certification'
    },
    'ux-designer': {
      s1: [
        { name: 'Design Thinking & User Research Methods', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Figma (components, auto-layout, prototyping)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Information Architecture & Wireframing', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Conduct 5 user interviews and synthesize findings into an affinity map', 'Redesign a broken UI from a popular app with documented reasoning', 'Build a functional Figma prototype with interactions and transitions'],
      r1: [{ title: 'Google UX Design Certificate', platform: 'Coursera', isFree: false, url: 'https://grow.google/certificates/ux-design' }, { title: 'Figma for Beginners', platform: 'YouTube (DesignCourse)', isFree: true, url: 'https://youtube.com' }],
      m1: 'Complete a full design case study: research → wireframe → prototype',
      s2: [
        { name: 'Usability Testing & Heuristic Evaluation', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Design Systems & Component Libraries', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Accessibility (WCAG 2.1 AA standards)', priority: 'Medium', timeEstimate: '1 week' }
      ],
      a2: ['Run 5 usability testing sessions and document insights with severity ratings', 'Build a personal design system with 40+ reusable components in Figma', 'Audit an existing product for WCAG AA accessibility violations'],
      r2: [{ title: 'Nielsen Norman Group UX Research', platform: 'NN/g', isFree: false, url: 'https://nngroup.com' }],
      m2: 'Publish 3 polished UX case studies on Behance or personal portfolio',
      s3: [
        { name: 'Interaction Design & Micro-animations', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Basic HTML/CSS for design-to-dev handoff', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'UX Metrics & Analytics (Mixpanel, FullStory)', priority: 'Low', timeEstimate: '2 weeks' }
      ],
      a3: ['Design a complete mobile app from discovery to handoff documentation', 'Work with a developer to ship a real feature using your designs'],
      r3: [{ title: 'Refactoring UI (Book)', platform: 'Tailwind Labs', isFree: false, url: 'https://refactoringui.com' }],
      m3: 'Land first UX role through portfolio and networking'
    },
    'financial-analyst': {
      s1: [
        { name: 'Financial Statements Analysis (P&L, Balance Sheet, Cash Flow)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Excel Financial Modelling (VLOOKUP, PivotTables, DCF)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Accounting Fundamentals (GAAP/IFRS)', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Build a 3-statement financial model from scratch in Excel', 'Analyze annual reports of 3 publicly listed companies', 'Complete the Excel Skills for Business Specialization on Coursera'],
      r1: [{ title: 'Excel Skills for Business', platform: 'Coursera', isFree: false, url: 'https://coursera.org' }, { title: 'Investopedia Financial Analyst Guide', platform: 'Investopedia', isFree: true, url: 'https://investopedia.com' }],
      m1: 'Build a full 3-statement model with revenue projections for a real company',
      s2: [
        { name: 'Valuation (DCF, Comparable Company, Precedent Transactions)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Bloomberg Terminal & Capital IQ', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'SQL for financial data querying', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Value Tesla using DCF and write a 2-page investment thesis', 'Build a competitor analysis dashboard in Excel / Power BI', 'Complete Wall Street Prep Financial Modeling course'],
      r2: [{ title: 'Breaking Into Wall Street', platform: 'BIWS', isFree: false, url: 'https://breakingintowallstreet.com' }],
      m2: 'Complete CFA Level 1 exam',
      s3: [
        { name: 'Python for Finance (yfinance, pandas, quantstats)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Portfolio Management & Risk Analysis', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Equity Research Report Writing', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Write a full equity research report on a small-cap stock', 'Build a Python portfolio backtesting engine'],
      r3: [{ title: 'CFA Curriculum', platform: 'CFA Institute', isFree: false, url: 'https://cfainstitute.org' }],
      m3: 'Pass CFA Level 1 and complete 3 published investment analyses'
    },
    'investment-banker': {
      s1: [
        { name: 'Accounting & Financial Statement Analysis', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Excel Modelling (LBO, M&A, DCF basics)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Corporate Finance Theory (WACC, capital structure)', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a1: ['Build an LBO model from scratch using a leveraged buyout template', 'Read and analyze 5 IB pitch decks from public filings', 'Complete Investment Banking University free course'],
      r1: [{ title: 'Investment Banking University', platform: 'IBU', isFree: true, url: 'https://investmentbankinguniversity.com' }, { title: 'Wall Street Prep Premium', platform: 'WSP', isFree: false, url: 'https://wallstreetprep.com' }],
      m1: 'Complete a full LBO model and present investment thesis in writing',
      s2: [
        { name: 'M&A Deal Structuring & Due Diligence', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Capital Markets & IPO Process', priority: 'Medium', timeEstimate: '3 weeks' },
        { name: 'Pitch Deck Construction & Storytelling', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a2: ['Create a mock M&A pitch for two real companies', 'Write an IPO valuation memo for a private company', 'Practice 50 technical interview questions (accounting, valuation, LBO)'],
      r2: [{ title: 'Breaking Into Wall Street', platform: 'BIWS', isFree: false, url: 'https://breakingintowallstreet.com' }],
      m2: 'Secure investment banking internship or analyst program offer',
      s3: [
        { name: 'Client Management & Deal Execution', priority: 'High', timeEstimate: 'Ongoing' },
        { name: 'Bloomberg Terminal Mastery', priority: 'Medium', timeEstimate: '3 weeks' },
        { name: 'Regulatory Knowledge (SEC filings, FINRA)', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Shadow a deal cycle from pitch to close (internship)', 'Earn Series 63/65 or CFA Level 1 credential'],
      r3: [{ title: 'CFA Institute Study Materials', platform: 'CFA Institute', isFree: false, url: 'https://cfainstitute.org' }],
      m3: 'Close first deal as analyst and earn CFA Level 1 designation'
    },
    'marketing-manager': {
      s1: [
        { name: 'Marketing Fundamentals (4Ps, STP, brand positioning)', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Google Analytics 4 & Data Interpretation', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Social Media Strategy & Content Planning', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Set up a GA4 property and build a monthly performance dashboard', 'Run a 30-day organic social media experiment and document results', 'Analyze a competitor brand using SEMrush free tier'],
      r1: [{ title: 'Google Digital Garage', platform: 'Google', isFree: true, url: 'https://learndigital.withgoogle.com' }, { title: 'HubSpot Marketing Certification', platform: 'HubSpot Academy', isFree: true, url: 'https://academy.hubspot.com' }],
      m1: 'Earn Google Analytics and HubSpot Inbound Marketing certifications',
      s2: [
        { name: 'Paid Advertising (Google Ads, Meta Ads)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Email Marketing Automation (Klaviyo/Mailchimp)', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'SEO Content Strategy & Keyword Research', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a2: ['Run a $200 Google Ads campaign and document ROAS learnings', 'Build a 5-email drip sequence generating 25%+ open rates', 'Rank a blog article on page 1 of Google for a long-tail keyword'],
      r2: [{ title: 'Ahrefs Academy SEO Course', platform: 'Ahrefs', isFree: true, url: 'https://ahrefs.com/academy' }],
      m2: 'Generate measurable ROI from a multi-channel campaign with documented results',
      s3: [
        { name: 'Brand Strategy & Positioning Frameworks', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Marketing Budget Management & P&L', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'CRM & Customer Lifecycle Management', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Develop a 90-day go-to-market plan for a product launch', 'Present a brand repositioning strategy with competitive analysis'],
      r3: [{ title: 'Marketing Week', platform: 'Marketing Week', isFree: false, url: 'https://marketingweek.com' }],
      m3: 'Lead a full product launch campaign generating 1000+ qualified leads'
    },
    'corporate-lawyer': {
      s1: [
        { name: 'Contract Law Fundamentals & Drafting', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Corporate Governance & Company Law', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Legal Research Methods & Case Analysis', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a1: ['Draft 3 different types of commercial contracts from scratch', 'Analyze 5 Supreme Court cases in corporate law with written summaries', 'Complete a free corporate law course on Coursera or edX'],
      r1: [{ title: 'Introduction to Corporate Finance & Law', platform: 'Coursera', isFree: true, url: 'https://coursera.org' }, { title: 'LexisNexis Practice Guides', platform: 'LexisNexis', isFree: false, url: 'https://lexisnexis.com' }],
      m1: 'Write a comprehensive legal memo on a corporate governance issue',
      s2: [
        { name: 'M&A Due Diligence & Transaction Documentation', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Securities Law & Regulatory Compliance', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Negotiation & Stakeholder Communication', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Prepare a mock due diligence checklist for an M&A transaction', 'Draft a term sheet and SPA (Share Purchase Agreement)', 'Participate in a moot court or negotiation simulation'],
      r2: [{ title: 'Harvard Negotiation Project', platform: 'Harvard Law', isFree: false, url: 'https://www.pon.harvard.edu' }],
      m2: 'Complete law school clerkship or complete bar examinations',
      s3: [
        { name: 'Cross-border Transactions & International Law', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Litigation Strategy & Dispute Resolution', priority: 'Medium', timeEstimate: '3 weeks' },
        { name: 'Legal Tech Tools & AI in Law', priority: 'Low', timeEstimate: '2 weeks' }
      ],
      a3: ['Work on a pro bono case to build courtroom/negotiation experience', 'Publish a legal analysis article in a law review or LinkedIn'],
      r3: [{ title: 'Chambers Student Guide', platform: 'Chambers', isFree: true, url: 'https://chambers.com' }],
      m3: 'Secure training contract or associate position at a law firm'
    },
    'general-physician': {
      s1: [
        { name: 'Clinical Examination Techniques (history-taking, physical exam)', priority: 'High', timeEstimate: 'Ongoing' },
        { name: 'Pharmacology Essentials (drug classes, interactions)', priority: 'High', timeEstimate: '6 weeks' },
        { name: 'Medical Ethics & Patient Communication', priority: 'High', timeEstimate: '2 weeks' }
      ],
      a1: ['Shadow consultations in different specialty departments for 2 weeks', 'Complete 500+ USMLE Step 1 practice questions with review', 'Write structured case presentations for 10 clinical cases'],
      r1: [{ title: 'Amboss Medical Knowledge Platform', platform: 'Amboss', isFree: false, url: 'https://amboss.com' }, { title: 'UpToDate Clinical Resource', platform: 'UpToDate', isFree: false, url: 'https://uptodate.com' }],
      m1: 'Pass MBBS final professional examinations',
      s2: [
        { name: 'Emergency Medicine Protocols (ACLS, BLS)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Diagnostic Reasoning & Differential Diagnosis', priority: 'High', timeEstimate: 'Ongoing' },
        { name: 'Chronic Disease Management (diabetes, hypertension)', priority: 'High', timeEstimate: '4 weeks' }
      ],
      a2: ['Complete ACLS and BLS certification courses', 'Manage 50 outpatient consultations independently under supervision', 'Present at a department grand rounds on a clinical topic'],
      r2: [{ title: 'Step Up to Medicine', platform: 'Wolters Kluwer', isFree: false, url: 'https://lww.com' }],
      m2: 'Complete internship and register with state medical council',
      s3: [
        { name: 'Research Methodology & Evidence-Based Medicine', priority: 'Medium', timeEstimate: '4 weeks' },
        { name: 'Specialty Selection & PG Entrance Prep (NEET-PG)', priority: 'High', timeEstimate: 'Ongoing' },
        { name: 'Digital Health & Telemedicine Workflows', priority: 'Low', timeEstimate: '2 weeks' }
      ],
      a3: ['Publish a case report or clinical audit in a peer-reviewed journal', 'Complete NEET-PG coaching and mock exams'],
      r3: [{ title: 'NEET-PG PrepLadder', platform: 'PrepLadder', isFree: false, url: 'https://prepladder.com' }],
      m3: 'Clear NEET-PG and secure PG residency seat in preferred specialty'
    },
    'data-analyst': {
      s1: [
        { name: 'SQL (JOINs, window functions, CTEs)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Excel Advanced (PivotTables, VLOOKUP, Power Query)', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Statistics (descriptive stats, hypothesis testing)', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Solve 50 SQL challenges on LeetCode/HackerRank', 'Build an Excel sales dashboard from raw transactional data', 'Complete a statistics course with hands-on exercises'],
      r1: [{ title: 'Mode Analytics SQL Tutorial', platform: 'Mode', isFree: true, url: 'https://mode.com/sql-tutorial' }, { title: 'Statistics for Data Science', platform: 'Coursera', isFree: false, url: 'https://coursera.org' }],
      m1: 'Build and present a full data dashboard from raw SQL queries',
      s2: [
        { name: 'Python (pandas, matplotlib, seaborn)', priority: 'High', timeEstimate: '4 weeks' },
        { name: 'Power BI or Tableau (interactive dashboards)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Data Cleaning & Transformation pipelines', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a2: ['Analyze a real-world public dataset (NYC Taxi, Airbnb) end-to-end in Python', 'Build an interactive Tableau/Power BI dashboard shared publicly', 'Automate a weekly reporting process with Python + email'],
      r2: [{ title: 'Tableau Desktop Specialist', platform: 'Tableau', isFree: false, url: 'https://tableau.com/learn/training' }],
      m2: 'Earn Power BI or Tableau certification and publish 2 public dashboards',
      s3: [
        { name: 'dbt & Data Warehousing (BigQuery/Snowflake)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'A/B Testing & Experimentation Design', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Business Storytelling & Stakeholder Reporting', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a3: ['Build a complete dbt data model in BigQuery with tests and documentation', 'Design and analyze an A/B test for a product feature'],
      r3: [{ title: 'dbt Learn', platform: 'dbt Labs', isFree: true, url: 'https://courses.getdbt.com' }],
      m3: 'Land data analyst role or internal promotion with demonstrated SQL/Python/BI portfolio'
    },
    'strategy-consultant': {
      s1: [
        { name: 'Structured Problem Solving (MECE, issue trees)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Business Case Analysis (profitability, market entry)', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Excel Modelling for Business Scenarios', priority: 'Medium', timeEstimate: '2 weeks' }
      ],
      a1: ['Solve 20 McKinsey/BCG case interviews with peer practice', 'Read and summarize 3 HBR business strategy articles per week', 'Complete a case study competition at university or online'],
      r1: [{ title: 'Case in Point (Book)', platform: 'Marc Cosentino', isFree: false, url: 'https://amazon.com' }, { title: 'PrepLounge Case Practice', platform: 'PrepLounge', isFree: false, url: 'https://preplounge.com' }],
      m1: 'Pass 5 case interviews with McKinsey/BCG-style feedback',
      s2: [
        { name: 'Industry Analysis & Competitive Intelligence', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Executive-level Presentation & Storytelling', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Financial Modelling in Strategy Context', priority: 'Medium', timeEstimate: '3 weeks' }
      ],
      a2: ['Build a 20-slide strategy deck on a real industry disruption', 'Write an industry analysis report for a sector you find interesting', 'Complete a virtual consulting experience (McKinsey Forward, BCG Open)'],
      r2: [{ title: 'BCG Career Academy', platform: 'BCG', isFree: true, url: 'https://careers.bcg.com' }],
      m2: 'Secure internship at a consulting firm or complete a certified consulting project',
      s3: [
        { name: 'Change Management & Organizational Design', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Digital Transformation & Technology Strategy', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'Client Relationship & Engagement Management', priority: 'Medium', timeEstimate: 'Ongoing' }
      ],
      a3: ['Lead a pro bono consulting project for an NGO or startup', 'Publish a strategy analysis on LinkedIn demonstrating thought leadership'],
      r3: [{ title: 'Harvard Business Review', platform: 'HBR', isFree: false, url: 'https://hbr.org' }],
      m3: 'Land analyst/associate offer at a top consulting firm'
    },
    'product-manager': {
      s1: [
        { name: 'Product Lifecycle management', priority: 'High', timeEstimate: '3 weeks' },
        { name: 'User Empathy & Interview techniques', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Figma wireframing basics', priority: 'Low', timeEstimate: '1 week' }
      ],
      a1: ['Conduct 5 detailed user interviews on a digital pain point', 'Draft a 2-page PRD (Product Requirements Document)', 'Wireframe a solution using low-fidelity Figma shapes'],
      r1: [{ title: 'Inspired: How to Create Tech Products', platform: 'Book (Marty Cagan)', isFree: false, url: 'https://amazon.com' }, { title: 'Figma for Beginners', platform: 'YouTube', isFree: true, url: 'https://youtube.com' }],
      m1: 'Finalize a comprehensive PRD backed by real user quotes',
      s2: [
        { name: 'Agile & Scrum Methodologies', priority: 'High', timeEstimate: '2 weeks' },
        { name: 'Go-To-Market (GTM) Strategy', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Basic Data Analytics (Mixpanel/SQL)', priority: 'Medium', timeEstimate: '3 weeks' }
      ],
      a2: ['Structure a 2-week backlog sprint using Jira formats', 'Draft a launch strategy for an imaginary competitor product', 'Extract user retention data via basic SQL'],
      r2: [{ title: 'Product School Certifications', platform: 'Product School', isFree: false, url: 'https://productschool.com' }],
      m2: 'Complete a full mock product sprint from GTM to retrospective',
      s3: [
        { name: 'Stakeholder Management & Negotiation', priority: 'High', timeEstimate: 'Ongoing' },
        { name: 'A/B Testing Frameworks', priority: 'Medium', timeEstimate: '2 weeks' },
        { name: 'Pricing Model Strategy', priority: 'Low', timeEstimate: '1 week' }
      ],
      a3: ['Design an A/B test resolving a hypothetical checkout funnel drop-off', 'Deliver a mock leadership presentation defending product decisions'],
      r3: [{ title: 'Lenny\'s Newsletter', platform: 'Substack', isFree: false, url: 'https://lennysnewsletter.com' }],
      m3: 'Present a complete Product Strategy deck for interview readiness'
    }
  };

  // Default fallback layout for any unmapped career
  const defaultData = {
    s1: analysis.gapSkills.slice(0, 3).map(skill => ({ name: skill, priority: 'High' as const, timeEstimate: '3 weeks' })),
    a1: ['Conduct fundamental research onto 3 industry leaders', 'Build a conceptual mini-project mapping to local needs'],
    r1: [{ title: `Fundamentals of ${career.title}`, platform: 'Coursera', isFree: true, url: 'https://coursera.org' }],
    m1: `Understand the strict baseline deliverables for ${career.title}`,
    s2: analysis.gapSkills.slice(3, 5).map(skill => ({ name: skill, priority: 'Medium' as const, timeEstimate: '4 weeks' })),
    a2: ['Execute a mid-complexity portfolio piece replicating real-world scenarios'],
    r2: [{ title: `Advanced techniques in ${career.title}`, platform: 'Udemy', isFree: false, url: 'https://udemy.com' }],
    m2: 'Produce an intermediate portfolio piece indicating progression',
    s3: [{ name: 'Interview formatting & whiteboarding', priority: 'Medium' as const, timeEstimate: '2 weeks' }, { name: 'Specialty niche operations', priority: 'Low' as const, timeEstimate: '4 weeks' }],
    a3: ['Finalize portfolio website showcasing two complex case studies', 'Format resume specific to industry keywords'],
    r3: [{ title: 'Tech Interview Pro', platform: 'YouTube', isFree: true, url: 'https://youtube.com' }],
    m3: 'Achieve interview-readiness and launch application cycle'
  };

  const data = careerDataMap[career.id] ?? defaultData;

  // Intelligence injection: Future-proof skills if automation risk is high
  if (highAutomationRisk) {
    data.s2.push({ name: 'AI Tool Prompting & Workflow Automation', priority: 'High', timeEstimate: '1 week' });
    data.s3.push({ name: 'Cross-functional Strategy & Abstract Leadership', priority: 'Medium', timeEstimate: '2 weeks' });
  }

  // Intelligence injection: If skill match is extremely high, compress early phases
  if (switchDifficulty === 'Easy') {
    data.a1.push('Skip basic introductions and immediately build a complex architectural system');
    data.s1.forEach(s => s.timeEstimate = '1 week'); 
  }

  return {
    whyThisCareer,
    weakAreas,
    switchDifficulty,
    phases: [
      {
        phase: 'Foundation',
        emoji: '🌱',
        duration: 'Month 1–3',
        skills: data.s1.length > 0 ? data.s1 : [{ name: 'Industry Basics', priority: 'High', timeEstimate: '1 week' }],
        actions: data.a1,
        resources: data.r1,
        milestone: data.m1
      },
      {
        phase: 'Building',
        emoji: '🏗️',
        duration: 'Month 3–6',
        skills: data.s2.length > 0 ? data.s2 : [{ name: 'Intermediate concepts', priority: 'High', timeEstimate: '2 weeks' }],
        actions: data.a2,
        resources: data.r2,
        milestone: data.m2
      },
      {
        phase: 'Advanced',
        emoji: '🚀',
        duration: 'Month 6–12',
        skills: data.s3.length > 0 ? data.s3 : [{ name: 'Production grade deployment', priority: 'High', timeEstimate: '3 weeks' }],
        actions: data.a3,
        resources: data.r3,
        milestone: data.m3
      }
    ]
  };
}
