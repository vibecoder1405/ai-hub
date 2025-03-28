import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import type { Vote, Stats } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format-utils";

export default function RecentActivity() {
  // Fetch recent votes
  const recentVotesQuery = useQuery<(Vote & { winnerName: string; loserName: string })[]>({
    queryKey: ["/api/votes/recent"],
  });

  // Fetch statistics
  const statsQuery = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <Card className="lg:col-span-1 bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentVotesQuery.isPending ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-start">
                  <Skeleton className="h-8 w-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full max-w-[250px] mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : recentVotesQuery.data?.length ? (
            // Display recent votes
            recentVotesQuery.data.map((vote) => (
              <div key={vote.id} className="p-3 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{vote.winnerName}</span> won against{" "}
                      <span className="font-medium">{vote.loserName}</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatRelativeTime(vote.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-neutral-500">
              No votes recorded yet. Be the first to vote!
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold text-md mb-3">Your Voting Stats</h3>
          <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">
                  {statsQuery.isPending ? (
                    <Skeleton className="h-7 w-8 mx-auto" />
                  ) : (
                    statsQuery.data?.totalVotes || 0
                  )}
                </div>
                <div className="text-xs text-neutral-600">Votes Cast</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">
                  {statsQuery.isPending ? (
                    <Skeleton className="h-7 w-8 mx-auto" />
                  ) : (
                    statsQuery.data?.totalSites || 0
                  )}
                </div>
                <div className="text-xs text-neutral-600">Sites Ranked</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">
                  {statsQuery.isPending ? (
                    <Skeleton className="h-7 w-8 mx-auto" />
                  ) : (
                    Math.min(7, Math.ceil((statsQuery.data?.totalVotes || 0) / 5))
                  )}
                </div>
                <div className="text-xs text-neutral-600">Days Active</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
