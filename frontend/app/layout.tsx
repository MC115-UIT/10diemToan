import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["vietnamese", "latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Toán Sâu",
  description: "Trải nghiệm học Toán chuyên sâu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${ebGaramond.variable} ${playfairDisplay.variable} font-garamond bg-academic-paper text-academic-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
