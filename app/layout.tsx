import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Lewis Tutoring — Building confident learners",
    template: "%s · Lewis Tutoring",
  },
  description:
    "Building confident learners, one lesson at a time. Personalised tutoring for kids of all ages — grade 1 prep, homework support, exam preparation — live online lessons.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Lewis Tutoring — Building confident learners",
    description:
      "Personalised tutoring for kids of all ages — grade 1 prep, homework support, exam preparation. Live online lessons.",
    images: ["/og.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
