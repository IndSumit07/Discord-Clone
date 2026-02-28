import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import PageLoader from "@/components/providers/page-loader";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Discord Clone",
  description: "A production-grade Discord clone",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} h-full overflow-hidden`}>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
