"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import ClientProvider from "./providers";
import { FloatingDock } from "@/components/ui/floating-dock";
import { links } from "../lib/map-props";
import { useRouter } from "next/navigation";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient(); // ✅ React Query Client

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  // Handle navigation
  const handleDockNavigation = (path: string) => {
    router.push(path);
  };

  // Fix: Prevent nesting of <a> inside <a>
  const enhancedLinks = links.map((link) => ({
    ...link,
    onClick: () => handleDockNavigation(link.path || "/"),
  }));

  return (
    <html lang="en">
    <body className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <ClientProvider>
          {children}
          {/* Only render FloatingDock after client mounts to avoid SSR mismatches */}
          {clientReady && (
            <FloatingDock
              mobileClassName="translate-y-20"
              desktopClassName="fixed bottom-4 gap-10 z-10 left-1/2 scale-23 transform -translate-x-1/2 w-[500px] bg-white shadow-md p-4 flex justify-center"
              items={enhancedLinks}
            />
          )}
        </ClientProvider>
      </QueryClientProvider>
    </body>
  </html>
  );
}
