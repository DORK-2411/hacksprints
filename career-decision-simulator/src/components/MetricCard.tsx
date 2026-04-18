import { useState } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  type: 'skills' | 'demand' | 'automation';
}

export default function MetricCard({ title, value, type }: MetricCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine colors and labels based on type and value
  let colorClass = '';
  let borderClass = '';
  let bgClass = '';
  let label = '';
  let displayValue = typeof value === 'number' ? `${value}%` : value;

  if (type === 'skills') {
    const val = value as number;
    if (val >= 70) {
      colorClass = 'text-emerald-400';
      borderClass = 'border-emerald-500/30';
      bgClass = 'bg-emerald-500/10';
      label = 'Strong Fit';
    } else if (val >= 40) {
      colorClass = 'text-amber-400';
      borderClass = 'border-amber-500/30';
      bgClass = 'bg-amber-500/10';
      label = 'Moderate Fit';
    } else {
      colorClass = 'text-red-400';
      borderClass = 'border-red-500/30';
      bgClass = 'bg-red-500/10';
      label = 'Low Fit';
    }
  } else if (type === 'demand') {
    if (value === 'High') {
      colorClass = 'text-blue-400';
      borderClass = 'border-blue-500/30';
      bgClass = 'bg-blue-500/10';
      label = 'High Demand';
    } else if (value === 'Medium') {
      colorClass = 'text-blue-300';
      borderClass = 'border-blue-400/30';
      bgClass = 'bg-blue-400/10';
      label = 'Stable Demand';
    } else {
      colorClass = 'text-white/50';
      borderClass = 'border-white/20';
      bgClass = 'bg-white/5';
      label = 'Low Demand';
    }
    // We don't display a strict % for demand right now, just the label/value
    displayValue = value as string; 
  } else if (type === 'automation') {
    const val = value as number;
    if (val < 30) {
      colorClass = 'text-emerald-400';
      borderClass = 'border-emerald-500/30';
      bgClass = 'bg-emerald-500/10';
      label = 'Low Risk';
    } else if (val <= 60) {
      colorClass = 'text-amber-400';
      borderClass = 'border-amber-500/30';
      bgClass = 'bg-amber-500/10';
      label = 'Moderate Risk';
    } else {
      colorClass = 'text-red-400';
      borderClass = 'border-red-500/30';
      bgClass = 'bg-red-500/10';
      label = 'High Risk';
    }
  }

  return (
    <>
      <div 
        onClick={() => type === 'automation' ? setIsModalOpen(true) : null}
        className={`relative rounded-2xl bg-[#1a1a2e]/80 border border-white/10 p-4 lg:p-5 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300 group cursor-default ${type === 'automation' ? 'cursor-pointer hover:border-white/30' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-semibold text-white/50">{title}</p>
          {type === 'automation' && (
            <button 
              aria-label="More Info" 
              className="text-white/30 group-hover:text-white/70 transition-colors shrink-0 ml-1"
              title="Indicates how likely this career is to be affected by automation based on task repetition, creativity, and human involvement."
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center min-h-[48px] mb-3">
          <p className={`font-black ${colorClass} drop-shadow-[0_0_15px_currentColor] tracking-tight ${type === 'demand' ? 'text-2xl lg:text-3xl' : 'text-3xl lg:text-4xl'} break-words w-full`}>
            {displayValue}
          </p>
        </div>

        <div className={`inline-flex items-center px-2 py-1 rounded-full border text-[11px] font-bold ${borderClass} ${bgClass} ${colorClass} whitespace-nowrap`}>
          {label}
        </div>
      </div>

      {/* NEW: Automation Risk Modal */}
      {isModalOpen && type === 'automation' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-[#0b0b0f] border border-white/10 rounded-2xl shadow-2xl p-6 animate-fade-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2">Automation Risk Score</h2>
            <p className="text-sm text-white/50 mb-6">
              Indicates how likely this career is to be affected by automation and AI advancements over the next decade.
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Factor Breakdown</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-white/70">Task Repetition</span>
                    <span className="text-amber-400 font-medium">Medium</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/70">Creativity Required</span>
                    <span className="text-emerald-400 font-medium">High</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/70">Human Interaction</span>
                    <span className="text-emerald-400 font-medium">High</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/70">Technical Complexity</span>
                    <span className="text-red-400 font-medium">Low</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Future Outlook</h3>
                <p className="text-sm text-white/80">
                  Stable. The core functions of this role require complex human judgement which AI currently struggles to replace.
                </p>
              </div>
              
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Risk Reduction</h3>
                <p className="text-sm text-emerald-300/80">
                  Focus on soft skills (leadership, strategy) and learn to leverage AI tools to increase your productivity rather than competing with them.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
