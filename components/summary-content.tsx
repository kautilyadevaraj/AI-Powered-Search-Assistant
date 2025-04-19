"use client";

import React from "react";
import { SourceBadge } from "./source-badge";
import type { SearchResult } from "./search-page";

interface SummaryContentProps {
  summary: string;
  sources: SearchResult[];
}

// Define specific types for the parts
type TextPart = { type: "text"; content: string };
type SourcePart = { type: "source"; sourceNumber: number };
type ContentPart = TextPart | SourcePart;

export function SummaryContent({ summary, sources }: SummaryContentProps) {
  const sourceRegex = /\[Source (\d+)\]/g;

  // Process the summary to split text and identify source markers
  const parts: ContentPart[] = []; // Use the defined type for clarity and correctness
  let lastIndex = 0;
  let match;

  // Use a while loop to find all matches of the source pattern
  while ((match = sourceRegex.exec(summary)) !== null) {
    // If there's text before the current source marker, add it as a text part
    if (match.index > lastIndex) {
      parts.push({
        type: "text", // Explicitly use the literal string "text"
        content: summary.substring(lastIndex, match.index),
      });
    }

    // Add the source marker as a source part
    parts.push({
      type: "source", // Explicitly use the literal string "source"
      sourceNumber: Number.parseInt(match[1], 10),
    });

    // Update the last index to the end of the current match
    lastIndex = sourceRegex.lastIndex; // Use lastIndex property of the regex for next search start
  }

  // Add any remaining text after the last source marker
  if (lastIndex < summary.length) {
    parts.push({
      type: "text", // Explicitly use the literal string "text"
      content: summary.substring(lastIndex),
    });
  }

  // Function to process bold text within a string
  const processBoldText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const boldParts = [];
    let lastBoldIndex = 0;
    let boldMatch;

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastBoldIndex) {
        boldParts.push(text.substring(lastBoldIndex, boldMatch.index));
      }

      // Add the bold text as a strong element
      boldParts.push(
        <strong key={`bold-${boldMatch.index}`}>{boldMatch[1]}</strong>
      );

      lastBoldIndex = boldRegex.lastIndex; // Use lastIndex for bold regex too
    }

    // Add any remaining text after the last bold marker
    if (lastBoldIndex < text.length) {
      boldParts.push(text.substring(lastBoldIndex));
    }

    return boldParts;
  };

  // Now, group the parts into logical paragraphs.
  const processedParagraphs: ContentPart[][] = []; // Array of arrays of ContentPart
  let currentParagraphParts: ContentPart[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentParagraphParts.push(part);

    // Determine if this part (or the sequence ending here) should conclude a paragraph block.
    // A block ends if the current part is a source AND the next part is either text or doesn't exist.
    // This groups consecutive sources with the preceding text.
    const nextPart = parts[i + 1];
    const isEndOfBlock =
      part.type === "source" && (!nextPart || nextPart.type === "text");
    const isLastPart = i === parts.length - 1;

    if (isEndOfBlock || (isLastPart && currentParagraphParts.length > 0)) {
      processedParagraphs.push(currentParagraphParts);
      currentParagraphParts = []; // Start a new paragraph parts collection
    }
  }

  return (
    <div className="space-y-4">
      {processedParagraphs.map((paragraphParts, paragraphIndex) => (
        <p
          key={paragraphIndex}
          className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200"
        >
          {paragraphParts.map((part, index) => {
            if (part.type === "text") {
              // Type guard ensures 'content' is available
              return (
                <React.Fragment key={`text-${paragraphIndex}-${index}`}>
                  {processBoldText(part.content)}
                </React.Fragment>
              );
            } else {
              // Type guard ensures 'sourceNumber' is available
              return (
                <SourceBadge
                  key={`source-${paragraphIndex}-${index}`}
                  sourceNumber={part.sourceNumber}
                  sources={sources}
                />
              );
            }
          })}
        </p>
      ))}
    </div>
  );
}
