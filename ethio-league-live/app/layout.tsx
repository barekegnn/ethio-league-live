import type { Metadata } from "next";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Ethio-League Live · Ethiopian Football Hub",
  description:
    "Live scores, fixtures, standings and player stats from the Ethiopian Premier League and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background flex flex-col">
        <Providers>
          <TopBar />
          <main className="flex-1 pb-20 lg:pb-10">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
