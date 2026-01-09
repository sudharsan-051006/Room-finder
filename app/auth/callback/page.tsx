"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const resolveLogin = async () => {
      let attempts = 0;

      // Wait until Supabase finishes creating the session
      while (attempts < 15) {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          window.location.replace("/owner/dashboard");
          return;
        }

        await new Promise((res) => setTimeout(res, 300));
        attempts++;
      }

      // Fallback (should not happen)
      window.location.replace("/");
    };

    resolveLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">Completing login…</p>
    </div>
  );
}
