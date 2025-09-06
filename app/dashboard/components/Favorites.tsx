'use client'

import Link from 'next/link'

interface FavoritesProps {
  favoriteProducts: any[]
  favoritesLoading: boolean
}

export default function Favorites({ favoriteProducts, favoritesLoading }: FavoritesProps) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-responsive-lg font-bold mb-4 md:mb-6 text-gray-900">My Favorites</h2>
      {favoritesLoading ? (
        <p className="text-responsive-sm text-gray-500">Loading favorites...</p>
      ) : favoriteProducts.length === 0 ? (
        <p className="text-responsive-sm text-gray-500">You have no favorite products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {favoriteProducts.map((product) => (
            <Link href={`/packages/${product.id}`} key={product.id}>
              <div className="border rounded-lg overflow-hidden shadow-sm group transform hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col cursor-pointer">
                {/* Program Emoji */}
                <div className="w-full h-32 md:h-48 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
                   <span className="text-4xl md:text-7xl opacity-90">{product.emoji}</span>
                </div>
                <div className="p-3 md:p-4 flex-grow">
                  <h3 className="text-responsive-sm md:text-responsive-base font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{product.name}</h3>
                  <p className="text-gray-600 mt-2 text-responsive-sm">{product.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
