import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "2A - Lendemain meilleur, Lendemain fière",
  description: "Découvrez une nouvelle façon de voir demain, inspirée par l'art et guidée par l'innovation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
