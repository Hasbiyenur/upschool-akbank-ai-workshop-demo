import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON parsing
function cleanAndParseJSON(text: string | undefined): any {
  if (!text) throw new Error('Modelden yanıt alınamadı.');
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Resilient wrapper with exponential backoff and fallback
async function generateWithRetry(params: {
  systemInstruction: string;
  prompt: string;
  responseSchema: any;
}) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: params.responseSchema,
          },
        });
        return cleanAndParseJSON(response.text);
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} with ${model} error:`, err?.message || err);
        const errMsg = String(err?.message || '');
        const isTransient =
          err?.status === 503 ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('429');

        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        } else {
          break; // Try next model in list
        }
      }
    }
  }

  throw lastError || new Error('Yapay zeka yanıt üretemedi. Lütfen tekrar deneyiniz.');
}

// 1. Generate Interview Questions by Interviewer Title
app.post('/api/generate-questions', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      industry = 'Teknoloji & Yazılım',
      interviewType = 'Teknik & Davranışsal Karma',
      experienceLevel = 'Mid-Level',
      additionalContext = ''
    } = req.body;

    if (!interviewerTitle || !targetRole) {
      return res.status(400).json({ error: 'Mülakatçı unvanı ve hedeflenen rol alanları zorunludur.' });
    }

    const systemInstruction = `Sen dünya çapında şirketlerde (FAANG, Fortune 500, hızlı büyüyen scale-up'lar) mülakatlar yönetmiş kıdemli bir İnsan Kaynakları Direktörü, Teknik Yönetici ve Baş Kariyer Koçusun.
Görevin: Kullanıcının belirteceği "${interviewerTitle}" unvanına sahip kişinin mülakatta soracağı soruları, o unvanın zihniyetini, neyi ölçmeye çalıştığını ve adayın nasıl başarılı olacağını en ince detayına kadar ortaya çıkarmaktır.

Unvanın Bakış Açısı:
Her unvan (ör. VP of Engineering vs. HR Manager vs. Senior Frontend Lead vs. Product Manager vs. CEO) farklı şeyleri önemser.
- Bir HR: Kültür, iletişim, kriz yönetimi, uzun vadeli bağlılık, değer uyumu arar.
- Bir Tech Lead / Senior Dev: Kod kalitesi, mimari kararlar, edge caseler, debug refleksleri, clean code arar.
- Bir Engineering Manager: Takım çalışması, mentorluk, teslimat disiplini, teknik borç yönetimi, çatışma çözümü arar.
- Bir VP / CTO / Kurucu: Ticari vizyon, ROI, ölçeklenebilirlik, stratejik düşünce arar.

Lütfen çıktıyı tam olarak belirtilen JSON şemasında ve Türkçe olarak döndür.`;

    const prompt = `Mülakat Bilgileri:
- Mülakatı Yapan Kişinin Unvanı: ${interviewerTitle}
- Adayın Başvurduğu / Hedeflediği Pozisyon: ${targetRole}
- Sektör / Şirket Tipi: ${industry}
- Mülakat Formatı: ${interviewType}
- Adayın Deneyim Seviyesi: ${experienceLevel}
${additionalContext ? `- Ek Açıklamalar / Şirket Notu: ${additionalContext}` : ''}

Lütfen bu unvandaki mülakatçının bu pozisyona yönelik soracağı en vurucu, en gerçekçi 6-8 soruyu ve stratejik analizleri üret.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        interviewerProfile: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            mindset: { type: Type.STRING, description: 'Bu unvandaki kişinin öncelikli zihniyeti ve motivasyonu' },
            evaluationPriorities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bu unvanın adayda aradığı ilk 3-4 kritik özellik'
            },
            redFlagsToAvoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bu unvanın hemen elediği veya olumsuz puan verdiği kırmızı bayraklar'
            },
            communicationToneRecommendation: { type: Type.STRING, description: 'Adayın bu unvana hitap ederken takınması gereken iletişim dili ve duruşu' }
          },
          required: ['title', 'mindset', 'evaluationPriorities', 'redFlagsToAvoid', 'communicationToneRecommendation']
        },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, description: 'Soru kategorisi (Teknik Derinlik, Davranışsal/Kültür, Kriz & Karar, vb.)' },
              difficulty: { type: Type.STRING, description: 'Kolay, Orta, Zor, Çok Zor' },
              question: { type: Type.STRING, description: 'Mülakatçının soracağı gerçek soru' },
              hiddenAgenda: { type: Type.STRING, description: 'Mülakatçının gizli amacı: Neden bunu soruyor, aslında neyi test ediyor?' },
              starStrategy: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.STRING, description: 'Durum tespiti nasıl kurulmalı' },
                  task: { type: Type.STRING, description: 'Hedef/sorumluluk nasıl belirtilmeli' },
                  action: { type: Type.STRING, description: 'Kullanıcının bizzat aldığı aksiyonlar' },
                  result: { type: Type.STRING, description: 'Ölçülebilir başarı ve öğrenilen ders' }
                },
                required: ['situation', 'task', 'action', 'result']
              },
              keyKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Cevapta kesinlikle geçmesi gereken anahtar kavramlar ve metrikler'
              },
              trapsAndMistakes: { type: Type.STRING, description: 'Yapılan en yaygın hata veya düşülen tuzak' },
              modelAnswer: { type: Type.STRING, description: 'Örnek güçlü, profesyonel model cevap' }
            },
            required: ['id', 'category', 'difficulty', 'question', 'hiddenAgenda', 'starStrategy', 'keyKeywords', 'trapsAndMistakes', 'modelAnswer']
          }
        },
        reverseQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: 'Adayın mülakatçıya sorabileceği soru' },
              whyItImpresses: { type: Type.STRING, description: 'Bu sorunun neden bu unvandaki kişiyi etkileyeceği' }
            },
            required: ['question', 'whyItImpresses']
          },
          description: 'Mülakatın sonunda adayın bu unvandaki kişiye sorabileceği yüksek etkili sorular'
        }
      },
      required: ['interviewerProfile', 'questions', 'reverseQuestions']
    };

    const parsedData = await generateWithRetry({
      systemInstruction,
      prompt,
      responseSchema
    });

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: error.message || 'Mülakat soruları oluşturulurken bir hata oluştu.' });
  }
});

// 2. Evaluate User Answer in Mock Practice Mode
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { interviewerTitle, targetRole, question, hiddenAgenda, userAnswer } = req.body;

    if (!userAnswer || !question || !interviewerTitle) {
      return res.status(400).json({ error: 'Soru, unvan ve verilen cevap zorunludur.' });
    }

    const systemInstruction = `Sen şu anda tam olarak "${interviewerTitle}" unvanına sahip mülakatçısın ve "${targetRole}" rolü için aday mülakatı yapıyorsun.
Sorduğun soru: "${question}"
Bu sorudaki amacın: "${hiddenAgenda || 'Yetkinliği test etmek'}"

Adayın cevabını bu unvanın gerçekçi gözlüğüyle değerlendir. Hem yapıcı ol hem de mülakatın gerçek ağırlığını hissettir.`;

    const prompt = `Adayın verdiği cevap:
"""
${userAnswer}
"""

Lütfen cevabı objektif ve derinlemesine değerlendir.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: '100 üzerinden başarı puanı (0-100)' },
        verdict: { type: Type.STRING, description: 'Kısa karar (Ör: Güçlü ve İkna Edici / Gelişime Açık / Çok Yüzeysel / Mükemmel)' },
        interviewerPerspectiveFeedback: {
          type: Type.STRING,
          description: 'Bir ' + interviewerTitle + ' olarak dürüst, yapıcı ve doğrudan geri bildirimin'
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Cevapta öne çıkan iyi ve takdir edilen noktalar'
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Eksik kalan, havada kalan veya şüphe uyandıran noktalar'
        },
        missingKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Kullanılması faydalı olacak sektör terimleri veya metrikler'
        },
        improvedVersion: {
          type: Type.STRING,
          description: 'Adayın verdiği cevabın aynı içerikle STAR metoduna göre profesyonelce yeniden yazılmış hali'
        }
      },
      required: ['score', 'verdict', 'interviewerPerspectiveFeedback', 'strengths', 'weaknesses', 'missingKeywords', 'improvedVersion']
    };

    const parsedData = await generateWithRetry({
      systemInstruction,
      prompt,
      responseSchema
    });

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ error: error.message || 'Cevap değerlendirilirken bir hata oluştu.' });
  }
});

// 3. Recommend Next Training & Career Learning Pathway based on completed training contents
app.post('/api/recommend-next-learning', async (req, res) => {
  try {
    const {
      completedTrainings = [],
      currentRole = 'Yazılım Geliştirici',
      targetRole = 'Senior Pozisyon / Uzmanlık',
      focusArea = 'Derinleşme & Mimari',
      weeklyHours = 6,
      additionalNotes = ''
    } = req.body;

    if (!completedTrainings || completedTrainings.length === 0) {
      return res.status(400).json({ error: 'Lütfen en az bir tamamlanan eğitim içeriği girin.' });
    }

    const trainingsText = completedTrainings
      .map((t: any, index: number) => `Eğitim #${index + 1}: ${t.title || 'İsimsiz Eğitim'}\nİçerik/Kapsam/Kazanımlar:\n${t.content || ''}`)
      .join('\n\n---\n\n');

    const systemInstruction = `Sen alanında kıdemli bir Kariyer Baş Danışmanı ve Kıdemli Eğitim Müfredatı Mimarı/Teknoloji Liderisin.
Kullanıcı sana bugüne kadar tamamladığı eğitimlerin başlıklarını ve detaylı içeriklerini sunuyor.
Senin görevin:
1. Kullanıcının MEVCUT EĞİTİMLERİNİ titizlikle sentezlemek (ne seviyeye ulaştı, hangi temeller sağlam?).
2. Kullanıcının HEDEFİNE (${targetRole}) varması için aradaki kritik yetkinlik açıklarını (Skill Gap) tespit etmek.
3. "BİR SONRAKİ ADIM İÇİN NASIL BİR EĞİTİM ALMASI GEREKTİĞİNİ" somut, net ve uygulanabilir bir şekilde tasarlamak. Genel-geçer "kurs alın" demek yerine; eğitimin tam başlığı, neden bu eğitimin şart olduğu, eğitimin içinde mutlaka yer alması gereken çekirdek müfredat modülleri, yapması gereken portfolyo projesi ve 30-60-90 günlük planı sunmak.`;

    const prompt = `Kullanıcı Bilgileri:
Mevcut Rol/Durum: ${currentRole}
Hedeflenen Rol/Kariyer Seviyesi: ${targetRole}
Öncelikli Odak Alanı: ${focusArea}
Haftalık Ayırabileceği Zaman: ${weeklyHours} saat
Ek Notlar: ${additionalNotes || 'Yok'}

Kullanıcının Katıldığı / Tamamladığı Eğitimler ve İçerikleri:
${trainingsText}

Lütfen bu içerikleri titizlikle analiz et ve kullanıcının bir sonraki adımda alması gereken en doğru eğitimi ve yol haritasını JSON formatında çıkar.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        currentSynthesis: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Mevcut eğitimlerin kazandırdığı genel profil ve yetkinlik düzeyi' },
            strongFoundations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Kullanıcının tamamladığı eğitimlerle kanıtladığı güçlü beceriler'
            },
            reachedLevel: { type: Type.STRING, description: 'Ör: Junior+, Mid-Level Başlangıcı, vb.' }
          },
          required: ['summary', 'strongFoundations', 'reachedLevel']
        },
        gapAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillArea: { type: Type.STRING, description: 'Geliştirilmesi gereken alan/konu' },
              currentStatus: { type: Type.STRING, description: 'Kullanıcının şu anki durumu' },
              targetRequirement: { type: Type.STRING, description: 'Hedef rolün gerektirdiği seviye' },
              criticality: { type: Type.STRING, description: 'Kritik, Önemli veya Tamamlayıcı' }
            },
            required: ['skillArea', 'currentStatus', 'targetRequirement', 'criticality']
          },
          description: 'Hedefe ulaşmak için eksik kalan temel ve ileri düzey yetkinlikler'
        },
        primaryRecommendedNextTraining: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Alınması gereken bir sonraki ana eğitimin ideal başlığı' },
            badge: { type: Type.STRING, description: 'Örnek: 1. Öncelikli Adım / Olmazsa Olmaz' },
            whyThisTraining: { type: Type.STRING, description: 'Neden tam olarak bu eğitim seçilmeli, önceki eğitimlerin üzerine nasıl oturuyor?' },
            idealDuration: { type: Type.STRING, description: 'Örnek: 6-8 Hafta (Haftada 6-8 saat)' },
            targetOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bu eğitim bittiğinde kazanılacak somut çıktılar'
            },
            curriculumSyllabus: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  moduleNumber: { type: Type.INTEGER },
                  moduleTitle: { type: Type.STRING },
                  keyTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  practicalTask: { type: Type.STRING, description: 'Bu modülün somut uygulama ödevi/çıktısı' }
                },
                required: ['moduleNumber', 'moduleTitle', 'keyTopics', 'practicalTask']
              },
              description: 'Eğitim seçerken müfredatında kesinlikle bulunması gereken modüller'
            },
            whatToLookForWhenChoosingCourse: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Kursa kaydolurken veya eğitmen seçerken aranacak kriterler (ör: hands-on, live code review, vb.)'
            }
          },
          required: ['title', 'badge', 'whyThisTraining', 'idealDuration', 'targetOutcomes', 'curriculumSyllabus', 'whatToLookForWhenChoosingCourse']
        },
        secondaryFollowUpTraining: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Ana eğitimin ardından veya paralelinde önerilen destekleyici eğitim' },
            reason: { type: Type.STRING, description: 'Destekleyici eğitimin rolü ve katkısı' },
            recommendedTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'reason', 'recommendedTopics']
        },
        capstoneProject: {
          type: Type.OBJECT,
          properties: {
            projectTitle: { type: Type.STRING, description: 'Yeni eğitimi pekiştirecek ve CV’ye konacak bitirme projesi' },
            projectOverview: { type: Type.STRING, description: 'Projenin senaryosu ve iş problemi' },
            techStackToUse: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Kullanılması gereken teknolojiler ve kütüphaneler'
            },
            resumeBulletPoint: { type: Type.STRING, description: 'Bu projenin CV’de nasıl parlayacağı (örnek CV maddesi)' }
          },
          required: ['projectTitle', 'projectOverview', 'techStackToUse', 'resumeBulletPoint']
        },
        roadmapTimeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phase: { type: Type.STRING, description: 'Ör: Aşama 1 (1-30 Gün)' },
              focus: { type: Type.STRING },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              milestoneGoal: { type: Type.STRING }
            },
            required: ['phase', 'focus', 'actionItems', 'milestoneGoal']
          }
        },
        recommendedCertifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              issuer: { type: Type.STRING },
              valueInMarket: { type: Type.STRING }
            },
            required: ['name', 'issuer', 'valueInMarket']
          }
        },
        coachAdvice: { type: Type.STRING, description: 'Kariyer koçundan motive edici ve stratejik kapanış tavsiyesi' }
      },
      required: [
        'currentSynthesis',
        'gapAnalysis',
        'primaryRecommendedNextTraining',
        'secondaryFollowUpTraining',
        'capstoneProject',
        'roadmapTimeline',
        'recommendedCertifications',
        'coachAdvice'
      ]
    };

    const parsedData = await generateWithRetry({
      systemInstruction,
      prompt,
      responseSchema
    });

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating learning recommendation:', error);
    return res.status(500).json({ error: error.message || 'Eğitim tavsiyesi oluşturulurken bir hata oluştu.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
