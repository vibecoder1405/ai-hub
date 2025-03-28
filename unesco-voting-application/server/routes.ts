import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateRatings } from "./elo";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all heritage sites (ordered by rank)
  app.get("/api/heritage-sites", async (req, res) => {
    try {
      const sites = await storage.getAllHeritageSites();
      // Sort by rank
      sites.sort((a, b) => {
        if (a.rank && b.rank) {
          return a.rank - b.rank;
        }
        return 0;
      });
      res.json(sites);
    } catch (error) {
      console.error("Error fetching heritage sites:", error);
      res.status(500).json({ message: "Failed to fetch heritage sites" });
    }
  });

  // Get a heritage site by ID
  app.get("/api/heritage-sites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const site = await storage.getHeritageSiteById(id);
      if (!site) {
        return res.status(404).json({ message: "Heritage site not found" });
      }

      res.json(site);
    } catch (error) {
      console.error("Error fetching heritage site:", error);
      res.status(500).json({ message: "Failed to fetch heritage site" });
    }
  });

  // Get heritage sites by category
  app.get("/api/heritage-sites/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const sites = await storage.getHeritageSitesByCategory(category);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching heritage sites by category:", error);
      res.status(500).json({ message: "Failed to fetch heritage sites by category" });
    }
  });

  // Get a random matchup for voting
  app.get("/api/matchups/random", async (req, res) => {
    try {
      const matchup = await storage.getRandomMatchup();
      res.json(matchup);
    } catch (error) {
      console.error("Error fetching random matchup:", error);
      res.status(500).json({ message: "Failed to fetch random matchup" });
    }
  });

  // Record a vote
  app.post("/api/votes", async (req, res) => {
    try {
      const voteSchema = z.object({
        winnerId: z.number(),
        loserId: z.number()
      });

      const result = voteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid vote data", 
          errors: result.error.format() 
        });
      }

      const { winnerId, loserId } = result.data;

      // Get the sites
      const winner = await storage.getHeritageSiteById(winnerId);
      const loser = await storage.getHeritageSiteById(loserId);

      if (!winner || !loser) {
        return res.status(404).json({ message: "One or both heritage sites not found" });
      }

      // Calculate new ratings
      const { newWinnerRating, newLoserRating } = updateRatings(
        winner.rating,
        loser.rating
      );

      // Record the vote
      const vote = await storage.recordVote({
        winnerId,
        loserId,
        winnerPrevRating: winner.rating,
        loserPrevRating: loser.rating,
        winnerNewRating: newWinnerRating,
        loserNewRating: newLoserRating
      });

      // Update the site ratings
      await storage.updateHeritageSite(winnerId, { rating: newWinnerRating });
      await storage.updateHeritageSite(loserId, { rating: newLoserRating });

      // Update rankings
      await storage.updateRankings();

      res.json({ vote, newMatchup: await storage.getRandomMatchup() });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(500).json({ message: "Failed to record vote" });
    }
  });

  // Get recent votes
  app.get("/api/votes/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const votes = await storage.getRecentVotes(limit);
      
      // For each vote, get the site names to enhance the response
      const votesWithSiteNames = await Promise.all(
        votes.map(async (vote) => {
          const winner = await storage.getHeritageSiteById(vote.winnerId);
          const loser = await storage.getHeritageSiteById(vote.loserId);
          
          return {
            ...vote,
            winnerName: winner?.name || "Unknown Site",
            loserName: loser?.name || "Unknown Site"
          };
        })
      );
      
      res.json(votesWithSiteNames);
    } catch (error) {
      console.error("Error fetching recent votes:", error);
      res.status(500).json({ message: "Failed to fetch recent votes" });
    }
  });

  // Get voting statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const totalVotes = await storage.getTotalVoteCount();
      const sites = await storage.getAllHeritageSites();
      
      res.json({
        totalVotes,
        totalSites: sites.length
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
