import { LandmarkIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-4">
            <LandmarkIcon className="h-6 w-6 text-primary mr-2" />
            <h2 className="font-bold text-xl text-white">HeritageRank</h2>
          </div>
          <p className="text-sm text-center max-w-lg mb-6">
            A platform to discover and rank UNESCO World Heritage Sites in India through collaborative voting.
          </p>
          
          <div className="border-t border-neutral-700 mt-4 pt-6 text-sm text-center w-full">
            <p>
              &copy; {new Date().getFullYear()} HeritageRank. All data sourced from UNESCO. 
              This is not an official UNESCO website.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
