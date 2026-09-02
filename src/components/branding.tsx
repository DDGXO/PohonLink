"use client";

import { useEffect } from "react";

export function ConsoleBranding() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.clear();
    console.log(
      "%cPohonlink",
      "color:#7DF9B6;font-size:52px;font-weight:900;font-family:monospace;"
    );
    console.log(
      "%cPohonlink - Your Single Link for Everything",
      "color:#7DF9B6;font-size:13px;font-family:monospace;"
    );
    console.log(
      "%cCode without limits, think beyond the universe.",
      "color:rgba(240,236,228,0.4);font-size:12px;font-family:monospace;font-style:italic;"
    );
    console.log(
      "%cgithub.com/DDGXO | contact@dgxohq.com | dgxohq.com",
      "color:rgba(240,236,228,0.25);font-size:11px;font-family:monospace;"
    );
    console.log(
      "%cPowered by DGXO | Open Source under MIT License",
      "color:rgba(240,236,228,0.25);font-size:11px;font-family:monospace;"
    );
  }, []);

  return null;
}
