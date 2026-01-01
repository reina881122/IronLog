
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, Exercise, SetGroup } from '../types';

interface PlannerProps {
  plans: WorkoutPlan[];
  onSavePlan: (plan: WorkoutPlan) => void;
}

export const Planner: React.FC<PlannerProps> = ({ plans, onSavePlan }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Update internal state whenever plans or selectedDate changes
  useEffect(() => {
    const plan = plans.find(p => p.date === selectedDate);
    if (plan) {
      setSessionTitle(plan.title || '');
      setExercises(plan.exercises || []);
    } else {
      setSessionTitle('');
      setExercises([]);
    }
  }, [selectedDate, plans]);

  const addExercise = () => {
    const newEx: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      setGroups: [{ id: Math.random().toString(36).substr(2, 9), weight: 0, setsCount: 1, reps: 0 }]
    };
    setExercises([...exercises, newEx]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name } : ex));
  };

  const addSetGroup = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        const lastGroup = ex.setGroups[ex.setGroups.length - 1];
        return {
          ...ex,
          setGroups: [...ex.setGroups, { 
            id: Math.random().toString(36).substr(2, 9), 
            weight: lastGroup?.weight || 0, 
            setsCount: 1, 
            reps: lastGroup?.reps || 0 
          }]
        };
      }
      return ex;
    }));
  };

  const updateSetGroup = (exId: string, groupId: string, field: keyof SetGroup, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          setGroups: ex.setGroups.map(g => g.id === groupId ? { ...g, [field]: value } : g)
        };
      }
      return ex;
    }));
  };

  const removeGroup = (exId: string, groupId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          setGroups: ex.setGroups.filter(g => g.id !== groupId)
        };
      }
      return ex;
    }));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const save = () => {
    const existingPlan = plans.find(p => p.date === selectedDate);
    onSavePlan({
      id: existingPlan?.id || Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      title: sessionTitle,
      exercises
    });
    alert('計畫已儲存 Plan Saved');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">選擇日期 Select Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-sm font-medium"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">訓練標題 Session Title</label>
          <input 
            type="text" 
            placeholder="例如：臀腿、胸背、Leg Day"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-white transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="space-y-8">
        {exercises.length === 0 && (
          <div className="text-center py-12 border border-zinc-900 border-dashed rounded-3xl">
            <p className="text-zinc-600 text-sm font-medium">尚未新增動作項目。</p>
          </div>
        )}
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <input 
                type="text" 
                placeholder="輸入運動項目 Exercise Name"
                value={ex.name}
                onChange={(e) => updateExerciseName(ex.id, e.target.value)}
                className="bg-transparent text-xl font-black placeholder:text-zinc-800 focus:outline-none w-full mr-4 uppercase tracking-tight"
              />
              <button 
                onClick={() => removeExercise(ex.id)}
                className="text-zinc-700 hover:text-red-500 transition-colors pt-1"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-zinc-600 uppercase px-1 tracking-widest">
                <span className="col-span-4 text-center">重量 Weight</span>
                <span className="col-span-3 text-center">組數 Sets</span>
                <span className="col-span-4 text-center">次數 Reps</span>
                <span className="col-span-1"></span>
              </div>
              
              {ex.setGroups.map((group) => (
                <div key={group.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 relative">
                    <input 
                      type="number" 
                      value={group.weight || ''}
                      placeholder="0"
                      onChange={(e) => updateSetGroup(ex.id, group.id, 'weight', parseFloat(e.target.value))}
                      className="w-full bg-zinc-800/50 rounded-xl h-12 text-center text-lg font-bold focus:bg-zinc-800 outline-none transition-all"
                    />
                    <span className="absolute right-2 bottom-1 text-[8px] text-zinc-600 font-bold">KG</span>
                  </div>
                  <input 
                    type="number" 
                    value={group.setsCount || ''}
                    placeholder="1"
                    onChange={(e) => updateSetGroup(ex.id, group.id, 'setsCount', parseInt(e.target.value))}
                    className="col-span-3 bg-zinc-800/50 rounded-xl h-12 text-center text-lg font-bold focus:bg-zinc-800 outline-none transition-all border border-zinc-800/50"
                  />
                  <input 
                    type="number" 
                    value={group.reps || ''}
                    placeholder="0"
                    onChange={(e) => updateSetGroup(ex.id, group.id, 'reps', parseInt(e.target.value))}
                    className="col-span-4 bg-zinc-800/50 rounded-xl h-12 text-center text-lg font-bold focus:bg-zinc-800 outline-none transition-all"
                  />
                  <div className="col-span-1 flex justify-end">
                    {ex.setGroups.length > 1 && (
                       <button 
                        onClick={() => removeGroup(ex.id, group.id)}
                        className="text-zinc-700 hover:text-zinc-500"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => addSetGroup(ex.id)}
                className="w-full py-3 mt-2 border border-dashed border-zinc-800 rounded-xl text-[10px] font-black text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/30 transition-all uppercase tracking-widest"
              >
                + 新增不同重量/次數 Add Set Group
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-3 pt-6">
        <button 
          onClick={addExercise}
          className="w-full py-5 bg-zinc-100 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all shadow-xl active:scale-95"
        >
          新增運動項目 Add Exercise
        </button>
        <button 
          onClick={save}
          className="w-full py-5 border border-zinc-800 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:text-white hover:border-zinc-500 transition-all active:scale-95"
        >
          儲存本週菜單 Save Plan
        </button>
      </div>
    </div>
  );
};
