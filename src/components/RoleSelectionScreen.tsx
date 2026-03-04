import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function RoleSelectionScreen() {
  const setMyRole = useMutation(api.userProfiles.setMyRole);
  const [loading, setLoading] = useState<"piper" | "hirer" | null>(null);

  const choose = async (role: "piper" | "hirer") => {
    setLoading(role);
    try {
      await setMyRole({ role });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-4xl font-heading font-bold text-charcoal mb-3 text-center">
        Welcome to Highland Bagpiper
      </h2>
      <p className="text-gray-500 text-center mb-10 max-w-md">
        Tell us how you plan to use the platform so we can tailor your experience.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {/* Hirer card */}
        <button
          onClick={() => choose("hirer")}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all disabled:opacity-60"
        >
          <span className="text-5xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
          <div className="text-center">
            <h3 className="text-xl font-heading font-semibold text-charcoal group-hover:text-primary transition-colors">
              I'm hiring a Bagpiper
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              I need a piper for a wedding, funeral, or other event
            </p>
          </div>
          {loading === "hirer" && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          )}
        </button>

        {/* Piper card */}
        <button
          onClick={() => choose("piper")}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all disabled:opacity-60"
        >
          <span className="text-5xl">🎵</span>
          <div className="text-center">
            <h3 className="text-xl font-heading font-semibold text-charcoal group-hover:text-primary transition-colors">
              I'm a Bagpiper
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              I want to list my services and receive bookings
            </p>
          </div>
          {loading === "piper" && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          )}
        </button>
      </div>
    </div>
  );
}
