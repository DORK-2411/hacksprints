'use client';

import { useState } from 'react';

interface SkillInputProps {
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
}

export default function SkillInput({ onSkillsChange, placeholder }: SkillInputProps) {
  const [input, setInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      onSkillsChange(updated);
    }
    setInput('');
  };

  const removeSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    onSkillsChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === 'Backspace' && input === '' && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const suggestedSkills = [
    'Python', 'JavaScript', 'React', 'SQL', 'Machine Learning',
    'AWS', 'Docker', 'Figma', 'Node.js', 'TypeScript',
  ].filter((s) => !skills.includes(s));

  return (
    <div className="space-y-3">
      {/* Chip input field */}
      <div className="flex flex-wrap gap-2 min-h-[52px] items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-violet-500/50 focus-within:bg-violet-500/5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/30 text-sm text-violet-300 font-medium"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="ml-0.5 text-violet-400 hover:text-white transition-colors"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addSkill(input)}
          placeholder={skills.length === 0 ? (placeholder || 'Type a skill and press Enter…') : ''}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-white placeholder-white/30 outline-none"
        />
      </div>

      {/* Suggestions */}
      {suggestedSkills.length > 0 && (
        <div>
          <p className="text-xs text-white/30 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => {
                  const updated = [...skills, s];
                  setSkills(updated);
                  onSkillsChange(updated);
                }}
                className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-xs text-white/50 hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-violet-300 transition-all duration-200"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <p className="text-xs text-white/30">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} added
        </p>
      )}
    </div>
  );
}
