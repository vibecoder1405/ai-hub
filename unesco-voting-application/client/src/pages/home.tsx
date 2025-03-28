import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VotingMatchup from "@/components/voting-matchup";
import RankingsTable from "@/components/rankings-table";
import RecentActivity from "@/components/recent-activity";
import FeaturedSites from "@/components/featured-sites";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-200">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Head-to-head voting section */}
        <VotingMatchup />
        
        {/* Rankings and recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RankingsTable />
          <RecentActivity />
        </div>
        
        {/* Featured sites */}
        <FeaturedSites />
      </main>
      
      <Footer />
    </div>
  );
}
