import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSansHeading = DM_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Articulate",
  description: "Multimodal Voice AI Museum Docent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("light", "h-full", "antialiased", inter.variable, dmSansHeading.variable)}
      style={{ colorScheme: "light" }}
    >
      <body className="h-full overflow-hidden bg-background text-foreground">{children}</body>
    </html>
  );
}

