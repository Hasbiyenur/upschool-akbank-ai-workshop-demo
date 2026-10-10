import React, { useState } from 'react';
import { Header } from './components/Header';
import { InterviewCoach } from './components/InterviewCoach';
import { LearningCoach } from './components/LearningCoach';
import { Guide } from './components/Guide';
import { Briefcase, GraduationCap, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'learning' | 'guide'>('interview');
  const [transferredTargetRole, setTransferredTargetRole] = useState<string>('');

  const handleSwitchToInterviewWithRole = (targetRole: string) => {
    setTransferredTargetRole(targetRole);
    setActiveTab('interview');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'interview' && (
          <InterviewCoach
            key={transferredTargetRole}
            initialTargetRole={transferredTargetRole}
          />
        )}

        {activeTab === 'learning' && (
          <LearningCoach
            onSwitchToInterviewCoachWithRole={handleSwitchToInterviewWithRole}
          />
        )}

        {activeTab === 'guide' && (
          <Guide
            onGoToInterview={() => setActiveTab('interview')}
            onGoToLearning={() => setActiveTab('learning')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Kariyer & Mülakat Koçu AI Ajanı
            </span>
            <span>—</span>
            <span>Mülakatçı Unvanına Özel Simülasyon & Eğitim Müfredatı Danışmanı</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('interview')}
              className="hover:text-indigo-600 transition"
            >
              Mülakat Koçu
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className="hover:text-indigo-600 transition"
            >
              Eğitim Yol Haritası
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-indigo-600 transition"
            >
              STAR Kılavuzu
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
