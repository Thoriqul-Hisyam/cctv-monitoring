import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINS CCTV - CCTV Masyarakat",
  description: "CCTV Masyarakat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
