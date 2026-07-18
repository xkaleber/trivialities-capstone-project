import { NextResponse } from "next/server";
import { formatTriviaQuestions } from "@/helpers/trivia";
import { IOpenTriviaQuestion } from "@/models/Question";

export async function GET(request: Request) {
  try {
    // 1. Get query parameters from the URL (default to 10 questions, medium difficulty)
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get("amount") || "10";
    const difficulty = searchParams.get("difficulty") || "medium";
    const category = searchParams.get("category") || ""; // Add the new category ID parameter

    // 2. OpenTriviaDB API URL construction
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

    // Add difficulty if a specific layer is chosen
    if (difficulty !== "any") {
      apiUrl += `&difficulty=${difficulty}`;
    }

    // Dynamically append the category parameter only if it is passed from the client
    if (category) {
      apiUrl += `&category=${category}`;
    }

    // 3. Fetch data from OpenTriviaDB
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from OpenTriviaDB" },
        { status: 500 },
      );
    }

    const data = await response.json();

    // OpenTriviaDB returns a response_code of 0 when successful
    if (data.response_code !== 0) {
      return NextResponse.json(
        { error: "Trivia API returned an error code" },
        { status: 400 },
      );
    }

    // 4. Clean and shuffle the questions using helper
    const rawQuestions: IOpenTriviaQuestion[] = data.results;
    const formattedQuestions = formatTriviaQuestions(rawQuestions);

    // 5. Return the type-safe, shuffled trivia data to frontend
    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error("Trivia API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
