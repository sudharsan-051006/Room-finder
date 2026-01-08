"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        window.location.href = "/owner/dashboard";
      } else {
        window.location.href = "/";
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging you in...</p>
    </div>
  );
}
