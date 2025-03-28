import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Landmark, Leaf, Mountain } from "lucide-react";
import type { Matchup, VoteResult } from "@/lib/types";
import { getCategoryInfo } from "@/lib/format-utils";

export default function VotingMatchup() {
  const { toast } = useToast();
  const [voteCount, setVoteCount] = React.useState<number>(0);

  // Fetch a random matchup
  const matchupQuery = useQuery<Matchup>({
    queryKey: ["/api/matchups/random"],
    staleTime: Infinity,
  });

  // Record a vote
  const voteMutation = useMutation({
    mutationFn: async ({ winnerId, loserId }: { winnerId: number; loserId: number }) => {
      const res = await apiRequest("POST", "/api/votes", { winnerId, loserId });
      return res.json() as Promise<VoteResult>;
    },
    onSuccess: (data) => {
      // Update the current matchup
      queryClient.setQueryData(["/api/matchups/random"], data.newMatchup);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/heritage-sites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Increment vote count
      setVoteCount(prev => prev + 1);
      
      // Show success toast
      toast({
        title: "Vote recorded!",
        description: `You voted for ${data.vote.winnerName || "Unknown site"}.`,
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

  const handleVote = (winnerId: number, loserId: number) => {
    if (voteMutation.isPending) return;
    voteMutation.mutate({ winnerId, loserId });
  };

  const handleSkip = () => {
    if (matchupQuery.isPending || voteMutation.isPending) return;
    queryClient.refetchQueries({ queryKey: ["/api/matchups/random"] });
  };

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

  // Render a heritage site card
  const renderHeritageSiteCard = (site: any) => {
    if (!site) return <Skeleton className="h-[340px] w-full rounded-md" />;
    
    return (
      <div className="relative pb-3">
        <img 
          src={site.imageUrl} 
          alt={site.name} 
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <div className="absolute top-3 left-3">
          {renderCategoryBadge(site.category)}
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white bg-opacity-90 text-secondary-dark text-xs font-bold py-1 px-2 rounded-full">
            RANK #{site.rank || "-"}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1">{site.name}</h3>
        <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
          {site.description}
        </p>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">{site.location}, {site.state}</span>
          <span className="text-primary font-medium">Inscribed: {site.inscribedYear}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-md mb-8 p-6 border border-neutral-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-neutral-800">
          Which heritage site would you rather visit?
        </h2>
        <div className="text-sm text-neutral-500 font-medium">
          Vote #{voteCount}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
        {/* Left Site */}
        <Card 
          className={`md:col-span-3 bg-neutral-100 hover:border-primary transition cursor-pointer ${
            voteMutation.isPending ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={() => 
            matchupQuery.data && 
            handleVote(matchupQuery.data.leftSite.id, matchupQuery.data.rightSite.id)
          }
        >
          <CardContent className="p-4">
            {matchupQuery.isPending ? (
              <Skeleton className="h-[340px] w-full rounded-md" />
            ) : (
              renderHeritageSiteCard(matchupQuery.data?.leftSite)
            )}
          </CardContent>
        </Card>

        {/* VS indicator */}
        <div className="md:col-span-1 flex justify-center items-center">
          <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-white font-bold text-lg">VS</span>
          </div>
        </div>

        {/* Right Site */}
        <Card 
          className={`md:col-span-3 bg-neutral-100 hover:border-primary transition cursor-pointer ${
            voteMutation.isPending ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={() => 
            matchupQuery.data && 
            handleVote(matchupQuery.data.rightSite.id, matchupQuery.data.leftSite.id)
          }
        >
          <CardContent className="p-4">
            {matchupQuery.isPending ? (
              <Skeleton className="h-[340px] w-full rounded-md" />
            ) : (
              renderHeritageSiteCard(matchupQuery.data?.rightSite)
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={matchupQuery.isPending || voteMutation.isPending}
          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
        >
          Skip this match
        </Button>
      </div>
    </section>
  );
}
