"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Admin() {
  const me = useQuery(api.users.me, {});
  const pending = useQuery(api.pipers.listPending, {});
  const publish = useMutation(api.pipers.setPublished);

  if (me === undefined) return <main className="container"><p className="small">Loading…</p></main>;
  if (!me) return <main className="container"><p className="small">Sign in required.</p></main>;
  if (me.role !== "admin") return <main className="container"><p className="small">Admin only.</p></main>;

  return (
    <main className="container">
      <h1>Admin — Publish profiles</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {(pending ?? []).map((p) => (
          <div key={p._id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.displayName}</h3>
            <p className="small">{p.baseLocation}</p>
            <button className="btnPrimary" onClick={() => publish({ piperId: p._id, isPublished: true })}>
              Publish
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
