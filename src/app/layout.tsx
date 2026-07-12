import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { SyncBanner } from "@/components/SyncBanner";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpenHexa Essence",
  description: "Recherche de stations-service et de prix des carburants en France.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="app-header">
          <Link href="/" className="app-header__brand">
            <span className="app-header__logo" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="10" height="16" rx="1" />
                <path d="M14 9h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 1-3 0v-4" />
                <line x1="7" y1="8" x2="11" y2="8" />
              </svg>
            </span>
            OpenHexa Essence
          </Link>
        </header>
        <SyncBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
