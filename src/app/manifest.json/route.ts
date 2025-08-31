import { NextResponse } from 'next/server';
import { basePublicPath } from '@/utils/constants';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const manifest = {
    name: "Markdown to Slides",
    short_name: "MD2Slides", 
    description: "Transform your Markdown content into professional presentation slides",
    start_url: `${basePublicPath}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: `${basePublicPath}/icons/icon-192x192.svg`,
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: `${basePublicPath}/icons/icon-512x512.svg`,
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ],
    categories: ["productivity", "business", "education"],
    orientation: "landscape-primary",
    scope: `${basePublicPath}/`,
    lang: "en"
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}