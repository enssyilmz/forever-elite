// app/page.tsx

'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/ozcan-video.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full bg-black/50">
        <h1 className="text-4xl mb-6 text-center read-only">Discover your power!</h1>
        <Link href="/login">
          <button className="bg-transparent text-white border px-6 py-3 rounded-xl hover:bg-gray-200 hover:text-black transition">
          CHECK OUT THE PROGRAMS
          </button>
        </Link>
      </div>
    </div>
  )
}
