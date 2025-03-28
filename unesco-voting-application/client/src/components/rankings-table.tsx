import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { HeritageSite } from "@/lib/types";
import { getRankChangeClass, getRankChangeIcon } from "@/lib/format-utils";

export default function RankingsTable() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [displayLimit, setDisplayLimit] = React.useState<number>(5);

  // Fetch all heritage sites
  const sitesQuery = useQuery<HeritageSite[]>({
    queryKey: ["/api/heritage-sites"],
  });

  // Filter sites by category
  const filteredSites = React.useMemo(() => {
    if (!sitesQuery.data) return [];
    
    if (selectedCategory === "ALL") {
      return sitesQuery.data;
    }
    
    return sitesQuery.data.filter(
      site => site.category.toUpperCase() === selectedCategory.toUpperCase()
    );
  }, [sitesQuery.data, selectedCategory]);

  // Sites to display based on limit
  const displayedSites = filteredSites.slice(0, displayLimit);

  return (
    <Card className="col-span-1 lg:col-span-2 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Current Rankings</CardTitle>
        <div className="text-sm">
          <select
            className="border border-neutral-300 rounded py-1 px-2 focus:outline-none focus:border-primary text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="CULTURAL">Cultural</option>
            <option value="NATURAL">Natural</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-700">Rank</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-700">Heritage Site</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-700">Score</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-700">Change</th>
              </tr>
            </thead>
            <tbody>
              {sitesQuery.isPending ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-neutral-200">
                    <td className="py-3 px-4"><Skeleton className="h-5 w-5" /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-md mr-3" />
                        <div>
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-12" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-8" /></td>
                  </tr>
                ))
              ) : displayedSites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-neutral-500">
                    No heritage sites found in this category.
                  </td>
                </tr>
              ) : (
                // Display sites
                displayedSites.map((site) => {
                  // Simulate rank change (in real app would come from server)
                  const change = Math.floor(Math.random() * 5) - 2;
                  const changeClass = getRankChangeClass(change);
                  const changeIcon = getRankChangeIcon(change);
                  
                  return (
                    <tr key={site.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm font-semibold">{site.rank}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                            <img 
                              src={site.imageUrl} 
                              alt={site.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <div className="font-medium">{site.name}</div>
                            <div className="text-xs text-neutral-500">
                              {site.category} • {site.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{site.rating}</td>
                      <td className="py-3 px-4">
                        <span className={`${changeClass} font-medium flex items-center`}>
                          {changeIcon === "arrow-up" && <ArrowUp className="mr-1 h-4 w-4" />}
                          {changeIcon === "arrow-down" && <ArrowDown className="mr-1 h-4 w-4" />}
                          {changeIcon === "minus" && <Minus className="mr-1 h-4 w-4" />}
                          {Math.abs(change)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          {displayLimit < filteredSites.length ? (
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => setDisplayLimit(filteredSites.length)}
            >
              View All Rankings
            </Button>
          ) : displayLimit > 5 && (
            <Button 
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
              onClick={() => setDisplayLimit(5)}
            >
              Show Less
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
