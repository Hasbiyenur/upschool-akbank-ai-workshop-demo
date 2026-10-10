import React, { useState } from 'react';
import {
  InterviewGenerationResult,
  InterviewQuestion,
} from '../types';
import { MockPracticeModal } from './MockPracticeModal';
import {
  Briefcase,
  Users,
  Building2,
  Sliders,
  Sparkles,
  Loader2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Key,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Award,
  RefreshCw
} from 'lucide-react';

interface Props {
  initialTargetRole?: string;
}

const COMMON_TITLES = [
  'Engineering Manager',
  'Senior Tech Lead / Mimar',
  'HR / People Partner Direktörü',
  'VP of Engineering / CTO',
  'Head of Product / PM Lead',
  'Senior Data Science Lead',
  'Kurucu / CEO',
  'Scrum Master / Agile Coach'
];

const COMMON_ROLES = [
  'Senior Full-Stack Developer',
  'Frontend React Developer',
  'Backend Golang / Java Developer',
  'Data Scientist / AI Engineer',
  'Product Manager',
  'Cloud & DevOps Engineer'
];

const INDUSTRIES = [
  'Teknoloji & SaaS',
  'Fintech & Dijital Bankacılık',
  'E-Ticaret & Pazaryeri',
  'Yapay Zeka & Derin Teknoloji',
  'Oyun & Mobil Eğlence',
  'Sağlık Teknolojileri',
  'Kurumsal Danışmanlık'
];

const INTERVIEW_FORMATS = [
  'Teknik & Davranışsal Karma',
  'Teknik Derinlik & Sistem Mimarisi',
  'Davranışsal & Kültür Uyumu (STAR Odaklı)',
  'Liderlik, Kriz & Stratejik Karar Alma',
  'Canlı Vaka Analizi (Case Study)'
];

const EXP_LEVELS = [
  'Junior (0-2 Yıl)',
  'Mid-Level (2-5 Yıl)',
  'Senior (5-8 Yıl)',
  'Lead / Principal / Staff (8+ Yıl)'
];

export const InterviewCoach: React.FC<Props> = ({ initialTargetRole = '' }) => {
  const [interviewerTitle, setInterviewerTitle] = useState('Engineering Manager');
  const [targetRole, setTargetRole] = useState(initialTargetRole || 'Senior Full-Stack Developer');
  const [industry, setIndustry] = useState('Teknoloji & SaaS');
  const [interviewType, setInterviewType] = useState('Teknik & Davranışsal Karma');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (2-5 Yıl)');
  const [additionalContext, setAdditionalContext] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewGenerationResult | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [activePracticeQuestion, setActivePracticeQuestion] = useState<InterviewQuestion | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewerTitle.trim() || !targetRole.trim()) {
      setError('Lütfen mülakatçı unvanı ve hedeflenen rol alanlarını doldurun.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle: interviewerTitle.trim(),
          targetRole: targetRole.trim(),
          industry,
          interviewType,
          experienceLevel,
          additionalContext: additionalContext.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Sorular üretilirken bir hata oluştu.');
      }

      const data: InterviewGenerationResult = await res.json();
      setResult(data);
      if (data.questions && data.questions.length > 0) {
        setExpandedQuestionId(data.questions[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = result?.questions
    ? ['Tümü', ...Array.from(new Set(result.questions.map((q) => q.category)))]
    : ['Tümü'];

  const filteredQuestions = result?.questions
    ? selectedCategory === 'Tümü'
      ? result.questions
      : result.questions.filter((q) => q.category === selectedCategory)
    : [];

  const copyAllToClipboard = () => {
    if (!result) return;
    const text = `=== ${result.interviewerProfile.title} Mülakat Hazırlık Raporu ===
Pozisyon: ${targetRole}
Zihniyet: ${result.interviewerProfile.mindset}

SORULAR VE STRATEJİLER:
${result.questions
  .map(
    (q, i) => `${i + 1}. [${q.category}] ${q.question}
Gizli Amaç: ${q.hiddenAgenda}
Anahtar Terimler: ${q.keyKeywords.join(', ')}
Örnek Cevap: ${q.modelAnswer}
`
  )
  .join('\n\n')}

MÜLAKATÇIYA SORULABİLECEK TERS SORULAR:
${result.reverseQuestions.map((r, i) => `${i + 1}. ${r.question}\nNeden Etkiler: ${r.whyItImpresses}`).join('\n\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Briefcase className="w-4 h-4" /> Mülakatçı Odaklı Soru Motoru
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Kimin Karşısına Çıkacaksın?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Mülakatçının unvanını gir; onun zihniyetine, beklentilerine ve şirket içi rolüne özel nokta atışı sorular üretelim.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Interviewer Title Input + Chips */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Mülakatı Yapan Kişinin Unvanı <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={interviewerTitle}
                onChange={(e) => setInterviewerTitle(e.target.value)}
                placeholder="Örnek: Engineering Manager, Senior Frontend Lead, HR Director..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-400 self-center mr-1">Hızlı Seçim:</span>
              {COMMON_TITLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInterviewerTitle(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    interviewerTitle === t
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target Role Input + Chips */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Hedeflenen Pozisyon / Rol <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Örnek: Senior Full-Stack Developer, AI Prompt Engineer, UI/UX Designer..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-400 self-center mr-1">Popüler Roller:</span>
              {COMMON_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTargetRole(r)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    targetRole === r
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Settings: Industry, Format, Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Sektör / Şirket Tipi
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" /> Mülakat Formatı
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {INTERVIEW_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" /> Deneyim Seviyen
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {EXP_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Context (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Ek Bilgi veya Özel Not (Opsiyonel):
            </label>
            <input
              type="text"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Örnek: Şirket mikroservis mimarisine geçiyor, ekipte 4 kişi var veya uzaktan çalışma kültürü hakim..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {interviewerTitle} Perspektifi & Soruları Modelleniyor...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Bu Unvanın Soracağı Soruları & Stratejileri Üret
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Result Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Interviewer Persona Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/50">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <Users className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Mülakatçı Profili & Psikolojisi
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {result.interviewerProfile.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={copyAllToClipboard}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/50 text-xs font-medium text-indigo-200 transition"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? 'Tüm Rapor Kopyalandı' : 'Raporu Kopyala'}
              </button>
            </div>

            {/* Persona Details */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Temel Zihniyet & Öncelik
                </h5>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {result.interviewerProfile.mindset}
                </p>
                <div className="pt-2 text-xs text-indigo-200/90 italic">
                  <strong>İletişim Tonu:</strong> {result.interviewerProfile.communicationToneRecommendation}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Aradığı Kritik Özellikler
                </h5>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {result.interviewerProfile.evaluationPriorities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Anında Eleyen Kırmızı Bayraklar
                </h5>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {result.interviewerProfile.redFlagsToAvoid.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Questions Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Potansiyel Mülakat Soruları ({result.questions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Seçtiğin soruya tıklayarak STAR stratejisini ve model cevabı incele, simülatörde bizzat pratik yap.
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id || idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Card Header (Clickable) */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex items-start justify-between gap-4 select-none"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.category}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Kolay'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : q.difficulty === 'Zor' || q.difficulty === 'Çok Zor'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        "{q.question}"
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1.5">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Gizli Amaç:</span> {q.hiddenAgenda}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePracticeQuestion(q);
                        }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Cevap Pratiği Yap
                      </button>
                      <span className="p-1.5 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Body */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-5 animate-fadeIn">
                      {/* Mobile Practice Button */}
                      <div className="sm:hidden">
                        <button
                          type="button"
                          onClick={() => setActivePracticeQuestion(q)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" /> Bu Soruyu Cevapla (Simülasyon)
                        </button>
                      </div>

                      {/* Hidden Agenda Full */}
                      <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                        <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Mülakatçının Gizli Amacı (Neden Bunu Soruyor?)
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q.hiddenAgenda}
                        </p>
                      </div>

                      {/* STAR Strategy Grid */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-500" /> STAR Cevap Stratejisi
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              S - Durum (Situation)
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {q.starStrategy.situation}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              T - Görev (Task)
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {q.starStrategy.task}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              A - Eylem (Action)
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {q.starStrategy.action}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              R - Sonuç (Result)
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {q.starStrategy.result}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Keywords & Traps Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Key keywords */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-indigo-500" /> Cevapta Geçmesi Gereken Anahtar Kelimeler & Metrikler
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {q.keyKeywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Traps and Mistakes */}
                        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 space-y-1.5">
                          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Düşülebilecek Tuzak & Yapılan Yaygın Hata
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {q.trapsAndMistakes}
                          </p>
                        </div>
                      </div>

                      {/* Model Answer */}
                      <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Örnek Model Cevap (Benchmarking)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(q.modelAnswer);
                              alert('Örnek model cevap panoya kopyalandı.');
                            }}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Kopyala
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                          "{q.modelAnswer}"
                        </p>
                      </div>

                      {/* Bottom action trigger for practice */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setActivePracticeQuestion(q)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Kendi Cevabınla Simülatörde Pratik Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reverse Questions Section: Adayın Mülakatçıya Soracağı Sorular */}
          {result.reverseQuestions && result.reverseQuestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Mülakatın Sonunda Sen Ne Sormalısın? (Ters Sorular)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    "{result.interviewerProfile.title}" unvanına sorduğunda onun zihninde seni en üst sıraya taşıyacak stratejik sorular:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {result.reverseQuestions.map((rev, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 hover:border-violet-300 dark:hover:border-violet-700 transition"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <h5 className="font-semibold text-sm text-slate-900 dark:text-white">
                        "{rev.question}"
                      </h5>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                      <strong className="text-violet-600 dark:text-violet-400">Neden Etkiler:</strong> {rev.whyItImpresses}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mock Practice Modal */}
      {activePracticeQuestion && (
        <MockPracticeModal
          question={activePracticeQuestion}
          interviewerTitle={interviewerTitle}
          targetRole={targetRole}
          onClose={() => setActivePracticeQuestion(null)}
        />
      )}
    </div>
  );
};
