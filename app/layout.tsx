import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "🍺 Trinkspiel App – Party • Spaß • Chaos",
  description:
    "Die ultimative Trinkspiel-App für deine Party! Wahrheit oder Pflicht, Ich hab noch nie, Wer würde eher & Imposter.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#060710",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={nunito.variable}>
      <body className="flex justify-center min-h-screen">
        <div className="w-full max-w-[430px] min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
