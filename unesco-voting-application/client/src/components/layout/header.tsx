import React from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LandmarkIcon } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center cursor-pointer">
          <div className="mr-2 text-primary">
            <LandmarkIcon className="h-6 w-6" />
          </div>
          <h1 className="font-bold text-xl md:text-2xl text-gray-800">HeritageRank</h1>
        </Link>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-gray-600'}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/rankings" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/rankings' ? 'text-primary' : 'text-gray-600'}`}>
                Rankings
              </Link>
            </li>
            <li>
              <Link href="/sites" className={`text-sm font-medium hover:text-primary transition-colors ${location === '/sites' ? 'text-primary' : 'text-gray-600'}`}>
                All Sites
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center">
          <button 
            className="md:hidden focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-3 shadow-lg">
          <ul className="space-y-3">
            <li>
              <Link href="/" className={`block py-2 text-sm font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-gray-600'}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/rankings" className={`block py-2 text-sm font-medium hover:text-primary transition-colors ${location === '/rankings' ? 'text-primary' : 'text-gray-600'}`}>
                Rankings
              </Link>
            </li>
            <li>
              <Link href="/sites" className={`block py-2 text-sm font-medium hover:text-primary transition-colors ${location === '/sites' ? 'text-primary' : 'text-gray-600'}`}>
                All Sites
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
