
import React, { useState, useEffect } from 'react';
import { Planner } from './components/Planner';
import { Logger } from './components/Logger';
import { Coaching } from './components/Coaching';
import { Stats } from './components/Stats';
import { WorkoutPlan, CoachingNote, ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('train');
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem('workout_plans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>(() => {
    const saved = localStorage.getItem('coaching_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('workout_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('coaching_notes', JSON.stringify(coachingNotes));
  }, [coachingNotes]);

  const handleSavePlan = (plan: WorkoutPlan) => {
    setPlans(prev => {
      const index = prev.findIndex(p => p.date === plan.date);
      if (index >= 0) {
        const newPlans = [...prev];
        newPlans[index] = plan;
        return newPlans;
      }
      return [...prev, plan];
    });
  };

  const handleAddCoachingNote = (note: CoachingNote) => {
    setCoachingNotes(prev => [note, ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-24 font-sans">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">IRONLOG</h1>
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center">
          <i className="fa-solid fa-bolt text-xs text-white"></i>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {currentView === 'plan' && (
          <Planner plans={plans} onSavePlan={handleSavePlan} />
        )}
        {currentView === 'train' && (
          <Logger plans={plans} onUpdatePlans={setPlans} />
        )}
        {currentView === 'stats' && (
          <Stats plans={plans} />
        )}
        {currentView === 'coach' && (
          <Coaching notes={coachingNotes} onAddNote={handleAddCoachingNote} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 px-8 py-5 flex justify-around items-center">
        {[
          { id: 'plan', icon: 'fa-calendar-plus', label: '計劃' },
          { id: 'train', icon: 'fa-dumbbell', label: '訓練' },
          { id: 'stats', icon: 'fa-chart-line', label: '趨勢' },
          { id: 'coach', icon: 'fa-video', label: '筆記' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id as ViewType)}
            className={`flex flex-col items-center space-y-1.5 transition-all duration-200 ${currentView === item.id ? 'text-white scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <i className={`fa-solid ${item.icon} text-sm`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
