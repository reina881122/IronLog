
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WorkoutPlan, FlattenedSet, Exercise, SetGroup } from '../types';

interface LoggerProps {
  plans: WorkoutPlan[];
  onUpdatePlans: (plans: WorkoutPlan[]) => void;
}

export const Logger: React.FC<LoggerProps> = ({ plans, onUpdatePlans }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [completedSetIds, setCompletedSetIds] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  
  const [restSeconds, setRestSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = window.setInterval(() => {
        setRestSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRestSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStartOfWeek = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Unknown';
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      return monday.toISOString().split('T')[0];
    } catch {
      return 'Unknown';
    }
  };

  const groupedPlans = useMemo(() => {
    const groups: { [key: string]: WorkoutPlan[] } = {};
    const sortedPlans = [...plans].sort((a, b) => b.date.localeCompare(a.date));
    sortedPlans.forEach(plan => {
      const weekStart = getStartOfWeek(plan.date);
      if (!groups[weekStart]) groups[weekStart] = [];
      groups[weekStart].push(plan);
    });
    return groups;
  }, [plans]);

  const todayPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return plans.find(p => (p.id === selectedPlanId || p.date === selectedPlanId));
  }, [plans, selectedPlanId]);

  const flattenedExercises = useMemo(() => {
    if (!todayPlan || !todayPlan.exercises) return [];
    return todayPlan.exercises.map(ex => {
      const sets: FlattenedSet[] = [];
      (ex.setGroups || []).forEach(group => {
        for (let i = 0; i < (group.setsCount || 1); i++) {
          sets.push({
            id: `${group.id}-${i}`,
            groupId: group.id,
            weight: group.weight || 0,
            reps: group.reps || 0,
            setIndex: i + 1,
            completed: false
          });
        }
      });
      return { ...ex, flattenedSets: sets };
    });
  }, [todayPlan]);

  const toggleSet = (setId: string) => {
    const next = new Set(completedSetIds);
    if (!next.has(setId)) {
      next.add(setId);
      setIsTimerActive(true);
    } else {
      next.delete(setId);
    }
    setCompletedSetIds(next);
  };

  const updateActualSetGroup = (exId: string, groupId: string, field: keyof SetGroup, value: any) => {
    if (!todayPlan) return;
    const newPlans = plans.map(p => {
      if (p.id === todayPlan.id) {
        return {
          ...p,
          exercises: p.exercises.map(ex => {
            if (ex.id === exId) {
              return {
                ...ex,
                setGroups: ex.setGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g)
              };
            }
            return ex;
          })
        };
      }
      return p;
    });
    onUpdatePlans(newPlans);
  };

  const finishSession = () => {
    if (!todayPlan) return;
    const newPlans = plans.map(p => {
        if (p.id === todayPlan.id) return { ...p, isCompleted: true };
        return p;
    });
    onUpdatePlans(newPlans);
    setSelectedPlanId(null);
  };

  if (!selectedPlanId) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-6 bg-white rounded-full"></div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">選擇課表 Choose Session</h2>
        </div>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <i className="fa-solid fa-calendar-day text-4xl text-zinc-800 mb-4"></i>
            <p className="text-zinc-500 text-sm font-bold">目前沒有規劃課表。</p>
          </div>
        ) : (
          <div className="space-y-10">
            {(Object.entries(groupedPlans) as [string, WorkoutPlan[]][]).map(([weekStart, weekPlans]) => (
              <div key={weekStart} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Week of {weekStart}</h3>
                  <div className="h-px flex-1 bg-zinc-900 ml-4"></div>
                </div>
                <div className="grid gap-3">
                  {weekPlans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => { setSelectedPlanId(plan.id); setActiveExIndex(0); setCompletedSetIds(new Set()); setIsEditing(false); }}
                      className="group flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 p-5 rounded-2xl transition-all"
                    >
                      <div className="flex items-center space-x-5">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-800 rounded-xl relative">
                          <span className="text-[10px] font-bold opacity-60 uppercase">{new Date(plan.date).toLocaleDateString('zh-TW', { weekday: 'short' })}</span>
                          <span className="text-lg font-black leading-none">{new Date(plan.date).getDate()}</span>
                          {plan.isCompleted && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>}
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-bold text-sm uppercase">{plan.title || `${plan.exercises.length} 動作`}</h4>
                          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            {plan.exercises.map(e => e.name).join(' • ').slice(0, 30)}...
                          </p>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right text-zinc-700"></i>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentExercise = flattenedExercises[activeExIndex];
  const isExComplete = currentExercise?.flattenedSets?.every(s => completedSetIds.has(s.id));
  const rawEx = todayPlan.exercises[activeExIndex];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
      {isTimerActive && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-3 rounded-full flex items-center space-x-4 shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase opacity-60">Resting</span>
            <span className="text-xl font-mono font-black leading-none">{formatTime(restSeconds)}</span>
          </div>
          <button onClick={() => setIsTimerActive(false)} className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
            <i className="fa-solid fa-xmark text-[10px]"></i>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedPlanId(null)} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
          <i className="fa-solid fa-arrow-left"></i><span>返回 BACK</span>
        </button>
        <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
          {isEditing ? '完成編輯 DONE' : '修改內容 EDIT'}
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Exercise No.{activeExIndex + 1}</span>
        <h3 className="text-4xl font-black uppercase tracking-tighter">{currentExercise?.name || '運動項目'}</h3>
      </div>

      <div className="space-y-10 py-6">
        {rawEx && rawEx.setGroups.map((group, gIdx) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-black">{group.weight}<span className="text-xs ml-1 text-zinc-600 font-bold uppercase">KG</span></span>
                <span className="text-zinc-800 text-xl font-bold">×</span>
                <span className="text-2xl font-black text-zinc-500">{group.reps}<span className="text-xs ml-1 text-zinc-600 font-bold uppercase">REPS</span></span>
              </div>
              
              <div className="flex items-center space-x-2 bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                <span className="text-[9px] font-black text-zinc-600 uppercase ml-1">RPE</span>
                <select value={group.rpe || 0} onChange={e => updateActualSetGroup(rawEx.id, group.id, 'rpe', parseInt(e.target.value))} className="bg-transparent text-xs font-black text-white focus:outline-none">
                   {[...Array(11)].map((_, i) => <option key={i} value={i} className="bg-black">{i}</option>)}
                </select>
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-12 gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                 <input type="number" value={group.weight} onChange={e => updateActualSetGroup(rawEx.id, group.id, 'weight', parseFloat(e.target.value))} className="col-span-4 bg-zinc-800 text-center py-2 rounded-xl font-black" />
                 <span className="col-span-1 text-center text-zinc-600 mt-2">×</span>
                 <input type="number" value={group.reps} onChange={e => updateActualSetGroup(rawEx.id, group.id, 'reps', parseInt(e.target.value))} className="col-span-3 bg-zinc-800 text-center py-2 rounded-xl font-black" />
                 <span className="col-span-4 text-center text-[10px] font-black text-zinc-600 mt-2 uppercase tracking-widest">Editing Mode</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {Array.from({ length: group.setsCount }).map((_, sIdx) => {
                  const setId = `${group.id}-${sIdx}`;
                  const isDone = completedSetIds.has(setId);
                  return (
                    <button
                      key={setId}
                      onClick={() => toggleSet(setId)}
                      className={`w-14 h-14 rounded-2xl border-2 transition-all flex items-center justify-center font-black ${isDone ? 'bg-white border-white text-black scale-95' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}
                    >
                      {sIdx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-zinc-900 space-y-4">
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">訓練檢討 Review</label>
        <textarea 
          placeholder="寫下你的訓練心得、感受..."
          className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:border-zinc-700 transition-all"
          rows={3}
          value={rawEx?.review || ''}
          onChange={(e) => {
              const newPlans = plans.map(p => {
                  if (p.id === todayPlan.id) {
                      return { ...p, exercises: p.exercises.map(ex => ex.id === rawEx.id ? { ...ex, review: e.target.value } : ex) };
                  }
                  return p;
              });
              onUpdatePlans(newPlans);
          }}
        />
        
        <div className="flex space-x-4">
            <button disabled={activeExIndex === 0} onClick={() => setActiveExIndex(prev => prev - 1)} className="flex-1 py-4 border border-zinc-800 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-600 disabled:opacity-0">上一個 PREV</button>
            <button disabled={activeExIndex === flattenedExercises.length - 1} onClick={() => setActiveExIndex(prev => prev + 1)} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest ${isExComplete ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}>下一個 NEXT</button>
        </div>
      </div>

      {flattenedExercises.length > 0 && flattenedExercises.every(ex => ex.flattenedSets.every(s => completedSetIds.has(s.id))) && (
        <div className="pt-10 animate-in zoom-in duration-500">
          <button onClick={finishSession} className="w-full py-6 bg-white text-black rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl">
            完成鍛鍊並存檔 FINISH SESSION
          </button>
        </div>
      )}
    </div>
  );
};
