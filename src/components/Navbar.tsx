"use client"
import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
useSession

const Navbar = () => {
    const { data: session } = useSession();
    const user: User = session?.user as User;
    return (
        <nav className='p-4 bg-gray-800 text-white flex justify-between'>
            <div className='container mx-auto flex justify-between items-center'>
                <a className='text-xl font-bold mb-4 md:mb-0' href="#">Anynomous Feedback</a>
                {
                    session ? (
                        <>
                        <span className='mr-4' >Welcome, {user?.username || user?.email}</span>
                        <button className='w-full md:w-auto' onClick={()=> signOut}>Logout</button>
                        </>
                    ):(
                        <Link href="/sign-in">
                            <button className='w-full md:w-auto'>Sign In</button>
                        </Link>
                    )
                }
            </div>
        </nav>
    )
}


export default Navbar;