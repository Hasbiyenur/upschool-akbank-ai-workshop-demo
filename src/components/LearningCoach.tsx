import React, { useState } from 'react';
import { CompletedTrainingInput, LearningPathwayResult } from '../types';
import {
  GraduationCap,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Calendar,
  Award,
  ChevronRight,
  ArrowRight,
  Code2,
  Compass,
  FileCheck,
  Loader2,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  onSwitchToInterviewCoachWithRole: (targetRole: string) => void;
}

const PRESET_SCENARIOS = [
  {
    name: 'Frontend -> Senior / Full-Stack',
    currentRole: 'Junior/Mid Frontend Developer',
    targetRole: 'Senior Full-Stack Engineer / Tech Lead',
    focusArea: 'Mimari, Backend Entegrasyonu & Sistem Tasarımı',
    trainings: [
      {
        id: '1',
        title: 'Modern JavaScript & TypeScript Uzmanlığı',
        content:
          'ES6+ yenilikleri, Prototypes, Asenkron programlama (Promises, async/await), TypeScript Generics, Interface & Type ayrımı, Event Loop ve bellek yönetimi.',
        platform: 'Udemy / Online Bootcamp'
      },
      {
        id: '2',
        title: 'React 19, Next.js & Modern State Yönetimi',
        content:
          'Custom Hooks, React Server Components (RSC), Redux Toolkit, TanStack Query, Tailwind CSS, REST API entegrasyonu ve JWT tabanlı kimlik doğrulama.',
        platform: 'Frontend Masters'
      }
    ]
  },
  {
    name: 'Veri Analitiği -> Data Scientist / AI',
    currentRole: 'Junior Veri Analisti',
    targetRole: 'Data Scientist & Makine Öğrenmesi Mühendisi',
    focusArea: 'Makine Öğrenmesi Algoritmaları & Model Mimarisi',
    trainings: [
      {
        id: '1',
        title: 'Python ile Veri Analizi ve SQL Temelleri',
        content:
          'NumPy, Pandas ile veri manipülasyonu, Matplotlib & Seaborn görselleştirme, PostgreSQL karmaşık sorgular (JOIN, Window Functions, Aggregate sorgular).',
        platform: 'Coursera'
      },
      {
        id: '2',
        title: 'Uygulamalı İstatistik ve Keşifçi Veri Analitiği (EDA)',
        content:
          'Olasılık dağılımları, Hipotez testleri (A/B testing), Korelasyon analizleri, Eksik veri yönetimi ve özellik mühendisliği (feature engineering) temelleri.',
        platform: 'DataCamp'
      }
    ]
  },
  {
    name: 'Backend Dev -> Cloud & Dağıtık Sistemler',
    currentRole: 'Backend Developer (Java/Spring)',
    targetRole: 'Cloud-Native Backend Architect',
    focusArea: 'Dağıtık Mimari, Mikroservisler & Kubernetes',
    trainings: [
      {
        id: '1',
        title: 'Java Spring Boot ile REST API ve Veritabanı',
        content:
          'Spring MVC, Spring Data JPA, Hibernate, PostgreSQL ilişkisel modelleme, Unit test yazımı (JUnit, Mockito), Swagger/OpenAPI dokümantasyonu.',
        platform: 'Udemy'
      },
      {
        id: '2',
        title: 'Docker ve Konteynerizasyon Temelleri',
        content:
          'Dockerfile hazırlama, Docker Compose ile çoklu servis çalıştırma, Image optimizasyonu, Environment variable yönetimi.',
        platform: 'BTK Akademi'
      }
    ]
  }
];

export const LearningCoach: React.FC<Props> = ({ onSwitchToInterviewCoachWithRole }) => {
  const [trainings, setTrainings] = useState<CompletedTrainingInput[]>([
    {
      id: '1',
      title: 'Modern React & Web Geliştirme Bootcamp',
      content:
        'JavaScript ES6+, React temel ve ileri seviye hooks, Redux Toolkit state yönetimi, REST API entegrasyonu, Tailwind CSS ile responsive arayüzler, Git & GitHub versiyon kontrolü.',
      platform: 'Online Akademi'
    }
  ]);

  const [currentRole, setCurrentRole] = useState('Frontend Developer');
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer / Tech Lead');
  const [focusArea, setFocusArea] = useState('Backend & Sistem Mimarisi Derinliği');
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LearningPathwayResult | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const addTraining = () => {
    setTrainings((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        content: '',
        platform: ''
      }
    ]);
  };

  const removeTraining = (id: string) => {
    if (trainings.length === 1) {
      alert('En az bir tamamlanan eğitim içeriği bulunmalıdır.');
      return;
    }
    setTrainings((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTraining = (id: string, field: keyof CompletedTrainingInput, value: string) => {
    setTrainings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const loadPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setCurrentRole(preset.currentRole);
    setTargetRole(preset.targetRole);
    setFocusArea(preset.focusArea);
    setTrainings(
      preset.trainings.map((t, idx) => ({
        id: (idx + 1).toString(),
        title: t.title,
        content: t.content,
        platform: t.platform
      }))
    );
    setResult(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validTrainings = trainings.filter(
      (t) => t.title.trim() && t.content.trim()
    );

    if (validTrainings.length === 0) {
      setError('Lütfen en az bir eğitimin başlığını ve detaylı içeriğini girin.');
      return;
    }

    if (!targetRole.trim()) {
      setError('Lütfen hedeflediğiniz rolü belirtin.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recommend-next-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTrainings: validTrainings,
          currentRole: currentRole.trim(),
          targetRole: targetRole.trim(),
          focusArea,
          weeklyHours,
          additionalNotes: additionalNotes.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Eğitim analizi yapılırken hata oluştu.');
      }

      const data: LearningPathwayResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoadmap = () => {
    if (!result) return;
    const text = `=== EĞİTİM & KARİYER YOL HARİTASI ===
Mevcut Profil: ${currentRole} -> Hedef: ${targetRole}
Ulaşılan Seviye: ${result.currentSynthesis.reachedLevel}

1. ÖNCELİKLİ ALINMASI GEREKEN EĞİTİM:
${result.primaryRecommendedNextTraining.title} (${result.primaryRecommendedNextTraining.badge})
Neden Bu Eğitim: ${result.primaryRecommendedNextTraining.whyThisTraining}
Süre: ${result.primaryRecommendedNextTraining.idealDuration}

MÜFREDAT MODÜLLERİ:
${result.primaryRecommendedNextTraining.curriculumSyllabus
  .map(
    (m) =>
      `Modül ${m.moduleNumber}: ${m.moduleTitle}\nKonular: ${m.keyTopics.join(', ')}\nUygulama: ${m.practicalTask}`
  )
  .join('\n\n')}

BİTİRME PORTFOLYO PROJESİ:
${result.capstoneProject.projectTitle}
Teknolojiler: ${result.capstoneProject.techStackToUse.join(', ')}
CV İfadesi: ${result.capstoneProject.resumeBulletPoint}

KOÇ TAVSİYESİ:
${result.coachAdvice}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Intro & Presets */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <GraduationCap className="w-4 h-4" /> Müfredat & Sonraki Adım Analizi
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Aldığın Eğitimlerin Üzerine Bir Sonraki Adım Ne Olmalı?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tamamladığın eğitimlerin içeriklerini gir; hedefinle arasındaki yetkinlik açıklarını tespit edip sana tam olarak alman gereken eğitimi ve müfredatını çıkaralım.
            </p>
          </div>
        </div>

        {/* Preset chips */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hızlı Test İçin Örnek Senaryo Yükle:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((ps) => (
              <button
                key={ps.name}
                type="button"
                onClick={() => loadPreset(ps)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-200 font-medium transition shadow-xs"
              >
                {ps.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* Completed Trainings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Katıldığın / Tamamladığın Eğitimler ve İçerikleri ({trainings.length})
              </label>
              <button
                type="button"
                onClick={addTraining}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Başka Eğitim Ekle
              </button>
            </div>

            <div className="space-y-3.5">
              {trainings.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                      Eğitim #{idx + 1}
                    </span>
                    {trainings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraining(t.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition"
                        title="Bu eğitimi kaldır"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Eğitimin Başlığı / Adı <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) => updateTraining(t.id, 'title', e.target.value)}
                        placeholder="Örnek: İleri Düzey React ve Modern Web Geliştirme"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Kurum / Platform (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={t.platform || ''}
                        onChange={(e) => updateTraining(t.id, 'platform', e.target.value)}
                        placeholder="Örnek: Coursera, Udemy, vb."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Bu Eğitimde Görülen Konular / Müfredat İçeriği / Kazanımlar <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={t.content}
                      onChange={(e) => updateTraining(t.id, 'content', e.target.value)}
                      placeholder="Eğitimde ne öğrendiniz? (Örnek: Hooks, Context API, Redux Toolkit, SSR, Tailwind CSS, Jest ile Unit Testler, Docker ile çalıştırma...)"
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Role & Profile Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Şu Anki Durumun / Rolün
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Ör: Mid Frontend Developer"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hedeflediğin Rol / Seviye <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Ör: Senior Full-Stack Architect"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Haftalık Ayırabileceğin Süre
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={25}
                  step={1}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-16 text-right">
                  {weeklyHours} Saat/Hafta
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Öncelikli Odak Alanın veya Özel Hedefin:
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="Örnek: Mimari derinliği ve backend sistemleri, Mikroservisler, AI entegrasyonu..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
                <Loader2 className="w-5 h-5 animate-spin" /> Eğitim İçerikleri Sentezleniyor & Yol Haritası Çıkarılıyor...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Bu İçeriklere Göre Bir Sonraki Eğitimimi Belirle
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Current Synthesis & Level Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Eğitim Geçmişi Analizi
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Ulaşılan Yetkinlik Düzeyi: <span className="text-emerald-600 dark:text-emerald-400">{result.currentSynthesis.reachedLevel}</span>
                  </h3>
                </div>
              </div>

              <button
                onClick={copyRoadmap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 self-start sm:self-auto transition"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSummary ? 'Kopyalandı' : 'Yol Haritasını Kopyala'}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.currentSynthesis.summary}
            </p>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Eğitimler ile Kanıtlanan Sağlam Temeller:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.currentSynthesis.strongFoundations.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gap Analysis Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kritik Yetkinlik Açıkları (Skill Gap Analysis)
                </h4>
                <p className="text-xs text-slate-500">
                  Mevcut eğitimlerin kazandırdıkları ile <strong className="text-indigo-600">{targetRole}</strong> hedefi arasındaki kritik eksikler:
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Geliştirilecek Alan</th>
                    <th className="py-2.5 px-3">Şu Anki Durum</th>
                    <th className="py-2.5 px-3">Hedef Seviye Gereksinimi</th>
                    <th className="py-2.5 px-3">Kritiklik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.gapAnalysis.map((gap, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {gap.skillArea}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {gap.currentStatus}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                        {gap.targetRequirement}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          gap.criticality === 'Kritik'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : gap.criticality === 'Önemli'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {gap.criticality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PRIMARY RECOMMENDED NEXT TRAINING (THE BIG WINNER) */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-700/40 relative overflow-hidden space-y-6">
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge & Title */}
            <div className="space-y-2 pb-4 border-b border-indigo-800/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                  {result.primaryRecommendedNextTraining.badge}
                </span>
                <span className="text-xs text-indigo-300 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Önerilen Süre: {result.primaryRecommendedNextTraining.idealDuration}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {result.primaryRecommendedNextTraining.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                <strong className="text-indigo-400">Neden Tam Olarak Bu Eğitim:</strong> {result.primaryRecommendedNextTraining.whyThisTraining}
              </p>
            </div>

            {/* Target Outcomes */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Bu Eğitimi Bitirince Neler Yapabileceksin?
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.primaryRecommendedNextTraining.targetOutcomes.map((out, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{out}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Curriculum Syllabus Modules */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Eğitimin Müfredatında Kesinlikle Olması Gereken Modüller
              </h5>
              <p className="text-xs text-slate-400">
                Kurs ararken müfredatında şu çekirdek konuların ve somut ödevlerin bulunmasına dikkat et:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {result.primaryRecommendedNextTraining.curriculumSyllabus.map((module) => (
                  <div
                    key={module.moduleNumber}
                    className="p-4 rounded-xl bg-slate-900/80 border border-indigo-800/50 space-y-2 hover:border-indigo-600 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        Modül {module.moduleNumber}: {module.moduleTitle}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {module.keyTopics.map((top, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950 text-indigo-200 border border-indigo-900/60"
                        >
                          {top}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800/80">
                      <strong className="text-amber-400">Pratik Ödev:</strong> {module.practicalTask}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to look for when choosing course */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5">
              <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Kurs Seçerken / Satın Alırken Aranacak Kriterler:
              </h5>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {result.primaryRecommendedNextTraining.whatToLookForWhenChoosingCourse.map((crit, idx) => (
                  <li key={idx}>{crit}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Secondary Training & Capstone Project Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Secondary Follow-up Training */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> 2. Adım / Destekleyici Tamamlayıcı Eğitim
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {result.secondaryFollowUpTraining.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.secondaryFollowUpTraining.reason}
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Önerilen Konu Başlıkları:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.secondaryFollowUpTraining.recommendedTopics.map((top, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {top}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Capstone Project */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" /> Portfolyo & CV Bitirme Projesi
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {result.capstoneProject.projectTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {result.capstoneProject.projectOverview}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.capstoneProject.techStackToUse.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <strong className="text-slate-700 dark:text-slate-300 block mb-1">
                  CV'ye Eklenecek Hazır Madde:
                </strong>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{result.capstoneProject.resumeBulletPoint}"
                </p>
              </div>
            </div>
          </div>

          {/* 30-60-90 Days Roadmap Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  30 - 60 - 90 Günlük Adım Adım Aksiyon Takvimi
                </h4>
                <p className="text-xs text-slate-500">
                  Haftalık {weeklyHours} saat çalışma temposuna göre optimize edilmiş aşamalar:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {result.roadmapTimeline.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {phase.phase}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    {phase.focus}
                  </h5>

                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    {phase.actionItems.map((item, aIdx) => (
                      <li key={aIdx}>{item}</li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-indigo-600 dark:text-indigo-400">Dönüm Noktası:</strong> {phase.milestoneGoal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Coach Advice Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Certifications (1 col) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Sektörel Sertifika Önerileri
              </span>
              <div className="space-y-2.5">
                {result.recommendedCertifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {cert.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cert.issuer} • <span className="text-indigo-600 dark:text-indigo-400 font-medium">{cert.valueInMarket}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Final Advice + Jump to Interview Button (2 cols) */}
            <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5 border border-indigo-900/60 shadow-md">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Baş Danışman & Koç Tavsiyesi
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "{result.coachAdvice}"
                </p>
              </div>

              {/* Call to Action: Jump to Interview Coach with target role */}
              <div className="pt-2 border-t border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-indigo-200">
                  Yeni hedefin: <strong className="text-white">{targetRole}</strong>. Bu role hazırlanmak için mülakat simülasyonunu başlat!
                </div>
                <button
                  type="button"
                  onClick={() => onSwitchToInterviewCoachWithRole(targetRole)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  <span>Bu Rol İçin Mülakat Soruları Üret</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
