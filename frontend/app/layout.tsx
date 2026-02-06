'use client';

import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Crimson_Pro, Space_Grotesk } from 'next/font/google';

const displayFont = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
});

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const metadata: Metadata = {
  title: 'Programmatic SEO - Generate SEO-Optimized Pages at Scale',
  description: 'Create and deploy high-quality SEO-optimized pages programmatically with templates and bulk generation.',
  keywords: ['SEO', 'Content Generation', 'Automation', 'SaaS'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title?.toString()}</title>
        <meta name="description" content={metadata.description?.toString()} />
        <meta name="keywords" content={metadata.keywords?.join(', ')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
