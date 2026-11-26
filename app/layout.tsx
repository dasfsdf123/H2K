import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { name } = await getContent();
  return {
    title: `${name} | Recruitment and Jobs in Poland`,
    description: "Explore job opportunities in Poland, send your CV online or contact our recruitment team.",
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /></head>
      <body>{children}</body>
    </html>
  );
}
