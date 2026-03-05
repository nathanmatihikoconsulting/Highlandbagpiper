import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { BagpiperSearch } from "./components/BagpiperSearch";
import { BagpiperProfile } from "./components/BagpiperProfile";
import { Dashboard } from "./components/Dashboard";
import { NotificationBell } from "./components/NotificationBell";
import { RoleSelectionScreen } from "./components/RoleSelectionScreen";
import { PiperProfilePage } from "./pages/PiperProfilePage";
import { Button } from "@/components/ui/button";

type View = "search" | "profile" | "dashboard" | "signin";

function pathToView(pathname: string): View {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/profile") return "profile";
  if (pathname === "/signin") return "signin";
  return "search";
}

function DashboardNavButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  const unread = useQuery(api.messages.getUnreadCount) ?? 0;
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded text-sm font-medium transition-colors ${
        active ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
      }`}
    >
      Dashboard
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

function AuthenticatedNavItems({
  currentView,
  navigate,
}: {
  currentView: View;
  navigate: (path: string) => void;
}) {
  const role = useQuery(api.userProfiles.getMyRole);
  return (
    <>
      {role !== "hirer" && (
        <button
          onClick={() => navigate("/profile")}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            currentView === "profile"
              ? "bg-white/20 text-white"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
        >
          My Profile
        </button>
      )}
      <DashboardNavButton
        active={currentView === "dashboard"}
        onClick={() => navigate("/dashboard")}
      />
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = pathToView(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-stone">
      <header className="sticky top-0 z-10 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex-shrink-0">
              <span className="font-heading text-white text-2xl font-semibold tracking-wide">
                Highland Bagpiper
              </span>
            </button>
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => navigate("/")}
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
                  navigate("/");
                  setTimeout(() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="px-4 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                How it Works
              </button>
              <Authenticated>
                <AuthenticatedNavItems currentView={currentView} navigate={navigate} />
              </Authenticated>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <NotificationBell />
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <Button
                onClick={() => navigate("/signin")}
                className="bg-white text-primary hover:bg-stone"
              >
                Sign In
              </Button>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/pipers/:id" element={<PiperProfilePage />} />
          <Route path="*" element={<Content currentView={currentView} navigate={navigate} />} />
        </Routes>
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

function Content({ currentView, navigate }: {
  currentView: View;
  navigate: (path: string) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const role = useQuery(api.userProfiles.getMyRole);

  useEffect(() => {
    if (loggedInUser && currentView === "signin") {
      navigate("/");
    }
  }, [loggedInUser, currentView, navigate]);

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
                onClick={() => navigate("/")}
                className="text-teal hover:text-teal-hover hover:underline font-medium text-sm"
              >
                ← Back to browsing
              </button>
            </p>
          </div>
        ) : currentView === "search" ? (
          <>
          <div className="flex flex-col lg:flex-row gap-10 py-8">
            <div className="flex-1 min-w-0 space-y-10">
              <div>
                <h1 className="text-5xl font-heading font-bold text-charcoal mb-3 leading-tight">
                  Find a trusted Highland bagpiper<br className="hidden md:block" /> for ceremonies and events
                </h1>
                <p className="text-gray-500">
                  From weddings and funerals to commemorations and civic events.
                </p>
              </div>

              <BagpiperSearch onSignInRequired={() => navigate("/signin")} />
            </div>

            <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 self-start sticky top-24">
              <div className="relative">
                <img
                  src="/piper-kevin.png"
                  alt="Highland Bagpiper"
                  className="w-full"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_40px_#EFEAE7]" />
              </div>
            </div>
          </div>

          <div id="how-it-works" className="py-4 mt-4">
            <h2 className="text-3xl font-heading font-bold text-charcoal text-center mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Browse pipers</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Search by location or bagpiper name to find an experienced bagpiper near you.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Send an enquiry</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Share your event details — date, location, and any special requests — directly with the piper.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Confirm your booking</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Finalise the details directly with the piper. Highland Bagpiper connects you with performers who understand the significance of the occasion.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
            <h2 className="text-2xl font-heading font-semibold mb-4 text-charcoal">Ready to book?</h2>
            <p className="text-gray-600 mb-6">Sign in to contact bagpipers and make bookings</p>
            <SignInForm />
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <SignInForm />
          </div>
        )}
      </Unauthenticated>

      <Authenticated>
        {role === undefined && (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        {role === null && <RoleSelectionScreen />}
        {role !== null && currentView === "search" && (
          <>
            <BagpiperSearch />
            <div id="how-it-works" className="py-4 mt-12">
              <h2 className="text-3xl font-heading font-bold text-charcoal text-center mb-10">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">1</div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Browse pipers</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Search by location and event type to find an experienced bagpiper near you.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">2</div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Send an enquiry</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Share your event details — date, location, and any special requests — directly with the piper.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">3</div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">Confirm your booking</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Finalise the details directly with the piper. Highland Bagpiper connects you with performers who understand the significance of the occasion.</p>
                </div>
              </div>
            </div>
          </>
        )}
        {role !== null && currentView === "profile" && <BagpiperProfile />}
        {role !== null && currentView === "dashboard" && <Dashboard />}
      </Authenticated>
    </div>
  );
}
