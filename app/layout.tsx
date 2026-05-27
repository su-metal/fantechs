import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "現場の業務知識 | 電気・音響・照明・映像",
  description: "電気・音響・照明・映像の現場業務知識をまとめたナレッジベース",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 min-h-screen antialiased">
        <div className="max-w-md mx-auto min-h-screen bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
