import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* YOUR EXACT LOGO SVG GEOMETRY */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{ width: '100%', height: '100%' }}
        >
            {/* The Frame - Hardcoded Black for contrast on tabs */}
            <path 
                d="M21 4H3V20H13V14H21V4Z" 
                fill="black" 
            />
            
            {/* The 'Key/Spark' - Hardcoded Tailwind Blue-600 color (#2563eb) */}
            <path 
                d="M21 20V16H15V20H21Z" 
                fill="#2563eb"
            />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}