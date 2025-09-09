"use client"
import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const message = searchParams.get('message');
        if (message) {
            setSuccessMessage(message);
        }
    }, [searchParams]);

   const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username || !password) {
    setError("Please enter both username and password.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3005/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError("Invalid username or password.");
      return;
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("refresh_token", data.refreshToken);

    setError("");
    router.push("/dashboard");
  } catch (err) {
    setError("An error occurred. Please try again.");
    console.error(err);
  }
};


    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>
            
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {successMessage}
                </div>
            )}
            
            <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
                <input type="hidden" name="remember" defaultValue="true" />
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input id="username" name="username" type="text" autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Username" />

                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password" />
                    </div>
                </div>  
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox"  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900"> Remember me </label>
                    </div>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500"> Forgot your password? </a>
                    </div>
                </div>
                <div>
                    <button type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Sign in
                    </button>
                </div>
                <div className="text-sm text-center">
                    <span className="text-gray-600">Don't have an account? </span>
                    <a href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">Sign Up</a>
                </div>  
            </form>
        </div>
    </div>
}