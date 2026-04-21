/**
 * useAuthFonts
 * Injects Public Sans and Material Symbols <link> tags into <head> on mount.
 * Safe to call from multiple components — checks for existing tags by ID first.
 * Import this anywhere in the auth flow that might be the first page rendered.
 */

import { useEffect } from "react";

export default function useAuthFonts() {
  useEffect(() => {
    const toInject = [
      {
        id:   "auth-font-public-sans",
        href: "https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;600;700;900&display=swap",
      },
      {
        id:   "auth-font-material-symbols",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
      },
    ];

    const injected = [];
    toInject.forEach(({ id, href }) => {
      if (!document.getElementById(id)) {
        const link = Object.assign(document.createElement("link"), {
          id, rel: "stylesheet", href,
        });
        document.head.appendChild(link);
        injected.push(link);
      }
    });

    return () => injected.forEach((el) => el.remove());
  }, []);
}
