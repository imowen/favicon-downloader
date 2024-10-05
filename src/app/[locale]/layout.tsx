// 文件: src/app/[locale]/layout.tsx

import { appConfig, type LocaleType } from "@/config";
import getRequestConfig from "@/i18n";
import { cn, createAlternates } from "@/lib/utils";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono as FontMono } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import Script from 'next/script';
import "./globals.css";

export const runtime = 'edge';

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const t = await getTranslations(params);
  const headersList = headers();
  const canonicalUrl = `https://${appConfig.appRootDomain}${headersList.get('x-invoke-path') || ''}`;

  return {
    title: {
      absolute: t('frontend.meta.default.title'),
      default: t('frontend.meta.default.title'),
      template: `%s - ${appConfig.appRootDomain}`,
    },
    description: t('frontend.meta.default.description'),
    alternates: {
      ...createAlternates({ headers: headersList }),
      canonical: canonicalUrl,
    },
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const { locale } = params as { locale: LocaleType };
  if (!appConfig.i18n.locales.includes(locale)) {
    notFound();
  }
  const { messages } = await getRequestConfig({locale});

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <link rel="canonical" href={`https://${appConfig.appRootDomain}${headers().get('x-invoke-path') || ''}`} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-mono antialiased",
          fontMono.variable
        )}
      >
        <NextTopLoader color="var(--colors-primary)" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
        {appConfig.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${appConfig.gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${appConfig.gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
