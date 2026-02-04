"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PiperProfile({ params }: { params: { id: string } }) {
  const piper = useQuery(api.pipers.getPublishedById, { piperId: params.id as any });
  const media = useQuery(api.media.listForPiper, { piperId: params.id as any });

  if (piper === undefined) return <main className="container"><p className="small">Loading…</p></main>;
  if (piper === null) return <main className="container"><p className="small">This profile is not available.</p></main>;

  return (
    <main className="container">
      <Link href="/pipers" className="small">← Back to search</Link>
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 0.6fr", marginTop: 10 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>{piper.displayName}</h1>
          <p className="small">{piper.baseLocation}</p>
          <hr className="hr" />
          <h3>About</h3>
          <p className="small">{piper.bio || "—"}</p>

          <h3>Services & pricing</h3>
          {(piper.services ?? []).length ? (
            <ul className="small">
              {piper.services.map((s: any, idx: number) => (
                <li key={idx}><b>{s.name}</b> — {s.desc} {s.fromPriceNZD ? `(from $${s.fromPriceNZD} NZD)` : ""}</li>
              ))}
            </ul>
          ) : <p className="small">Pricing by arrangement.</p>}

          <h3>Repertoire</h3>
          {(piper.repertoireGroups ?? []).length ? (
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {piper.repertoireGroups.map((g: any, idx: number) => (
                <div key={idx} className="card" style={{ background: "rgba(244,242,238,.55)" }}>
                  <b>{g.title}</b>
                  <ul className="small">
                    {(g.items ?? []).map((it: string, i2: number) => <li key={i2}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          ) : <p className="small">Requests welcome.</p>}

          <h3>Audio / video</h3>
          {(media ?? []).length ? (
            <ul className="small">
              {media!.map((m) => <li key={m._id}>{m.type.toUpperCase()}: {m.title}</li>)}
            </ul>
          ) : <p className="small">Media coming soon.</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Enquiry</h3>
          <p className="small">Send an enquiry to confirm availability and details directly with the piper.</p>
          <Link href={`/enquire/${piper._id}`}><button className="btnPrimary" style={{ width: "100%" }}>Send enquiry</button></Link>
        </div>
      </div>
    </main>
  );
}
