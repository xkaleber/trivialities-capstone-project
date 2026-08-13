import { NextResponse } from "next/server";
import { formatTriviaQuestions } from "@/helpers/trivia";
import { IOpenTriviaQuestion } from "@/models/Question";

// ========================================================
// 🚀 INBOUND HTTP GET TRIVIA PROXY HANDLER
// ========================================================
// WHY: This serverless endpoint acts as a secure intermediary (proxy) between the frontend
// and the external OpenTriviaDB API. This prevents exposing API request structures directly
// on the client, normalizes parameters, and lets us sanitize data before it hits the UI components.
export async function GET(request: Request) {
  try {
    // ==========================================
    // 🔍 PHASE 1: URL QUERY PARAMETER EXTRACTION
    // ==========================================
    // WHY: Inbound requests carry parameters inside the URL string (e.g., ?category=9&difficulty=hard).
    // Creating a new URL helper instance allows us to easily read these key-value pairs.
    const { searchParams } = new URL(request.url);

    // Provide safe fallback default strings if the client omits any configurations
    const amount = searchParams.get("amount") || "10";
    const difficulty = searchParams.get("difficulty") || "medium";
    const category = searchParams.get("category") || ""; // Tracks the category ID chosen in GameSetup

    // ==========================================
    // 🛠️ PHASE 2: DYNAMIC ENDPOINT CONSTRUCTION
    // ==========================================
    // WHY: We use explicit backticks (``) instead of plain string quotes ("").
    // This allows the server to evaluate ${amount} and variables properly,
    // constructing a clean URL that the native fetch client can execute.
    let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;

    // Append difficulty metrics safely
    if (difficulty !== "any") {
      apiUrl += `&difficulty=${difficulty}`;
    }

    // Append category filtering constraints dynamically
    if (category) {
      apiUrl += `&category=${category}`;
    }

    // ==========================================
    // 🌐 PHASE 3: EXTERNAL API TRANSMISSION
    // ==========================================
    // WHY: Fires an outbound server-to-server request to OpenTriviaDB.
    // Doing this on the server avoids Cross-Origin Resource Sharing (CORS) blocks on the browser.
    // ✨ FIX: Removed the duplicate duplicate 'const response' block to fix variable collision compilation errors.
    const response = await fetch(apiUrl);

    // Check A: Handle networking connection drop-outs or external server downtime
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from OpenTriviaDB" },
        { status: 500 }, // 500 Internal Server Error: Indicates the upstream proxy blew up
      );
    }

    const data = await response.json();

    // Check B: Evaluate internal status protocol codes specific to OpenTriviaDB
    // WHY: OpenTriviaDB can successfully return an HTTP 200 status code but still contain an internal
    // error code inside its body payload (e.g., code 1 = No Results, code 2 = Invalid Parameter).
    if (data.response_code !== 0) {
      return NextResponse.json(
        { error: "Trivia API returned an error code" },
        { status: 400 }, // 400 Bad Request: The parameters combined yielded no viable question pools
      );
    }

    // ==========================================
    // 🧹 PHASE 4: DATA SANITIZATION & REFORMATTING
    // ==========================================
    // WHY: Raw OpenTriviaDB objects contain HTML escape characters (like &quot; or ') and keep
    // the correct answer completely separate from the incorrect answers array.
    // This helper parses out the HTML strings, combines and randomizes (shuffles) all options,
    // and structures them into a uniform structure the QuestionCard component natively expects.
    const rawQuestions: IOpenTriviaQuestion[] = data.results;
    const formattedQuestions = formatTriviaQuestions(rawQuestions);

    // ==========================================
    // 🎁 PHASE 5: EMIT CLEAN DATA TO FRONTEND
    // ==========================================
    // Return the clean, type-safe, and fully randomized trivia array payload directly to the user's browser.
    return NextResponse.json(formattedQuestions);
  } catch (error) {
    // ==========================================
    // 💥 ERROR HANDLING BOUNDARY
    // ==========================================
    // WHY: Prevents system level crashes from crashing the whole server or revealing architecture configurations to users.
    console.error("Trivia API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
