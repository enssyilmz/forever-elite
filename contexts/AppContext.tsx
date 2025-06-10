'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: number
  title: string
  price: number
  quantity: number
  image?: string
}

interface FavoriteItem {
  id: number
  title: string
  price: number
  originalPrice: number
  discount: number
  bodyFatRange: string
  image?: string
}

interface Review {
  id: number
  programId: number
  name: string
  rating: number
  comment: string
  date: string
}

interface AppContextType {
  // Cart
  cartItems: CartItem[]
  addToCart: (programId: number, quantity: number) => void
  removeFromCart: (programId: number) => void
  updateCartQuantity: (programId: number, quantity: number) => void
  getTotalPrice: () => number
  getCartItemCount: () => number
  
  // Favorites
  favoriteItems: FavoriteItem[]
  addToFavorites: (programId: number) => void
  removeFromFavorites: (programId: number) => void
  isFavorite: (programId: number) => boolean
  
  // Reviews
  reviews: Review[]
  addReview: (programId: number, review: Omit<Review, 'id' | 'programId'>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const programs = [
  {
    id: 1,
    title: 'Elite Athletes Program',
    bodyFatRange: '6-10% Body Fat',
    originalPrice: 299,
    discountedPrice: 199,
    discount: 33
  },
  {
    id: 2,
    title: 'Advanced Fitness Program',
    bodyFatRange: '10-14% Body Fat',
    originalPrice: 249,
    discountedPrice: 169,
    discount: 32
  },
  {
    id: 3,
    title: 'Active Lifestyle Program',
    bodyFatRange: '14-18% Body Fat',
    originalPrice: 199,
    discountedPrice: 139,
    discount: 30
  },
  {
    id: 4,
    title: 'Transformation Program',
    bodyFatRange: '18-22% Body Fat',
    originalPrice: 179,
    discountedPrice: 129,
    discount: 28
  },
  {
    id: 5,
    title: 'Beginner Boost Program',
    bodyFatRange: '22-26% Body Fat',
    originalPrice: 149,
    discountedPrice: 99,
    discount: 34
  },
  {
    id: 6,
    title: 'Health Foundation Program',
    bodyFatRange: '26-30% Body Fat',
    originalPrice: 129,
    discountedPrice: 89,
    discount: 31
  },
  {
    id: 7,
    title: 'Wellness Journey Program',
    bodyFatRange: '30%+ Body Fat',
    originalPrice: 199,
    discountedPrice: 149,
    discount: 25
  },
  {
    id: 8,
    title: 'Personalized Program',
    bodyFatRange: 'Custom Body Fat',
    originalPrice: 399,
    discountedPrice: 299,
    discount: 25
  }
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems')
      const savedFavorites = localStorage.getItem('favoriteItems')
      const savedReviews = localStorage.getItem('reviews')
      
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
      if (savedFavorites) {
        setFavoriteItems(JSON.parse(savedFavorites))
      }
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews))
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
    }
  }, [cartItems])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems))
    }
  }, [favoriteItems])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reviews', JSON.stringify(reviews))
    }
  }, [reviews])

  const addToCart = (programId: number, quantity: number) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === programId)
      if (existingItem) {
        return prev.map(item =>
          item.id === programId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prev, {
          id: programId,
          title: program.title,
          price: program.discountedPrice,
          quantity: quantity
        }]
      }
    })
  }

  const removeFromCart = (programId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== programId))
  }

  const updateCartQuantity = (programId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(programId)
      return
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === programId ? { ...item, quantity } : item
      )
    )
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const addToFavorites = (programId: number) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    setFavoriteItems(prev => {
      const isAlreadyFavorite = prev.some(item => item.id === programId)
      if (isAlreadyFavorite) return prev

      return [...prev, {
        id: programId,
        title: program.title,
        price: program.discountedPrice,
        originalPrice: program.originalPrice,
        discount: program.discount,
        bodyFatRange: program.bodyFatRange
      }]
    })
  }

  const removeFromFavorites = (programId: number) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== programId))
  }

  const isFavorite = (programId: number) => {
    return favoriteItems.some(item => item.id === programId)
  }

  const addReview = (programId: number, review: Omit<Review, 'id' | 'programId'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now(),
      programId,
      date: new Date().toISOString().split('T')[0]
    }
    setReviews(prev => [...prev, newReview])
  }

  return (
    <AppContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      getTotalPrice,
      getCartItemCount,
      favoriteItems,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      reviews,
      addReview
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 