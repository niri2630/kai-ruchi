import type { Metadata, Viewport } from "next";
import { Baloo_Thambi_2, Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import MasalaMesh from "@/components/layout/MasalaMesh";
import Navbar from "@/components/layout/Navbar";
import Preloader from "@/components/layout/Preloader";
import Providers from "@/components/layout/Providers";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { ScrollProgressBar } from "@/components/ui/Scroll";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const baloo = Baloo_Thambi_2({
  variable: "--font-baloo",
  subsets: ["latin", "tamil"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kai Ruchi — the taste only hands can make",
    template: "%s · Kai Ruchi",
  },
  description:
    "Homemade South Indian masalas, sun-cured pickles, overnight-fermented batters, "
    + "small-batch snacks and made-to-order sweets. Ground, cured and packed by hand in Udupi.",
  keywords: [
    "South Indian masala",
    "homemade pickle",
    "dosa batter online",
    "chicken sukka masala",
    "mysore pak",
    "banana chips",
  ],
  openGraph: {
    title: "Kai Ruchi — the taste only hands can make",
    description:
      "Masalas ground the morning we pack them. Pickles cured 21 days on the terrace.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff6e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${baloo.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <MasalaMesh />
        <Preloader />
        <SmoothScroll />
        <ScrollProgressBar />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
