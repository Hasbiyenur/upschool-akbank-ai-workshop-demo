import React, { useState, useEffect } from 'react';
import { InterviewQuestion, AnswerEvaluation } from '../types';
import { X, Mic, MicOff, Send, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Key, Lightbulb, Loader2, Copy, Check } from 'lucide-react';

interface Props {
  question: InterviewQuestion;
  interviewerTitle: string;
  targetRole: string;
  onClose: () => void;
}

export const MockPracticeModal: React.FC<Props> = ({
  question,
  interviewerTitle,
  targetRole,
  onClose
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedImproved, setCopiedImproved] = useState(false);

  // Speech Recognition setup if supported
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isRecording) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'tr-TR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch {
        setIsRecording(false);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma (Speech-to-Text) özelliğini desteklemiyor. Lütfen cevabınızı metin olarak yazınız.');
      return;
    }
    setIsRecording(!isRecording);
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      setError('Lütfen önce bir cevap yazın veya mikrofon ile konuşun.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          question: question.question,
          hiddenAgenda: question.hiddenAgenda,
          userAnswer: userAnswer.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Cevap değerlendirilemedi.');
      }

      const data = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedImproved(true);
    setTimeout(() => setCopiedImproved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Canlı Mülakat Simülatörü
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Değerlendiren: <strong className="text-indigo-600 dark:text-indigo-400">{interviewerTitle}</strong> ({targetRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Question Box */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">
              <span>{question.category}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                {question.difficulty}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
              "{question.question}"
            </h4>
            <div className="mt-2.5 text-xs text-indigo-800/80 dark:text-indigo-300/80 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                <strong>Gizli Amaç:</strong> {question.hiddenAgenda}
              </span>
            </div>
          </div>

          {/* User Answer Textarea & Voice input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cevabınız (Kendi kelimelerinizle açıklayın):
              </label>
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Dinleniyor (Durdur)
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Sesle Konuşarak Cevapla
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Örnek: Bu durumda geçmiş projemde benzer bir krizle karşılaştığımda öncelikle paydaşlarla iletişime geçtim..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
            />
            
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{userAnswer.length} karakter</span>
              <span>İpucu: STAR formatını (Durum, Görev, Eylem, Sonuç) kullanmaya çalışın.</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Evaluate Button */}
          <button
            onClick={handleEvaluate}
            disabled={isLoading || !userAnswer.trim()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {interviewerTitle} Gözüyle Analiz Ediliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Cevabımı Değerlendir
              </>
            )}
          </button>

          {/* Evaluation Results */}
          {evaluation && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              {/* Score banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner ${
                    evaluation.score >= 80 ? 'bg-emerald-600' : evaluation.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    {evaluation.score}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Puan & Karar</span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-base">
                      {evaluation.verdict}
                    </h5>
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500 dark:text-slate-400 hidden sm:block">
                  100 Üzerinden Puanlama
                </div>
              </div>

              {/* Direct Feedback from Title */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {interviewerTitle} Perspektifinden Geri Bildirim:
                </h5>
                <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  "{evaluation.interviewerPerspectiveFeedback}"
                </p>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Güçlü Noktalar
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1.5">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Eksik / Geliştirilebilir Noktalar
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {evaluation.weaknesses.map((wk, i) => (
                      <li key={i}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing keywords */}
              {evaluation.missingKeywords && evaluation.missingKeywords.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                    <Key className="w-3.5 h-3.5 text-indigo-500" /> Eklenmesi Tavsiye Edilen Terimler / Metrikler:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Answer */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 relative border border-slate-800 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" /> STAR Metoduna Göre Parlatılmış İdeal Versiyon
                  </span>
                  <button
                    onClick={() => copyToClipboard(evaluation.improvedVersion)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {copiedImproved ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedImproved ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {evaluation.improvedVersion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
