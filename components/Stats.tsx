
import React, { useMemo, useState } from 'react';
import { WorkoutPlan } from '../types';

interface StatsProps { plans: WorkoutPlan[]; }
interface ExerciseHistory { date: string; maxWeight: number; volume: number; est1RM: number; isPR?: boolean; }

export const Stats: React.FC<StatsProps> = ({ plans }) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [metric, setMetric] = useState<'maxWeight' | 'volume' | 'est1RM'>('maxWeight');

  const exerciseStats = useMemo(() => {
    const stats: { [key: string]: ExerciseHistory[] } = {};
    const completedPlans = plans.filter(p => p.isCompleted);
    
    completedPlans.forEach(plan => {
      plan.exercises.forEach(ex => {
        const name = ex.name.trim().toUpperCase();
        if (!name) return;
        if (!stats[name]) stats[name] = [];
        
        let maxWeight = 0;
        let volume = 0;
        let bestEst1RM = 0;

        ex.setGroups.forEach(group => {
          if (group.weight > maxWeight) maxWeight = group.weight;
          volume += (group.weight * group.reps * group.setsCount);
          const est1RM = group.reps === 1 ? group.weight : Math.round(group.weight / (1.0278 - 0.0278 * group.reps));
          if (est1RM > bestEst1RM) bestEst1RM = est1RM;
        });

        stats[name].push({ date: plan.date, maxWeight, volume, est1RM: bestEst1RM });
      });
    });

    Object.keys(stats).forEach(name => {
      stats[name].sort((a, b) => a.date.localeCompare(b.date));
      let currentMax = 0;
      stats[name].forEach(h => {
        if (h.maxWeight > currentMax) {
          h.isPR = true;
          currentMax = h.maxWeight;
        }
      });
    });
    return stats;
  }, [plans]);

  const exerciseNames = Object.keys(exerciseStats).sort();

  if (selectedExercise) {
    const history = exerciseStats[selectedExercise];
    const latest = history[history.length - 1];
    const values = history.map(h => h[metric]);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    const getBarHeight = (val: number) => {
      if (maxVal === minVal) return 100;
      const baseline = minVal * 0.95; 
      const range = maxVal - baseline;
      const relativeVal = val - baseline;
      return (relativeVal / range) * 100;
    };

    const metricLabels = {
      maxWeight: '最高重量',
      volume: '訓練總量',
      est1RM: '預估 1RM'
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <button onClick={() => setSelectedExercise(null)} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
          <i className="fa-solid fa-arrow-left"></i><span>返回列表 BACK</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Progress Data</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedExercise}</h2>
          </div>
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            {(['maxWeight', 'volume', 'est1RM'] as const).map(m => (
              <button 
                key={m}
                onClick={() => setMetric(m)} 
                className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${metric === m ? 'bg-white text-black' : 'text-zinc-500'}`}
              >
                {metricLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-1">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">最高紀錄 MAX</span>
              <p className="text-3xl font-black text-white">{maxVal}<span className="text-xs ml-1 text-zinc-700">KG</span></p>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-1">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">最新表現 LAST</span>
              <p className="text-3xl font-black text-white">{latest[metric]}</p>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-1 hidden md:block">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">預估極限 1RM</span>
              <p className="text-3xl font-black text-white">{latest.est1RM}<span className="text-xs ml-1 text-zinc-700">KG</span></p>
           </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-inner">
           <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">進步趨勢圖 Trend Analytics</h3>
              <div className="w-2 h-2 bg-white rounded-full"></div>
           </div>
           <div className="h-60 flex items-end justify-between space-x-1 px-1">
            {history.map((h, i) => (
              <div key={i} className="flex-1 group relative flex flex-col items-center">
                <div 
                  style={{ height: `${getBarHeight(h[metric])}%` }} 
                  className={`w-full rounded-t-sm transition-all duration-700 ${h.isPR && metric === 'maxWeight' ? 'bg-white' : 'bg-zinc-800'} group-hover:bg-zinc-400`}
                ></div>
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-white text-black px-2 py-1 rounded-lg z-10">
                  {h[metric]}
                </div>
                <div className="text-[8px] font-bold text-zinc-700 mt-3 truncate w-full text-center uppercase">{h.date.split('-').slice(1).join('/')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-2">歷史數據明細 HISTORY</h3>
           <div className="space-y-3">
             {[...history].reverse().map((h, i) => (
               <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl flex justify-between items-center group hover:bg-zinc-900 transition-all">
                  <div className="flex items-center space-x-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.isPR ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                        {h.isPR ? <i className="fa-solid fa-crown text-xs"></i> : <i className="fa-solid fa-calendar text-xs"></i>}
                     </div>
                     <div>
                        <div className="text-[9px] font-black text-zinc-500 uppercase">{h.date}</div>
                        <div className="text-lg font-black text-white">{h.maxWeight} KG <span className="text-[10px] text-zinc-700 ml-1">MAX</span></div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[9px] font-black text-zinc-600 uppercase">Est. 1RM / Vol</div>
                     <div className="text-sm font-bold text-zinc-400">{h.est1RM}kg / {h.volume}kg</div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-6 bg-white rounded-full"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">數據洞察 Insights</h2>
      </div>

      {exerciseNames.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
           <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-chart-simple text-3xl text-zinc-700"></i>
           </div>
           <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">— 尚未有已完成的訓練數據 —</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exerciseNames.map(name => {
            const history = exerciseStats[name];
            const maxVal = Math.max(...history.map(x => x.maxWeight));
            return (
              <button key={name} onClick={() => setSelectedExercise(name)} className="group flex justify-between items-center p-7 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] hover:bg-zinc-900 hover:border-zinc-700 transition-all active:scale-[0.98]">
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{name}</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Personal Record: {maxVal}kg</p>
                </div>
                <div className="flex items-center space-x-6">
                   <div className="h-8 w-16 flex items-end space-x-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      {history.slice(-6).map((h, idx) => (
                        <div key={idx} style={{ height: `${(h.maxWeight / maxVal) * 100}%` }} className="flex-1 bg-white min-h-[1px]"></div>
                      ))}
                   </div>
                   <i className="fa-solid fa-chevron-right text-zinc-800 group-hover:text-white transition-all"></i>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
