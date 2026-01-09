import { useEffect } from "react";

declare global {
  interface Window {
    // Prefer unknown/object instead of `any` to satisfy lint rules
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export const TawkTo = () => {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/6953ac764884dc1981daae5b/1jdndjci6";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    return () => {
      // Cleanup on unmount
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript) {
        tawkScript.remove();
      }
      // Remove Tawk widget elements
      const tawkElements = document.querySelectorAll('[class*="tawk"]');
      tawkElements.forEach((el) => el.remove());
    };
  }, []);

  return null;
};
