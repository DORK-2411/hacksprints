import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Career Decision Simulator — Chart Your Future',
  description:
    'Compare careers, simulate 10-year salary growth, analyze skill gaps, and make a confident career decision with AI-powered insights.',
  keywords: ['career simulator', 'salary predictor', 'skill gap analyzer', 'career comparison'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} bg-[#060610] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
