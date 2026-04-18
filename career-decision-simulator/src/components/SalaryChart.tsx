'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { simulateSalary, Career } from '@/lib/api';

interface SalaryChartProps {
  career1: Career;
  career2?: Career;
  locationMultiplier?: number;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Year {label}</p>
        <div className="space-y-3">
          {payload.map((entry: any) => (
            <div key={entry.name}>
              <p className="text-xs text-white/50 mb-0.5">{entry.name}</p>
              <p className="text-base font-black" style={{ color: entry.stroke }}>
                {formatCurrency(entry.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function SalaryChart({ career1, career2, locationMultiplier = 1 }: SalaryChartProps) {
  const data1 = simulateSalary(career1.avg_salary, career1.growth_rate, 10, locationMultiplier);
  const data2 = career2
    ? simulateSalary(career2.avg_salary, career2.growth_rate, 10, locationMultiplier)
    : null;

  const chartData = data1.map((d, i) => ({
    year: d.year,
    [career1.title]: d.salary,
    ...(data2 ? { [career2!.title]: data2[i].salary } : {}),
  }));

  const formatYAxis = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  const y10_1 = data1[10].salary;
  const y10_2 = data2 ? data2[10].salary : 0;
  
  const hasComparison = !!career2;
  const isC1Winner = y10_1 >= y10_2;
  const winner = hasComparison ? (isC1Winner ? career1 : career2) : career1;
  const loser = hasComparison ? (isC1Winner ? career2 : career1) : null;
  const winnerY10 = Math.max(y10_1, y10_2);
  const loserY10 = hasComparison ? Math.min(y10_1, y10_2) : 0;
  
  const growthDiff = loserY10 > 0 ? ((winnerY10 - loserY10) / loserY10 * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Enhanced Graph UI */}
      <div className="rounded-[1.5rem] border border-white/10 bg-[#12121e]/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00d4ff]/5 to-[#ff4ecd]/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">10-Year Salary Projection</h3>
              <p className="text-sm font-semibold text-white/40 mt-1 uppercase tracking-widest">
                Compound Growth · Location Adjusted
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
              <span className="text-xs font-semibold text-white/80">{career1.title}</span>
            </div>
            {career2 && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4ecd] shadow-[0_0_8px_#ff4ecd]" />
                <span className="text-xs font-semibold text-white/80">{career2.title}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-[350px] mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorC1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="colorC2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff4ecd" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#ff4ecd" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Yr ${v}`}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={15}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey={career1.title}
                stroke="url(#colorC1)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#00d4ff', strokeWidth: 2, stroke: '#1a1a2e' }}
              />
              {career2 && (
                <Line
                  type="monotone"
                  dataKey={career2.title}
                  stroke="url(#colorC2)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ff4ecd', strokeWidth: 2, stroke: '#1a1a2e' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Year 10 Summary Cards */}
      <div className={`grid gap-4 ${career2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="group rounded-[1.5rem] border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#00d4ff]/10 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00d4ff]/0 via-[#00d4ff]/0 to-[#00d4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#00d4ff]/10 flex items-center justify-center border border-[#00d4ff]/30">
              <span className="text-xl">{career1.emoji || '💼'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/50">{career1.title} – Year 10</p>
              <p className="text-3xl font-black text-[#00d4ff] tracking-tight mt-0.5">
                {formatCurrency(y10_1)}
              </p>
            </div>
          </div>
        </div>

        {career2 && (
          <div className="group rounded-[1.5rem] border border-[#ff4ecd]/30 bg-[#ff4ecd]/5 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#ff4ecd]/10 hover:shadow-[0_0_30px_rgba(255,78,205,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff4ecd]/0 via-[#ff4ecd]/0 to-[#ff4ecd]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#ff4ecd]/10 flex items-center justify-center border border-[#ff4ecd]/30">
                <span className="text-xl">{career2.emoji || '💼'}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/50">{career2.title} – Year 10</p>
                <p className="text-3xl font-black text-[#ff4ecd] tracking-tight mt-0.5">
                  {formatCurrency(y10_2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 & 4. Key Insights & Recommendation Grid */}
      <div className="rounded-[1.5rem] border border-white/10 bg-[#12121e]/80 backdrop-blur-xl overflow-hidden mt-6 shadow-2xl">
        <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          {/* Left: Insights */}
          <div className="p-6 md:p-8 md:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-lg font-bold text-white">Key Insights</h3>
                <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mt-0.5">What this means for your career</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {hasComparison && (
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 text-emerald-400">
                    📈
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-1">Higher Growth Potential</h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      <span className="text-white font-semibold">{winner.title}</span> roles show faster salary growth, reaching <span className="text-emerald-400 font-bold">{growthDiff}% higher</span> than {loser!.title} after 10 years.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 text-blue-400">
                  📍
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-400 mb-1">Location Adjusted</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Salaries are optimized for your selected location, reflecting real market rates and opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shrink-0 text-violet-400">
                  🚀
                </div>
                <div>
                  <h4 className="text-sm font-bold text-violet-400 mb-1">Compounding Advantage</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Early skill building and experience create exponential growth. Your learning journey today directly impacts tomorrow&apos;s earnings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recommendation */}
          <div className="p-6 md:p-8 md:col-span-2 relative group overflow-hidden bg-gradient-to-br from-[#0c1618] to-[#04080a]">
            {/* Glowing borders & effects */}
            <div className="absolute inset-0 border-[3px] border-[#00ffcc]/20 rounded-[1.5rem] translate-x-[-1px] translate-y-[-1px] pointer-events-none group-hover:border-[#00ffcc]/40 transition-all duration-500" />
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#00ffcc]/10 blur-[50px] -z-10 group-hover:bg-[#00ffcc]/20 transition-all duration-500" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[10px] font-black text-[#00ffcc] uppercase tracking-widest mb-4">
              Recommendation
            </div>
            
            <h4 className="text-xl font-bold text-white mb-3">Invest in Advanced Skills</h4>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Specializing in High-Level Architecture, AI Logic, and Scale can help you reach the higher end of the salary range faster for <span className="text-white font-semibold">{winner.title}</span>.
            </p>
            
            <div className="flex items-center text-[#00ffcc] text-sm font-bold gap-2 group-hover:gap-3 transition-all">
              <span>View Learning Roadmap</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>
          
        </div>
      </div>

      {/* 5. Trust / Disclaimer element */}
      <div className="text-center pt-4 pb-2">
        <p className="text-[11px] font-medium text-white/20 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>ⓘ</span>
          Projections are estimates based on industry trends, experience growth, and market analysis. Actual results may vary.
        </p>
      </div>

    </div>
  );
}
