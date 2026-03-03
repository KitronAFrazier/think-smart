import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Logic Branch",
  description: "Texas homeschool planning, progress, community, and billing in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body id="app-body" className="dark-mode">
        {children}
      </body>
    </html>
  );
}
