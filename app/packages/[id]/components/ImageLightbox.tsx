'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Play, Pause } from 'lucide-react'

interface ImageLightboxProps {
  images: (string | null)[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export default function ImageLightbox({ images, isOpen, onClose, initialIndex = 0 }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSlideshow, setIsSlideshow] = useState(false)
  const [slideshowInterval, setSlideshowInterval] = useState<NodeJS.Timeout | null>(null)

  // Filter out null images
  const validImages = images.filter((img): img is string => img !== null)

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setIsSlideshow(false)
      if (slideshowInterval) {
        clearInterval(slideshowInterval)
        setSlideshowInterval(null)
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
      if (slideshowInterval) {
        clearInterval(slideshowInterval)
      }
    }
  }, [isOpen, initialIndex, slideshowInterval])

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }, [validImages.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err)
      }
    }
  }, [])

  const toggleSlideshow = useCallback(() => {
    if (isSlideshow) {
      setIsSlideshow(false)
      if (slideshowInterval) {
        clearInterval(slideshowInterval)
        setSlideshowInterval(null)
      }
    } else {
      setIsSlideshow(true)
      const interval = setInterval(nextImage, 3000) // 3 saniyede bir değiş
      setSlideshowInterval(interval)
    }
  }, [isSlideshow, slideshowInterval, nextImage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case ' ':
          e.preventDefault()
          toggleSlideshow()
          break
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isOpen, nextImage, prevImage, onClose, toggleFullscreen, toggleSlideshow])

  if (!isOpen || validImages.length === 0) return null

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Slideshow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleSlideshow()
          }}
          className="p-2 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200"
          title={isSlideshow ? 'Pause Slideshow' : 'Start Slideshow'}
        >
          {isSlideshow ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFullscreen()
          }}
          className="p-2 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-2 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-10">
        {currentIndex + 1} / {validImages.length}
      </div>

      {/* Navigation Arrows - Screen Edges */}
      {validImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-all duration-200 z-20"
            title="Previous Image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-all duration-200 z-20"
            title="Next Image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div 
        className="relative w-[70vw] h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Current Image */}
        <img
          src={validImages[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-cover rounded-lg shadow-2xl"
        />
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-12 h-12 rounded border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-white' 
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      {/* Slideshow Indicator */}
      {isSlideshow && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Slideshow Active
        </div>
      )}
    </div>
  )
}
