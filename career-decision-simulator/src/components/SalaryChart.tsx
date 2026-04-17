'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { simulateSalary, Career } from '@/lib/api';

interface SalaryChartProps {
  career1: Career;
  career2?: Career;
  locationMultiplier?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-4 shadow-2xl">
        <p className="text-white/60 text-xs mb-2">Year {label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: ${Number(entry.value).toLocaleString()}
          </p>
        ))}
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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">10-Year Salary Projection</h3>
          <p className="text-sm text-white/40 mt-0.5">
            Compound growth · Location adjusted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-xs text-white/60">{career1.title}</span>
          </div>
          {career2 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-white/60">{career2.title}</span>
            </div>
          )}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              tickFormatter={(v) => `Yr ${v}`}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={career1.title}
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
            />
            {career2 && (
              <Line
                type="monotone"
                dataKey={career2.title}
                stroke="#ec4899"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, fill: '#ec4899', strokeWidth: 0 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3">
          <p className="text-xs text-violet-300/60 mb-1">{career1.title} – Year 10</p>
          <p className="text-base font-bold text-violet-300">
            ${Math.round(data1[10].salary).toLocaleString()}
          </p>
        </div>
        {data2 && (
          <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-3">
            <p className="text-xs text-pink-300/60 mb-1">{career2!.title} – Year 10</p>
            <p className="text-base font-bold text-pink-300">
              ${Math.round(data2[10].salary).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
