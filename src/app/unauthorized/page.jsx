'use client';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    useEffect(() => {
        toast.error('You are not authorized to access this page');
        const timer = setTimeout(() => router.push('/'), 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                {/* Icon */}
                <div className="mb-6">
                    <div className="mx-auto bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Access Denied
                </h1>
                
                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    You don't have permission to view this page
                </p>

                {/* Loading Animation */}
                <div className="relative pt-1 mb-4">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-100 dark:bg-red-900/20">
                        <div
                            className="animate-pulse w-full bg-red-500 rounded shadow-none"
                            style={{ animation: 'progress 3s linear' }}
                        ></div>
                    </div>
                </div>

                {/* Redirect Message */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to homepage in 5 seconds...
                </p>
            </div>
        </div>
    );
}