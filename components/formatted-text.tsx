"use client";

import React from "react";
import { SourceBadge } from "./source-badge";
import type { SearchResult } from "./search-page";

interface FormattedTextProps {
  text: string;
  sources: SearchResult[];
}

export function FormattedText({ text, sources }: FormattedTextProps) {
  // Regular expression to match [Source X] patterns
  const sourceRegex = /\[Source (\d+)\]/g;

  // Split the text by source references
  const parts = [];
  let lastIndex = 0;
  let match;

  // Create a new regex object for each execution to avoid infinite loops
  const regex = new RegExp(sourceRegex);

  while ((match = regex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add the source reference
    parts.push({
      type: "source",
      sourceNumber: Number.parseInt(match[1], 10),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // Process markdown-like bold syntax (**text**)
  const processBoldText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const boldParts = [];
    let lastBoldIndex = 0;
    let boldMatch;

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastBoldIndex) {
        boldParts.push(text.substring(lastBoldIndex, boldMatch.index));
      }

      boldParts.push(
        <strong key={`bold-${boldMatch.index}`}>{boldMatch[1]}</strong>
      );

      lastBoldIndex = boldMatch.index + boldMatch[0].length;
    }

    if (lastBoldIndex < text.length) {
      boldParts.push(text.substring(lastBoldIndex));
    }

    return boldParts;
  };

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <React.Fragment key={`text-${index}`}>
              {processBoldText(part.content as string)}
            </React.Fragment>
          );
        } else {
          return (
            <SourceBadge
              key={`source-${index}`}
              sourceNumber={part.sourceNumber as number}
              sources={sources}
            />
          );
        }
      })}
    </>
  );
}
