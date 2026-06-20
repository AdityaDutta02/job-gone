import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const OG_IMAGE =
  "/api/card?role=Your%20Job&score=64&verdict=Moderate%20Risk&timeline=3-5%20years" +
  "&r1=AI%20already%20handles%20the%20repetitive%20parts." +
  "&r2=Major%20reports%20agree%20the%20shift%20is%20coming." +
  "&r3=The%20tools%20are%20already%20good%20enough.";

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: "Job Gone | How Long Until AI Takes Your Job?",
  description:
    "Find out how soon AI will replace your job. Based on research from Anthropic, McKinsey, PwC and the World Economic Forum.",
  openGraph: {
    title: "How long until AI takes your job?",
    description: "Type your role. Get your number.",
    images: [{ url: OG_IMAGE, width: 1080, height: 1440 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How long until AI takes your job?",
    description: "Type your role. Get your number.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
