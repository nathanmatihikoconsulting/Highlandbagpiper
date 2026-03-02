import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { BagpiperSearch } from "./components/BagpiperSearch";
import { BagpiperProfile } from "./components/BagpiperProfile";
import { Dashboard } from "./components/Dashboard";
import { Button } from "@/components/ui/button";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "profile" | "dashboard" | "signin">("search");

  return (
    <div className="min-h-screen flex flex-col bg-stone">
      <header className="sticky top-0 z-10 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView("search")} className="flex-shrink-0">
              <img
                src="/wordmark.png"
                alt="Highland Bagpiper"
                className="h-7 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </button>
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => setCurrentView("search")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentView === "search"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Find a Piper
              </button>
              <button
                onClick={() => {
                  setCurrentView("search");
                  setTimeout(() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="px-4 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                How it Works
              </button>
              <Authenticated>
                <button
                  onClick={() => setCurrentView("profile")}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    currentView === "profile"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    currentView === "dashboard"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
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
              <Button
                onClick={() => setCurrentView("signin")}
                className="bg-white text-primary hover:bg-stone"
              >
                Sign In
              </Button>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content currentView={currentView} setCurrentView={setCurrentView} />
      </main>

      <footer className="bg-charcoal text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm">&copy; 2026 Highland Bagpiper. Connecting tradition with celebration.</p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

function Content({ currentView, setCurrentView }: {
  currentView: "search" | "profile" | "dashboard" | "signin";
  setCurrentView: (view: "search" | "profile" | "dashboard" | "signin") => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    if (loggedInUser && currentView === "signin") {
      setCurrentView("search");
    }
  }, [loggedInUser, currentView, setCurrentView]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        {currentView === "signin" ? (
          <div className="max-w-md mx-auto py-12">
            <h2 className="text-3xl font-heading font-bold text-center mb-2 text-charcoal">Welcome Back</h2>
            <p className="text-gray-600 text-center mb-8">Sign in to book a bagpiper or manage your profile</p>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <SignInForm />
            </div>
            <p className="text-center mt-4">
              <button
                onClick={() => setCurrentView("search")}
                className="text-teal hover:text-teal-hover hover:underline font-medium text-sm"
              >
                ← Back to browsing
              </button>
            </p>
          </div>
        ) : currentView === "search" ? (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8 py-10">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-heading font-bold text-charcoal mb-4 leading-tight">
                  Find a trusted Highland bagpiper
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  for ceremonies and events
                </p>
                <p className="text-gray-500">
                  From weddings and funerals to commemorations and civic events.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-80 h-96 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/hero-piper.png"
                  alt="Professional Highland bagpiper"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div id="search-section">
              <BagpiperSearch />
            </div>

            {/* How It Works */}
            <div id="how-it-works" className="py-4">
              <h2 className="text-3xl font-heading font-bold text-charcoal text-center mb-10">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Browse pipers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Search by location and event type to find an experienced bagpiper near you.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Send an enquiry</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Share your event details — date, location, and any special requests — directly with the piper.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Confirm your booking</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Finalise the details directly with the piper. Highland Bagpiper connects you with performers who understand the significance of the occasion.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
              <h2 className="text-2xl font-heading font-semibold mb-4 text-charcoal">Ready to book?</h2>
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
