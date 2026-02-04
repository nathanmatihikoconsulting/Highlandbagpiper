"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PiperDashboard() {
  const { user } = useUser();
  const me = useQuery(api.users.me, {});
  const ensure = useMutation(api.users.ensureUser);
  const piper = useQuery(api.pipers.getMine, {});
  const upsert = useMutation(api.pipers.upsertMine);

  const [displayName, setDisplayName] = useState("");
  const [baseLocation, setBaseLocation] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (me === null && user) {
      // create user row if missing
      ensure({ role: "piper" });
    }
  }, [me, user, ensure]);

  useEffect(() => {
    if (piper) {
      setDisplayName(piper.displayName ?? "");
      setBaseLocation(piper.baseLocation ?? "");
      setBio(piper.bio ?? "");
      setContactEmail(piper.contactEmail ?? user?.primaryEmailAddress?.emailAddress ?? "");
    } else if (user?.primaryEmailAddress?.emailAddress) {
      setContactEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [piper, user]);

  return (
    <main className="container">
      <h1>Piper dashboard</h1>
      <p className="small">Create your profile. An admin will publish it when ready.</p>

      <div className="card">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="label">Display name</label>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="label">Base location</label>
            <input className="input" value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} placeholder="e.g., Wellington, NZ" />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Bio</label>
          <textarea className="textarea" rows={6} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Enquiry email (where clients are sent)</label>
          <input className="input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button
            className="btnPrimary"
            onClick={async () => {
              await upsert({ displayName, baseLocation, bio, contactEmail });
              alert("Saved. An admin can publish your profile when ready.");
            }}
          >
            Save profile
          </button>
          {piper?.isPublished ? <span className="badge">Published</span> : <span className="badge">Pending publish</span>}
        </div>
      </div>
    </main>
  );
}
