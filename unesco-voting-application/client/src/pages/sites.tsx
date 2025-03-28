import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, Leaf, Mountain, ThumbsUp } from "lucide-react";
import type { HeritageSite } from "@/lib/types";
import { getCategoryInfo } from "@/lib/format-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Sites() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

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

  // Render a category badge with the appropriate icon
  const renderCategoryBadge = (category: string) => {
    const { icon, className } = getCategoryInfo(category);
    
    return (
      <span className={`inline-flex items-center ${className} text-xs font-bold py-1 px-2 rounded-full`}>
        {icon === "landmark" && <Landmark className="inline-block mr-1 h-3 w-3" />}
        {icon === "leaf" && <Leaf className="inline-block mr-1 h-3 w-3" />}
        {icon === "mountain-sun" && <Mountain className="inline-block mr-1 h-3 w-3" />}
        {category}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            UNESCO World Heritage Sites in India
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
        
        {sitesQuery.isPending ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-8 w-full rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              No heritage sites found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <Card key={site.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-52">
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
                  <div className="absolute top-2 left-2">
                    {renderCategoryBadge(site.category)}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-white bg-opacity-90 text-gray-800 text-xs font-bold py-1 px-2 rounded-full">
                      Rank #{site.rank || "-"}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-xl mb-1 text-gray-800">{site.name}</h3>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {site.location}, {site.state} • Inscribed: {site.inscribedYear}
                  </p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {site.description}
                  </p>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                    onClick={() => voteMutation.mutate({ siteId: site.id })}
                    disabled={voteMutation.isPending}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Vote for this site
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}