import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif"
});

// Satoshi is not on Google Fonts typically, so we might fallback or load via CDN/local. 
// For now, let's use a similar clean sans like 'Inter' or 'Plus Jakarta Sans' as "Satoshi-like" 
// Or stick to the plan if user installed packages. 
// Ideally we load local fonts, but to ensure it works out of box:
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-satoshi" }); // Renaming var to keep config working

export const metadata: Metadata = {
  title: "CREA | AI Chief of Staff",
  description: "The grounded AI operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${inter.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
