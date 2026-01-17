import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#FFD700',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Space Mono', 'Courier New', monospace",
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
}
