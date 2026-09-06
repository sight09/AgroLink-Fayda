"use client";

import { signIn, useSession, useUser } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Already Logged In</h2>
          <p className="text-gray-600 mb-6">You are authenticated via Fayda. Redirecting...</p>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const handleFaydaLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn("fayda", { callbackUrl: "/dashboard" });
      if (result?.error) {
        toast.error("Authentication failed. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo and Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-600 text-white mb-4 shadow-lg shadow-green-500/30">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AgroLink</h1>
        <p className="text-gray-600 max-w-md">
          Digitizing Agricultural Input Delivery in Ethiopia — Direct access to fertilizers,
          seeds, and pesticides through Fayda National ID verification.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Farmers and government officials use Fayda for secure verification
          </p>
        </div>

        {/* Fayda Login Button */}
        <button
          onClick={handleFaydaLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-xl transition-all duration-200 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/80">Connecting to Fayda...</span>
            </>
          ) : (
            <>
              {/* Fayda Logo Placeholder */}
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span>Sign in with Fayda National ID</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          By signing in, you agree to our terms of service and privacy policy.
          Your Fayda identity is verified securely.
        </p>

        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fayda Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Connection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Broker Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400">
        Powered by Fayda National ID — Building trust in Ethiopian agriculture
      </p>
    </div>
  );
}
