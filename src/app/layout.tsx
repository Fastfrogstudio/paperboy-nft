import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <WalletProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#12121a",
                color: "#e8e8ed",
                border: "1px solid #1e1e2e",
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
