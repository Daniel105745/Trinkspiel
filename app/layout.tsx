import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trinkspiel App",
  description: "Party • Spaß • Chaos",
};

// viewport-fit=cover aktiviert safe-area-inset für iPhone Notch / Home Indicator
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={nunito.variable}>
      <body className="antialiased bg-black flex justify-center min-h-screen">
        <div className="w-full max-w-[430px] min-h-screen relative shadow-[0_0_80px_rgba(0,0,0,0.9)]">
          {children}
        </div>
      </body>
    </html>
  );
}
