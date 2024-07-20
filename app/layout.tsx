import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./styles/globals.scss";
import "./globals.css";
import Container from "./components/Container";
import Nav from "./components/nav";

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
        <Nav />
        <Container>{children}</Container>
      </body>
    </html>
  );
}
