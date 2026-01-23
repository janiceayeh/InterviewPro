import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-4 py-6 justify-center">
      <Link href="/" className="text-gray-700 hover:text-gray-900">
        Home
      </Link>
      <Link href="/companies" className="text-gray-700 hover:text-gray-900">
        Companies
      </Link>
      <Link href="/question-bank" className="text-gray-700 hover:text-gray-900">
        Question Bank
      </Link>
      <Link href="/contact" className="text-gray-700 hover:text-gray-900">
        Contact
      </Link>
    </nav>
  );
}
