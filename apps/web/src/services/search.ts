import { searchResults } from "@/lib/search";
import type { SearchResult } from "@/types";

export async function searchSite(query: string, limit = 20): Promise<SearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return searchResults(query, limit);
}
