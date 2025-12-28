
import React from 'react';
import { AnalysisResult as AnalysisResultType, TrainingCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisResultProps {
  data: AnalysisResultType;
}

const CategoryCard: React.FC<{ category: TrainingCategory }> = ({ category }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${category.total > 0 ? 'border-slate-100' : 'border-slate-50 opacity-60'}`}>
    <div className="flex justify-between items-start mb-3">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category.code}</span>
        <h3 className="text-slate-900 font-bold">{category.title}</h3>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-bold ${category.total > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
        {category.total} {category.unit}
      </div>
    </div>
    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{category.description}</p>
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const { cycle_summary } = data;

  const chartData = cycle_summary.categories
    .filter(c => c.total > 0)
    .map(c => ({
      name: c.code,
      total: c.total,
    }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Grid kategorií */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cycle_summary.categories.map((cat) => (
            <CategoryCard key={cat.code} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
