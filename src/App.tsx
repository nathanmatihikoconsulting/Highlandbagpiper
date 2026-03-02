import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { BagpiperSearch } from "./components/BagpiperSearch";
import { BagpiperProfile } from "./components/BagpiperProfile";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "profile" | "dashboard" | "signin">("search");

  return (
    <div className="min-h-screen flex flex-col bg-stone">
      <header className="sticky top-0 z-10 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-heading font-semibold text-white tracking-wide">
              Highland Bagpiper
            </h1>
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => setCurrentView("search")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  currentView === "search"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Find Bagpipers
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
              <button
                onClick={() => setCurrentView("signin")}
                className="px-4 py-2 bg-white text-primary rounded font-medium text-sm hover:bg-stone transition-colors"
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

      <footer className="bg-charcoal text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm">&copy; 2024 Highland Bagpiper. Connecting tradition with celebration.</p>
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
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="text-5xl font-heading font-bold text-charcoal mb-4">
                Find a trusted Highland bagpiper
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                for ceremonies and events
              </p>
              <p className="text-gray-500">
                From weddings and funerals to commemorations and civic events.
              </p>
            </div>
            <BagpiperSearch />
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
