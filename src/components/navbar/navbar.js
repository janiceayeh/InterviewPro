import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="">
      <Link href="/">Home</Link>
      <Link href="/companies">Companies</Link>
      <Link href="/question-bank">Question Bank</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}
