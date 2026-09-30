import type { Metadata } from "next";
import { Inter, DM_Sans, Afacad_Flux, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSansHeading = DM_Sans({subsets:['latin'],variable:'--font-heading'});

const afacadFlux = Afacad_Flux({
  variable: "--font-afacad-flux",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "block",
});

const outfit = Outfit({
  variable: "--font-outfit-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Articulate",
  description: "Multimodal Voice AI Museum Tour Guide",
};

import { Footer } from "@/components/layout/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("light", "h-full", "antialiased", inter.variable, dmSansHeading.variable, afacadFlux.variable, outfit.variable)}
      style={{ colorScheme: "light" }}
    >
      <body className="h-full overflow-hidden bg-background text-foreground">
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-white md:hidden">
          <main className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="max-w-xs font-sans text-sm sm:text-base leading-relaxed text-[#1f1e1b]">
              Mobile support soon. Currently not very responsive.
            </p>
          </main>
          <Footer />
        </div>
        <div className="hidden h-full w-full md:block">
          {children}
        </div>
      </body>
    </html>
  );
}

