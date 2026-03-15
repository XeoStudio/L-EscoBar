import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/QueryProvider";
import { db, hasDatabaseConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_METADATA = {
  title: "L'EscoBar - Cafe Management",
  description: "Complete cafe management app for menu, orders, and table operations",
  keywords: ["cafe", "restaurant", "orders", "menu", "table management"],
  authors: [{ name: "Cafe Team" }],
};

export async function generateMetadata(): Promise<Metadata> {
  if (!hasDatabaseConfig()) {
    return DEFAULT_METADATA;
  }

  try {
    const settings = await db.settings.findFirst({
      select: { cafeName: true, siteDescription: true },
    });

    const cafeName = settings?.cafeName?.trim();
    const description = settings?.siteDescription?.trim() || DEFAULT_METADATA.description;
    const title = cafeName ? `${cafeName} - Cafe Management` : DEFAULT_METADATA.title;

    return {
      ...DEFAULT_METADATA,
      title,
      description,
    };
  } catch (error) {
    console.error("Failed to load site metadata:", error);
    return DEFAULT_METADATA;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--background)', color: 'var(--text-primary)' }}
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
