import { ImageResponse } from '@vercel/og';

export default async function handler(req) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFD700',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ fontSize: '200px', lineHeight: 1, marginBottom: '40px' }}>
            ⚠️
          </div>
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#000',
              margin: 0,
            }}
          >
            ANTICS
          </h1>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
