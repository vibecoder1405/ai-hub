import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, ThumbsUp } from "lucide-react";
import type { HeritageSite } from "@/lib/types";
import { getRankChangeClass, getRankChangeIcon } from "@/lib/format-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Rankings() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  // Fetch all heritage sites
  const sitesQuery = useQuery<HeritageSite[]>({
    queryKey: ["/api/heritage-sites"],
  });

  // Filter sites by category and sort by ranking
  const filteredSites = React.useMemo(() => {
    if (!sitesQuery.data) return [];
    
    let filtered = [...sitesQuery.data];
    
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        site => site.category.toUpperCase() === selectedCategory.toUpperCase()
      );
    }
    
    // Sort by rank (or rating if rank is not available)
    return filtered.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return b.rating - a.rating;
    });
  }, [sitesQuery.data, selectedCategory]);

  // Vote for a site
  const voteMutation = useMutation({
    mutationFn: async ({ siteId }: { siteId: number }) => {
      // Fetch a random matchup to get another site
      const matchupRes = await apiRequest("GET", "/api/matchups/random");
      const matchupData = await matchupRes.json();
      
      // Find the other site that is not the selected one
      const otherSite = 
        matchupData.leftSite.id === siteId 
          ? matchupData.rightSite 
          : matchupData.leftSite;
      
      // Vote for the selected site vs the other site
      const res = await apiRequest("POST", "/api/votes", { 
        winnerId: siteId, 
        loserId: otherSite.id 
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/heritage-sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Show success toast
      toast({
        title: "Vote recorded!",
        description: `You voted for ${data.vote.winnerName || "this site"}.`,
      });
    },
    onError: (error) => {
      console.error("Vote error:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Heritage Site Rankings
          </h1>
          
          <div className="flex items-center space-x-4">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-600">
              Filter by:
            </label>
            <select
              id="category-filter"
              className="border border-gray-300 rounded-md py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="CULTURAL">Cultural</option>
              <option value="NATURAL">Natural</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
        </div>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">Current Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heritage Site</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sitesQuery.isPending ? (
                    // Loading state
                    Array.from({ length: 10 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
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
                        <td className="py-3 px-4"><Skeleton className="h-8 w-24 rounded" /></td>
                      </tr>
                    ))
                  ) : filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No heritage sites found in this category.
                      </td>
                    </tr>
                  ) : (
                    // Display sites
                    filteredSites.map((site, index) => {
                      // Simulate rank change (in real app would come from server)
                      const change = Math.floor(Math.random() * 5) - 2;
                      const changeClass = getRankChangeClass(change);
                      const changeIcon = getRankChangeIcon(change);

                      return (
                        <tr key={site.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">{site.rank || index + 1}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0 border border-gray-200">
                                <img 
                                  src={site.imageUrl} 
                                  alt={site.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback for missing images
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/800px-No-Image-Placeholder.svg.png";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{site.name}</div>
                                <div className="text-xs text-gray-500">
                                  {site.category} • {site.location}, {site.state}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">{site.rating.toFixed(0)}</td>
                          <td className="py-4 px-4">
                            <span className={`${changeClass} font-medium flex items-center`}>
                              {changeIcon === "arrow-up" && <ArrowUp className="mr-1 h-4 w-4" />}
                              {changeIcon === "arrow-down" && <ArrowDown className="mr-1 h-4 w-4" />}
                              {changeIcon === "minus" && <Minus className="mr-1 h-4 w-4" />}
                              {Math.abs(change)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button 
                              className="bg-primary hover:bg-primary/90 text-white text-xs px-3 h-8 flex items-center gap-1"
                              onClick={() => voteMutation.mutate({ siteId: site.id })}
                              disabled={voteMutation.isPending}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Vote
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}