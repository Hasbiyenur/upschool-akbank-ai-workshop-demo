import React from 'react';
import { Users, Award, BookOpen, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onGoToInterview: () => void;
  onGoToLearning: () => void;
}

export const Guide: React.FC<Props> = ({ onGoToInterview, onGoToLearning }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Kariyer & Mülakat Başarı Kılavuzu
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Doğru Soruları Bilmek & Doğru Eğitimi Seçmek
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Kariyer Koçu Ajanı, mülakatçının organizasyonel rolünü ve bugüne kadarki öğrenme geçmişini birleştirerek sana en stratejik avantajı kazandırır.
        </p>
      </div>

      {/* 2 Main Core Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mülakatçının Unvanı Neden Bu Kadar Kritik?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mülakatlarda yapılan en büyük hata, herkese aynı cevabı vermektir. 
              Bir <strong>HR Direktörü</strong> şirket kültürü, aidiyet ve kriz yönetimini ölçerken; bir <strong>Lead Architect</strong> edge-case'leri ve kod mimarisini inceler. Bir <strong>Engineering Manager</strong> ise teslimat hızı ve ekip içi mentorluğu sorgular.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside pt-1">
              <li>Unvanın gizli ajandasını çöz</li>
              <li>STAR metodolojisiyle ölçülebilir sonuçlar sun</li>
              <li>Mülakat sonunda soracağın ters sorularla iz bırak</li>
            </ul>
          </div>
          <button
            onClick={onGoToInterview}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <span>Mülakat Koçunu Dene</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Eğitim İçeriklerine Göre Sonraki Adım Stratejisi
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rastgele kurslar almak yerine, bitirdiğin eğitimlerin müfredatını analiz ediyoruz. Eksik kalan yetkinlik açıklarını (Skill Gap) tespit edip, hedefindeki rol için <strong>alman gereken spesifik eğitimi ve zorunlu müfredat modüllerini</strong> tasarlıyoruz.
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside pt-1">
              <li>Mevcut temellerini netleştir</li>
              <li>Hangi müfredat modüllerini araman gerektiğini öğren</li>
              <li>CV için capstone bitirme projesi tasarla</li>
            </ul>
          </div>
          <button
            onClick={onGoToLearning}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
          >
            <span>Eğitim Yol Haritanı Çıkar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STAR Method Explained */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          STAR Metodu ile Kusursuz Cevap Formülü
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 block">S - Durum (Situation)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Karşılaştığın problemi, ortamı ve projenin bağlamını kısaca ve somut olarak belirt.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 block">T - Görev (Task)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O durum karşısında senin bizzat üstlendiğin sorumluluk ve çözülmesi gereken hedef neydi?
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 block">A - Eylem (Action)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hangi adımları attın, hangi teknik araçları kullandın ve kararları nasıl verdin?
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-indigo-600 block">R - Sonuç (Result)</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Çıkan sonuç ne oldu? (Yüzde kaç hızlandı, ekip nasıl etkilendi, ne öğrendin?)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
