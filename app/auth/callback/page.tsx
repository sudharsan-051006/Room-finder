"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const resolveLogin = async () => {
      // Wait until Supabase creates the session
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          window.location.replace("/owner/dashboard");
          return;
        }

        await new Promise((res) => setTimeout(res, 300));
      }

      // Fallback (should rarely happen)
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
