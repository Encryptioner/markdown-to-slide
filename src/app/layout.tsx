import type { Metadata } from "next";
import { AppProvider } from "@/contexts/AppContext";
import { basePublicPath, AI_CHAT_CONFIG } from "@/utils/constants";
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
  manifest: "/manifest.json",
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
        <link rel="manifest" href="/manifest.json" />
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
        {AI_CHAT_CONFIG.enabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Dynamic loading to handle GitHub Pages better
                    const embedUrl = ${JSON.stringify(AI_CHAT_CONFIG.embedScriptUrl)};
                    console.log('Loading AI Chat embed script:', embedUrl);
                    
                    if (embedUrl && embedUrl.trim() !== '') {
                      const script = document.createElement('script');
                      script.id = 'aiChatEmbedScript';
                      script.defer = true;
                      script.src = embedUrl;
                      script.onerror = function() {
                        console.error('Failed to load AI Chat embed script:', embedUrl);
                      };
                      script.onload = function() {
                        console.log('AI Chat embed script loaded successfully');
                      };
                      document.head.appendChild(script);
                    } else {
                      console.warn('AI Chat embed script URL is empty or invalid');
                    }
                  } catch (error) {
                    console.error('Error loading AI Chat embed script:', error);
                  }
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
