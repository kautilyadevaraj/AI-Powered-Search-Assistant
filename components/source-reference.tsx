"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ExternalLink } from "lucide-react";
import type { SearchResult } from "./search-page";

interface SourceReferenceProps {
  sourceNumber: number;
  sources: SearchResult[];
}

export function SourceReference({
  sourceNumber,
  sources,
}: SourceReferenceProps) {
  const sourceIndex = sourceNumber - 1;
  const source =
    sourceIndex >= 0 && sourceIndex < sources.length
      ? sources[sourceIndex]
      : null;

  if (!source) {
    return <span>[Source {sourceNumber}]</span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
          [Source {sourceNumber}]
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{source.title || "Untitled Source"}</h4>
          <p className="text-sm">{source.snippet}</p>
          <a
            href={source.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visit source
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
