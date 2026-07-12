import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

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
            <span className="app-header__logo">OH</span>
            OpenHexa Essence
          </Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
