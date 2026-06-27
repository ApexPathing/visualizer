import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@wrksz/themes/next";
import PageNavbar from "@/components/page-navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Pathing Visualizer",
  description: "Path generation, visualization, and programming tool for Apex Pathing",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-full font-mono p-4">
        <ThemeProvider forcedTheme="dark" attribute="class" >
          <div className=" lg:hidden fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md p-6 text-center">
            <p className="px-4 text-lg font-medium">
              Your screen resolution is too small to use the visualizer. Please resize the window or use a larger screen.
            </p>
          </div>

          <PageNavbar />
          <main className="flex-1 min-h-0 w-full mt-4 z-0">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}