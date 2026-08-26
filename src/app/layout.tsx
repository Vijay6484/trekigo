import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora-family",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Trekigo - Luxury Villa & Experience Booking",
  description: "Go Wild, Stay Chill. Book luxury villas, cottages, and experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="bg-background text-on-background font-body-md antialiased">
        {children}
      </body>
    </html>
  );
}
