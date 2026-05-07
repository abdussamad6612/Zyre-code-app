"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Featurebase: any;
  }
}

const FeaturebaseMessenger = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://do.featurebase.app/js/sdk.js";
    script.id = "featurebase-sdk";
    script.async = true;
    script.onload = () => {
      if (typeof window.Featurebase !== "function") {
        window.Featurebase = function () {
          (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
        };
      }
      window.Featurebase("boot", {
        appId: "68ec382cb73797e68c8d10dd",
        theme: "dark",
        language: "en"
      });
    };
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById("featurebase-sdk");
      if (el) el.remove();
    };
  }, []);

  return null;
};

export default FeaturebaseMessenger;
