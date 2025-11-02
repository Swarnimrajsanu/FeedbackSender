

"use client";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <nav className="p-4 bg-green-800 text-white flex justify-between">
      <div className="container mx-auto flex justify-between items-center">
        <a className="text-xl font-bold mb-4 md:mb-0" href="#">
          Anonymous Feedback
        </a>
        {session ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username || user?.email}</span>
            <button
              className="bg-white text-green-800 px-4 py-2 rounded hover:bg-gray-200 transition"
              onClick={() => signOut({ callbackUrl: "/sign-in" })} // ✅ Call signOut properly
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/sign-in">
            <button className="bg-white text-green-800 px-4 py-2 rounded hover:bg-gray-200 transition">
              Sign In
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
