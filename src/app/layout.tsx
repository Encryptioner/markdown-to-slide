import type { Metadata } from "next";
import { AppProvider } from "@/contexts/AppContext";
import { basePublicPath } from "@/utils/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown to Slides - Create Professional Presentations",
  description: "Transform your Markdown content into professional presentation slides. Free, open-source, and browser-based with offline support.",
  keywords: "markdown, slides, presentation, pwa, offline, free, open-source",
  authors: [{ name: "Ankur Mursalin", url: "https://encryptioner.github.io/" }],
  creator: "Ankur Mursalin",
  openGraph: {
    title: "Markdown to Slides",
    description: "Create professional presentations from Markdown",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to Slides",
    description: "Create professional presentations from Markdown",
  },
  manifest: `${basePublicPath}/manifest.json`,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={`${basePublicPath}/manifest.json`} />
        <meta name="theme-color" content="#000000" />
        <meta name="author" content="Ankur Mursalin" />
        <link rel="apple-touch-icon" href={`${basePublicPath}/icons/icon-192x192.svg`} />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <AppProvider>
          {children}
        </AppProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('${basePublicPath}/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
