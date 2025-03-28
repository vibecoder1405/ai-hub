import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Landmark, Leaf, Mountain, ThumbsUp } from "lucide-react";
import type { HeritageSite } from "@/lib/types";
import { getCategoryInfo } from "@/lib/format-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FeaturedSites() {
  const { toast } = useToast();
  
  // Fetch all heritage sites
  const sitesQuery = useQuery<HeritageSite[]>({
    queryKey: ["/api/heritage-sites"],
  });
  
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

  // Get 4 random sites to feature
  const featuredSites = React.useMemo(() => {
    if (!sitesQuery.data) return [];
    
    // Shuffle the array and take first 4
    const shuffled = [...sitesQuery.data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [sitesQuery.data]);

  // Render a category badge with the appropriate icon
  const renderCategoryBadge = (category: string) => {
    const { icon, className } = getCategoryInfo(category);
    
    return (
      <span className={`bg-white bg-opacity-90 ${className} text-xs font-bold py-1 px-2 rounded-full`}>
        {icon === "landmark" && <Landmark className="inline-block mr-1 h-3 w-3" />}
        {icon === "leaf" && <Leaf className="inline-block mr-1 h-3 w-3" />}
        {icon === "mountain-sun" && <Mountain className="inline-block mr-1 h-3 w-3" />}
        {category}
      </span>
    );
  };

  return (
    <Card className="mt-8 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Explore More Heritage Sites</CardTitle>
        <Link href="/sites" className="text-primary hover:text-primary/80 font-medium text-sm">
          View All Sites
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sitesQuery.isPending ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="p-3">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-40 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Display featured sites
            featuredSites.map((site) => (
              <div 
                key={site.id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-40">
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1 text-gray-800">{site.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {site.state} • Inscribed: {site.inscribedYear}
                  </p>
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="text-gray-600 font-medium">Rank #{site.rank || "-"}</span>
                    <Link href={`/sites`} className="text-primary font-medium hover:text-primary/80 transition-colors">
                      Learn more <ChevronRight className="inline-block ml-1 h-3 w-3" />
                    </Link>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-8 flex items-center justify-center gap-1"
                    onClick={() => voteMutation.mutate({ siteId: site.id })}
                    disabled={voteMutation.isPending}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Vote for this site
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
