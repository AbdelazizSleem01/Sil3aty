import { signOut } from 'next-auth/react';

const SignOutButton = () => {
    return (
        <div className=' '> 
            <button onClick={() => signOut({ callbackUrl: '/login' })} className='btn w-full rounded-md  bg-red-500 text-white'>
                Sign Out
            </button>
        </div>
    );
};

export default SignOutButton;