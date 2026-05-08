import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NutriCoach",
  description: "Nutrition coaching platform for Indian coaches",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--surface)",
              color: "var(--fg1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-md)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "10px 14px",
            },
            success: { iconTheme: { primary: "var(--success)", secondary: "#fff" } },
            error:   { iconTheme: { primary: "var(--danger)",  secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
