import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 420 }}>
        <SignUp />
      </div>
    </main>
  );
}
