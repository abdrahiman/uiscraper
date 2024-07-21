import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./styles/globals.css";
import WorkSpacesSideBar from "@/components/sidebar";
import Providers from "@/components/providers";
import { Suspense } from "react";

const inter = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scraping Website Made Easy",
  description:
    "website app that helps you scrape websites easily without writing code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Suspense>
            <div className="flex gap-4 flex-row w-full">
              <WorkSpacesSideBar />
              {children}
            </div>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
