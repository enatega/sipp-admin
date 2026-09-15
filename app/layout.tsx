import { deployment } from '@/config/deployment';
import { QueryProvider } from '@/components/provider/QueryProvider';
import EnategaLoader from '@/components/shared/EnategaLoader';
import '@/styles/enatega-loader.css';
import '@/styles/globals.css';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: deployment.brand.titles.admin,
  description: deployment.brand.description,
  icons: '/sipp-favicon.png',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale}>
          <QueryProvider>
            <Suspense fallback={<EnategaLoader />}>{children}</Suspense>
          </QueryProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
