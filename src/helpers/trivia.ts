import { IOpenTriviaQuestion, ICleanedQuestion } from "../models/Question";

export function formatTriviaQuestions(
  apiQuestions: IOpenTriviaQuestion[],
): ICleanedQuestion[] {
  return apiQuestions.map((q, index) => {
    // Combine correct and incorrect answers into one array
    const allOptions = [q.correct_answer, ...q.incorrect_answers];

    // Shuffle the options array using Fisher-Yates algorithm
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      // Clean, type-safe variable swap
      const temp = allOptions[i];
      allOptions[i] = allOptions[j];
      allOptions[j] = temp;
    }

    return {
      id: `q-${index}-${Date.now()}`,
      questionText: q.question,
      options: allOptions,
      correctAnswer: q.correct_answer,
      category: q.category,
      difficulty: q.difficulty,
    };
  });
}
