import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SettingsProvider } from "@/components/SettingsProvider";

export const metadata: Metadata = {
  title: "GoldSense AI — AI-Based Gold Price Prediction & Market Trend Analysis",
  description:
    "GoldSense AI uses machine learning (XGBoost) to analyze historical gold-price data and generate short-term gold price forecasts and market trend analysis.",
  keywords: ["gold", "gold price", "forecast", "AI", "machine learning", "XGBoost", "market analysis"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}