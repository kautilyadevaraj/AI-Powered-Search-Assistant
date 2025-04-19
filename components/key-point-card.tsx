"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "./source-badge";
import type { SearchResult } from "./search-page";

interface KeyPointCardProps {
  point: string;
  sources: SearchResult[];
  index: number;
}

export function KeyPointCard({ point, sources, index }: KeyPointCardProps) {
  // Regular expression to match [Source X] patterns
  const sourceRegex = /\[Source (\d+)\]/g;

  // Split the text by source references
  const parts = [];
  let lastIndex = 0;
  let match;

  // Create a new regex object for each execution
  const regex = new RegExp(sourceRegex);

  while ((match = regex.exec(point)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: point.substring(lastIndex, match.index),
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
  if (lastIndex < point.length) {
    parts.push({
      type: "text",
      content: point.substring(lastIndex),
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

  // Generate a gradient background based on the index
  const gradients = [
    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
    "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40",
    "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/40 dark:to-teal-950/40",
    "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <Card
      className={`overflow-hidden p-0 border-t-4 ${
        index % 4 === 0
          ? "border-t-blue-500"
          : index % 4 === 1
          ? "border-t-purple-500"
          : index % 4 === 2
          ? "border-t-green-500"
          : "border-t-amber-500"
      }`}
    >
      <CardContent className={`p-4 h-full ${gradient}`}>
        <div className="flex items-start">
          <div className="flex-1">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
