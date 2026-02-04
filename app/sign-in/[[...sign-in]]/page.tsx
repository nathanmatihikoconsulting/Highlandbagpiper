import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 420 }}>
        <SignIn />
      </div>
    </main>
  );
}
