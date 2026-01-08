"use client";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const login = async () => {
    const email = prompt("Enter your email");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Check your email for OTP");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={login}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Login / Signup
      </button>
    </div>
  );
}
