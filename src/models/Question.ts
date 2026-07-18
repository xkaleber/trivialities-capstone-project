// 1. Matches the exact structure coming from the OpenTriviaDB API
export interface IOpenTriviaQuestion {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// 2. Matches the clean structure Next.js Frontend expects
export interface ICleanedQuestion {
  id: string;
  questionText: string;
  options: string[]; // Combines and shuffles all answers together
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}
