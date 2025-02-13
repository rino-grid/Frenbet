import { generateOgImage } from '../lib/og';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') as 'home' | 'bet';
    const title = url.searchParams.get('title');
    const option1 = url.searchParams.get('option1');
    const option2 = url.searchParams.get('option2');
    const odds1 = url.searchParams.get('odds1');
    const odds2 = url.searchParams.get('odds2');
    const pool = url.searchParams.get('pool');

    const png = await generateOgImage({
      type,
      title,
      option1,
      option2,
      odds1,
      odds2,
      pool,
    });

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response('Error generating image', { status