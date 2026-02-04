"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PipersPage() {
  const pipers = useQuery(api.pipers.listPublished, {});

  return (
    <main className="container">
      <h1>Bagpipers</h1>
      <p className="small">Browse published pipers. Send an enquiry to confirm availability.</p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {(pipers ?? []).map((p) => (
          <div key={p._id} className="card">
            <h3 style={{ marginTop: 0 }}>{p.displayName}</h3>
            <p className="small" style={{ marginTop: 0 }}>{p.baseLocation}</p>
            {p.fromPriceNZD ? <p className="small">From ${p.fromPriceNZD} NZD</p> : <p className="small">Pricing by arrangement</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/pipers/${p._id}`}><button className="btnSecondary">View profile</button></Link>
              <Link href={`/enquire/${p._id}`}><button className="btnPrimary">Send enquiry</button></Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
