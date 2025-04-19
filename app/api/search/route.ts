import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SearchResult {
  snippet: string;
  link: string;
  title?: string;
}

interface EnhancedResponse {
  summary: string;
  sources: SearchResult[];
  keyPoints?: string[];
  relatedQueries?: string[];
}

async function googleSearch(
  query: string,
  apiKey: string,
  cseId: string,
  numResults = 10
): Promise<SearchResult[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
    query
  )}&num=${numResults}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.statusText}`);
    }
    const data = await response.json();

    return (
      data.items?.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      })) || []
    );
  } catch (error) {
    console.error("Google Search Error:", error);
    return [];
  }
}

async function summarizeWithGemini(
  searchResults: SearchResult[],
  apiKey: string
): Promise<{
  summary: string;
  keyPoints: string[];
  relatedQueries: string[];
} | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
      },
    });

    const sourcesText = searchResults
      .map(
        (result, index) =>
          `[Source ${index + 1}] "${result.title}"\n${result.snippet}\nURL: ${
            result.link
          }`
      )
      .join("\n\n");

   const prompt = `
  Analyze the following search results and generate a structured response:

  ## Summary
  [Write 4-8 paragraphs separated by double newlines. Each paragraph should: 
   - Focus on one main idea
   - Begin with a topic sentence
   - Contain supporting details
   - Use [Source #] citations
  ]

  Example format:
  Paragraph 1 text... [Source 1][Source 3]\n\n
  Paragraph 2 text... [Source 2]\n\n
  Paragraph 3 text... [Source 4]\n\n
  Paragraph 4 text... (and so on)

  ## Key Points
  - [Bullet 1 with source][Source #]
  - [Bullet 2 with source][Source #]
  - [Bullet 3 with source][Source #]

  ## Related Queries
  - [Suggested question 1]
  - [Suggested question 2]
  - [Suggested question 3]

  Guidelines:
  1. Maintain exactly 3 sections with these exact headers
  2. Use \n\n only between paragraphs (no other newlines)
  3. Never use markdown except section headers
  4. Keep paragraphs between 3-5 sentences
  5. Include 2-4 source citations per paragraph
  6. You are not obligated to only return as many objects for each section as i have given... you decide how many you want to return.

  Search Results:
  ${sourcesText}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse Gemini response into structured data
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

function parseGeminiResponse(text: string): {
  summary: string;
  keyPoints: string[];
  relatedQueries: string[];
} {

  // Improved section detection using common header patterns
  const summarySection =
    text
      .match(/(?:#+\s*Summary|^)([\s\S]*?)(?=\n#+ |\n\d\.|\n- |$)/)?.[1]
      ?.trim() || "";

  const keyPointsSection =
    text.match(/#+\s*Key Points[\s\S]*?(?=#+|$)/)?.[0] || "";
  const keyPoints = keyPointsSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-/, "").trim());

  const queriesSection =
    text.match(/#+\s*Related Queries[\s\S]*?(?=#+|$)/)?.[0] || "";
  const relatedQueries = queriesSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-/, "").trim());

  return {
    summary: cleanMarkdown(summarySection),
    keyPoints:
      keyPoints.length > 0
        ? keyPoints
        : extractFallbackList(text, "key points"),
    relatedQueries:
      relatedQueries.length > 0
        ? relatedQueries
        : extractFallbackList(text, "related queries"),
  };
}

// Helper functions
function cleanMarkdown(text: string): string {
  return text
    .replace(/#+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFallbackList(text: string, sectionName: string): string[] {
  const regex = new RegExp(`${sectionName}[\\s\\S]*?(- .+?\\n)+`, "i");
  const match = text.match(regex);
  return match
    ? match[0]
        .split("\n- ")
        .slice(1)
        .map((item) => item.trim())
    : [];
}

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 5 } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const [googleApiKey, googleCseId, geminiApiKey] = [
      process.env.GOOGLE_API_KEY,
      process.env.GOOGLE_SEARCH_ENGINE_ID,
      process.env.GEMINI_API_KEY,
    ];

    if (!googleApiKey || !googleCseId || !geminiApiKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Perform search with increased result count
    const searchResults = await googleSearch(
      query,
      googleApiKey,
      googleCseId,
      maxResults
    );

    // Filter and rank results
    const filteredResults = searchResults
      .filter((result) => result.snippet && result.link)
      .slice(0, maxResults);

    if (filteredResults.length === 0) {
      return NextResponse.json({
        summary: "No relevant information found. Try rephrasing your query.",
        sources: [],
        keyPoints: [],
        relatedQueries: [],
      });
    }

    // Generate enhanced response
    const geminiResponse = await summarizeWithGemini(
      filteredResults,
      geminiApiKey
    );

    return NextResponse.json({
      summary: geminiResponse?.summary || "Unable to generate summary",
      keyPoints: geminiResponse?.keyPoints || [],
      relatedQueries: geminiResponse?.relatedQueries || [],
      sources: filteredResults.map((result) => ({
        title: result.title,
        snippet: result.snippet,
        link: result.link,
      })),
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
