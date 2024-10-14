"use client";
import { useProfileStore } from "@utils/stores/profile";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "./globals.css";
import { Providers } from "./providers";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loadHandle, loadProfilePicture, loadName } = useProfileStore();

  const router = useRouter();
  useEffect(() => {
    const foundHandle = loadHandle();
    loadProfilePicture();
    loadName();

    if (foundHandle === "") {
      router.push("/login");
    }
  }, [loadHandle, loadProfilePicture, loadName, router]);

  return (
    <html lang="en" data-theme="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
