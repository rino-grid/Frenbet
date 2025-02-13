import { Context } from '@netlify/edge-functions';

export default async function handler(req: Request, context: Context) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as 'home' | 'bet';
    const title = encodeURIComponent(url.searchParams.get('title') || '');
    const option1 = encodeURIComponent(url.searchParams.get('option1') || '');
    const option2 = encodeURIComponent(url.searchParams.get('option2') || '');
    const odds1 = encodeURIComponent(url.searchParams.get('odds1') || '');
    const odds2 = encodeURIComponent(url.searchParams.get('odds2') || '');
    const pool = encodeURIComponent(url.searchParams.get('pool') || '');

    // Use a service like Vercel's OG Image generation
    const ogUrl = type === 'home' 
      ? `https://og-image.vercel.app/Frenbet.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg`
      : `https://og-image.vercel.app/**${title}**%0A%0A${option1}%20(${odds1})%20vs%20${option2}%20(${odds2})%0A%0ATotal%20Pool%3A%20%24${pool}.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg`;

    // Fetch the image from Vercel's OG service
    const response = await fetch(ogUrl);
    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response('Error generating image', { status: 500 });
  }
}