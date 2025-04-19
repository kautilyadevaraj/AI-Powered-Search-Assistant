"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryContent } from "./summary-content";
import { KeyPointCard } from "./key-point-card";
import type { SearchResponse } from "./search-page";

interface SearchResultsProps {
  results: SearchResponse;
  currentQuery: string;
  onQuerySelect: (query: string) => void;
}

export function SearchResults({
  results,
  currentQuery,
  onQuerySelect,
}: SearchResultsProps) {
  const [expandedSources, setExpandedSources] = useState(false);

  return (
    <div className="mt-8 space-y-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="keyPoints">Key Points</TabsTrigger>
          <TabsTrigger value="relatedQueries">Related Queries</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                AI-generated summary based on search results for "{currentQuery}
                "
              </CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <SummaryContent
                summary={results.summary}
                sources={results.sources}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyPoints" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
              <CardDescription>
                Essential facts extracted from the search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {results.keyPoints.map((point, i) => (
                  <KeyPointCard
                    key={i}
                    point={point}
                    sources={results.sources}
                    index={i}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatedQueries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Queries</CardTitle>
              <CardDescription>Suggested follow-up questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.relatedQueries.map((query, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-sm py-1 px-3 cursor-pointer hover:bg-secondary/80"
                    onClick={() => onQuerySelect(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
              <CardDescription>
                Web sources used to generate the summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(expandedSources
                  ? results.sources
                  : results.sources.slice(0, 3)
                ).map((source, i) => (
                  <Card key={i} className="overflow-hidden p-0">
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="bg-primary/10 p-4 flex items-center justify-center md:w-16">
                        <span className="text-xl font-bold">{i + 1}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-medium mb-2 line-clamp-1">
                          {source.title || "Untitled Source"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {source.snippet}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <a
                            href={source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {source.link.length > 40
                              ? `${source.link.substring(0, 40)}...`
                              : source.link}
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {results.sources.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={() => setExpandedSources(!expandedSources)}
                    className="w-full"
                  >
                    {expandedSources ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show All Sources ({results.sources.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
