"use client";

import type React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  query: string;
  setQuery: (query: string) => void;
}

export function SearchForm({
  onSearch,
  isLoading,
  query,
  setQuery,
}: SearchFormProps) {
  // Remove the useState line since we're now using props
  // const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Search with AI-Enhanced Results
        </h2>
        <p className="text-muted-foreground mt-2">
          Get comprehensive summaries, key points, and verified sources
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center space-x-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>
    </div>
  );
}
