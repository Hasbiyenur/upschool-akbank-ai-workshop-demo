export interface InterviewerProfile {
  title: string;
  mindset: string;
  evaluationPriorities: string[];
  redFlagsToAvoid: string[];
  communicationToneRecommendation: string;
}

export interface StarStrategy {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  hiddenAgenda: string;
  starStrategy: StarStrategy;
  keyKeywords: string[];
  trapsAndMistakes: string;
  modelAnswer: string;
}

export interface ReverseQuestion {
  question: string;
  whyItImpresses: string;
}

export interface InterviewGenerationResult {
  interviewerProfile: InterviewerProfile;
  questions: InterviewQuestion[];
  reverseQuestions: ReverseQuestion[];
}

export interface AnswerEvaluation {
  score: number;
  verdict: string;
  interviewerPerspectiveFeedback: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvedVersion: string;
}

export interface CompletedTrainingInput {
  id: string;
  title: string;
  content: string;
  platform?: string;
  durationHours?: string;
}

export interface CurriculumModule {
  moduleNumber: number;
  moduleTitle: string;
  keyTopics: string[];
  practicalTask: string;
}

export interface PrimaryRecommendedNextTraining {
  title: string;
  badge: string;
  whyThisTraining: string;
  idealDuration: string;
  targetOutcomes: string[];
  curriculumSyllabus: CurriculumModule[];
  whatToLookForWhenChoosingCourse: string[];
}

export interface SecondaryFollowUpTraining {
  title: string;
  reason: string;
  recommendedTopics: string[];
}

export interface CapstoneProject {
  projectTitle: string;
  projectOverview: string;
  techStackToUse: string[];
  resumeBulletPoint: string;
}

export interface GapAnalysisItem {
  skillArea: string;
  currentStatus: string;
  targetRequirement: string;
  criticality: string;
}

export interface RoadmapPhase {
  phase: string;
  focus: string;
  actionItems: string[];
  milestoneGoal: string;
}

export interface CertificationRecommendation {
  name: string;
  issuer: string;
  valueInMarket: string;
}

export interface LearningPathwayResult {
  currentSynthesis: {
    summary: string;
    strongFoundations: string[];
    reachedLevel: string;
  };
  gapAnalysis: GapAnalysisItem[];
  primaryRecommendedNextTraining: PrimaryRecommendedNextTraining;
  secondaryFollowUpTraining: SecondaryFollowUpTraining;
  capstoneProject: CapstoneProject;
  roadmapTimeline: RoadmapPhase[];
  recommendedCertifications: CertificationRecommendation[];
  coachAdvice: string;
}
