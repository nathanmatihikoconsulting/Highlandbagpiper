import Link from "next/link";
import { EVENT_TYPES, NZ_REGIONS } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="container">
      <section className="card" style={{ padding: 28 }}>
        <div className="grid" style={{ gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>
              Find a trusted Highland bagpiper<br/>for ceremonies and events
            </h1>
            <p className="small" style={{ fontSize: "1.02rem" }}>
              From weddings and farewells to commemorations and civic events.
            </p>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr auto", marginTop: 16 }}>
              <div>
                <label className="label">Location</label>
                <select className="select" defaultValue="">
                  <option value="" disabled>Select a region</option>
                  {NZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Event type</label>
                <select className="select" defaultValue="">
                  <option value="" disabled>Select an event</option>
                  {EVENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div style={{ alignSelf: "end" }}>
                <Link href="/pipers"><button className="btnPrimary">View bagpipers</button></Link>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className="badge">Currently serving New Zealand</span>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(47,95,107,.08)", border: "0" }}>
            <h3 style={{ marginTop: 0 }}>How it works</h3>
            <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Browse pipers by location and event type</li>
              <li>Send an enquiry with your details</li>
              <li>Confirm directly with the piper</li>
            </ol>
            <hr className="hr" />
            <p id="how" className="small" style={{ margin: 0 }}>
              Choosing a piper is about trust, professionalism, and respect for the moment.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <CategoryCard title="Weddings" desc="Ceremony processional, recessional, guests arrival." />
          <CategoryCard title="Funerals & memorials" desc="Appropriate selections and professional care." />
          <CategoryCard title="ANZAC & commemorations" desc="Dawn services and civic remembrance." />
          <CategoryCard title="Civic & corporate" desc="Openings, parades, formal occasions." />
        </div>
      </section>
    </main>
  );
}

function CategoryCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className="small" style={{ margin: 0 }}>{desc}</p>
    </div>
  );
}
