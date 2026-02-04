import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="header">
      <div className="headerInner">
        <div className="brand">
          <Link href="/">Highland Bagpiper</Link>
        </div>
        <nav className="nav">
          <Link href="/pipers">Find a piper</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/faqs">FAQs</Link>
          <SignedOut>
            <Link href="/sign-in" className="badge">I am a bagpiper</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/piper/dashboard" className="badge">Dashboard</Link>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
