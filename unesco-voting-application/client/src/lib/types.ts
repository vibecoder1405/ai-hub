export interface HeritageSite {
  id: number;
  name: string;
  description: string;
  location: string;
  state: string;
  inscribedYear: number;
  category: string;
  imageUrl: string;
  rating: number;
  rank?: number;
}

export interface Vote {
  id: number;
  winnerId: number;
  loserId: number;
  winnerPrevRating: number;
  loserPrevRating: number;
  winnerNewRating: number;
  loserNewRating: number;
  timestamp: string;
  winnerName?: string;
  loserName?: string;
}

export interface Matchup {
  leftSite: HeritageSite;
  rightSite: HeritageSite;
  matchupId: number;
}

export interface VoteResult {
  vote: Vote;
  newMatchup: Matchup;
}

export interface Stats {
  totalVotes: number;
  totalSites: number;
}
