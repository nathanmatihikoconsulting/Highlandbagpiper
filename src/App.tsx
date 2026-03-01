import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { BagpiperSearch } from "./components/BagpiperSearch";
import { BagpiperProfile } from "./components/BagpiperProfile";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "profile" | "dashboard">("search");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-700">🎵 Highland Bagpiper</h1>
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => setCurrentView("search")}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentView === "search" 
                    ? "bg-green-100 text-green-700" 
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                Find Bagpipers
              </button>
              <Authenticated>
                <button
                  onClick={() => setCurrentView("profile")}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentView === "profile" 
                      ? "bg-green-100 text-green-700" 
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentView === "dashboard" 
                      ? "bg-green-100 text-green-700" 
                      : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  Dashboard
                </button>
              </Authenticated>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <button
                onClick={() => setCurrentView("search")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Sign In
              </button>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content currentView={currentView} setCurrentView={setCurrentView} />
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Highland Bagpiper. Connecting tradition with celebration.</p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Content({ currentView, setCurrentView }: { 
  currentView: "search" | "profile" | "dashboard";
  setCurrentView: (view: "search" | "profile" | "dashboard") => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        {currentView === "search" ? (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Find the Perfect Bagpiper
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with professional bagpipers for weddings, funerals, and special events
              </p>
            </div>
            <BagpiperSearch />
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to book?</h2>
              <p className="text-gray-600 mb-6">Sign in to contact bagpipers and make bookings</p>
              <SignInForm />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <SignInForm />
          </div>
        )}
      </Unauthenticated>

      <Authenticated>
        {currentView === "search" && <BagpiperSearch />}
        {currentView === "profile" && <BagpiperProfile />}
        {currentView === "dashboard" && <Dashboard />}
      </Authenticated>
    </div>
  );
}
