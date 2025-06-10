'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { programs } from '@/lib/programsData' // Import from centralized file

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()

  // Get user and their favorites on mount
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch favorites from Supabase
        const { data: userFavorites, error } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error fetching user favorites:', error)
          return
        }

        const favoriteProgramIds = userFavorites.map(fav => fav.product_id)
        const favoritePrograms = programs
          .filter(p => favoriteProgramIds.includes(p.id))
          .map(p => ({
            id: p.id,
            title: p.title,
            price: p.discountedPrice,
            originalPrice: p.originalPrice,
            discount: p.discount,
            bodyFatRange: p.bodyFatRange
          }))
        
        setFavoriteItems(favoritePrograms)
      } else {
        // For logged-out users, clear favorites or load from localStorage if you want to persist them non-authenticated
        setFavoriteItems([])
      }
    }

    fetchUserAndFavorites()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      // Re-fetch favorites on sign-in or sign-out
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserAndFavorites()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Load cart and reviews from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems')
      const savedReviews = localStorage.getItem('reviews')
      
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews))
      }
    }
  }, [])

  // Save cart and reviews to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
    }
  }, [cartItems])

  // No longer using localStorage for favorites
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && !user) {
  //     localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems))
  //   }
  // }, [favoriteItems, user])

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

  const addToFavorites = async (programId: number) => {
    if (!user) {
      alert('Please log in to add favorites.')
      return
    }

    const program = programs.find(p => p.id === programId)
    if (!program) return

    // Optimistic UI update
    const isAlreadyFavorite = favoriteItems.some(item => item.id === programId)
    if (isAlreadyFavorite) return
    
    const newFavorite: FavoriteItem = {
      id: programId,
      title: program.title,
      price: program.discountedPrice,
      originalPrice: program.originalPrice,
      discount: program.discount,
      bodyFatRange: program.bodyFatRange
    }
    setFavoriteItems(prev => [...prev, newFavorite])

    // Add to database
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: user.id, product_id: programId })
    
    if (error) {
      console.error('Error adding to favorites:', error)
      // Revert UI change on error
      setFavoriteItems(prev => prev.filter(item => item.id !== programId))
      alert('Failed to add to favorites. Please try again.')
    }
  }

  const removeFromFavorites = async (programId: number) => {
    if (!user) return // Should not happen if item is favorited

    const program = programs.find(p => p.id === programId)
    if (!program) return

    // Optimistic UI update
    const originalFavorites = favoriteItems;
    setFavoriteItems(prev => prev.filter(item => item.id !== programId))

    // Remove from database
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .match({ user_id: user.id, product_id: programId })

    if (error) {
      console.error('Error removing from favorites:', error)
      // Revert UI change on error
      setFavoriteItems(originalFavorites)
      alert('Failed to remove from favorites. Please try again.')
    }
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