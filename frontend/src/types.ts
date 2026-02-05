export type ScoreBreakdown = {
  content_relevance: number;
  language_accuracy: number;
  structural_coherence: number;
};

export type GrammarErrorItem = {
  sentence: string;
  error: string;
  correction: string;
  explanation: string;
};

export type VocabularySuggestionItem = {
  original: string;
  suggestion: string;
  context: string;
};

export type EvaluationResult = {
  score: number;
  score_breakdown: ScoreBreakdown;
  excellent_sentences: string[];
  grammar_errors: GrammarErrorItem[];
  vocabulary_suggestions: VocabularySuggestionItem[];
  improvement_suggestions: string;
  model_essay: string;
};

export type EssayDetail = {
  id: number;
  created_at: string;
  exam_type: string;
  question_prompt?: string | null;
  ocr_text: string;
  evaluation_result: EvaluationResult;
};

export type EssayListItem = {
  id: number;
  created_at: string;
  exam_type: string;
  question_prompt?: string | null;
  final_score: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

