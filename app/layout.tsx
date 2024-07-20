import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./styles/globals.scss";
import Container from "./components/Container";
import WorkSpaces from "./components/sidebar";
import Providers from "./components/Container";

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
          <div className="flex gap-4 flex-row w-full">
            <WorkSpaces />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
