'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { programs } from '@/lib/packagesData' // Import from centralized file
import { CustomProgram } from '@/lib/database.types'
import { supabase } from '@/utils/supabaseClient'

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
  user_id: string
  program_id: number
  rating: number
  comment: string
  created_at: string
  user_name: string
}

interface AppContextType {
  // User
  user: User | null

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
  addReview: (programId: number, rating: number, comment: string) => Promise<void>
  deleteReview: (reviewId: number) => Promise<void>
  
  // Custom Programs
  customPrograms: CustomProgram[]
  fetchCustomPrograms: () => Promise<void>
  refreshCustomPrograms: () => Promise<void>
  
  // Navbar
  isNavbarOpen: boolean
  toggleNavbar: () => void
  
  // Support Tickets
  lastViewedSupportAt: number
  setLastViewedSupportAt: (timestamp: number) => void
  updateLastViewedSupportAt: (timestamp: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [customPrograms, setCustomPrograms] = useState<CustomProgram[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)
  const [lastViewedSupportAt, setLastViewedSupportAt] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const raw = window.localStorage.getItem('ozcanfit.support.lastViewedAt')
    return raw ? parseInt(raw, 10) : 0
  })

  // Get user, favorites, reviews, and custom programs on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (sessionError) {
        console.error('Session error:', sessionError)
        return
      }

      setUser(user)

      if (user) {
        await Promise.all([
          fetchFavorites(),
          fetchReviews(),
          fetchCustomPrograms()
        ])
      }
    }

    fetchInitialData()

         const {
       data: { subscription },
     } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await Promise.all([
          fetchFavorites(),
          fetchReviews(),
          fetchCustomPrograms()
        ])
      } else {
        setFavoriteItems([])
        setReviews([])
        setCustomPrograms([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Hydrate cart from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const storedCart = window.localStorage.getItem('ozcanfit.cart')
      if (storedCart) {
        const parsed: CartItem[] = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to read cart from localStorage:', error)
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem('ozcanfit.cart', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Failed to write cart to localStorage:', error)
    }
  }, [cartItems])

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

             const { data: favorites } = await supabase
         .from('user_favorites')
         .select('product_id')
         .eq('user_id', user.id)

       if (favorites) {
         const favoritePrograms = favorites
           .map((fav: any) => {
             const program = programs.find(p => p.id === fav.product_id)
             return program ? {
               id: program.id,
               title: program.title,
               price: program.discountedPrice,
               originalPrice: program.originalPrice,
               discount: program.discount,
               bodyFatRange: program.bodyFatRange,
               image: program.image
             } : null
           })
           .filter(Boolean) as FavoriteItem[]

         setFavoriteItems(favoritePrograms)
       }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (reviews) {
        setReviews(reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchCustomPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/custom-programs')
      if (!response.ok) {
        throw new Error('Failed to fetch custom programs')
      }

      const data = await response.json()
      setCustomPrograms(data.programs || [])
    } catch (error) {
      console.error('Error fetching custom programs:', error)
    }
  }

  const refreshCustomPrograms = async () => {
    await fetchCustomPrograms()
  }

  const addToCart = (programId: number, quantity: number) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    const existingItem = cartItems.find(item => item.id === programId)
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === programId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCartItems([...cartItems, {
        id: program.id,
        title: program.title,
        price: program.discountedPrice,
        quantity,
        image: program.image
      }])
    }
  }

  const removeFromCart = (programId: number) => {
    setCartItems(cartItems.filter(item => item.id !== programId))
  }

  const updateCartQuantity = (programId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(programId)
      return
    }

    setCartItems(cartItems.map(item =>
      item.id === programId
        ? { ...item, quantity }
        : item
    ))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const addToFavorites = async (programId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_favorites')
        .insert([
          { user_id: user.id, product_id: programId }
        ])

      if (error) {
        console.error('Error adding to favorites:', error)
        return
      }

      const program = programs.find(p => p.id === programId)
             if (program) {
         setFavoriteItems([...favoriteItems, {
           id: program.id,
           title: program.title,
           price: program.discountedPrice,
           originalPrice: program.originalPrice,
           discount: program.discount,
           bodyFatRange: program.bodyFatRange,
           image: program.image
         }])
       }
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }

  const removeFromFavorites = async (programId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', programId)

      if (error) {
        console.error('Error removing from favorites:', error)
        return
      }

      setFavoriteItems(favoriteItems.filter(item => item.id !== programId))
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  const isFavorite = (programId: number) => {
    return favoriteItems.some(item => item.id === programId)
  }

  const addReview = async (programId: number, rating: number, comment: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userName = user.user_metadata?.full_name || user.email || 'Anonymous'

      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: user.id,
            program_id: programId,
            rating,
            comment,
            user_name: userName
          }
        ])
        .select()

      if (error) {
        console.error('Error adding review:', error)
        return
      }

      if (data) {
        setReviews([data[0], ...reviews])
      }
    } catch (error) {
      console.error('Error adding review:', error)
    }
  }

  const deleteReview = async (reviewId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting review:', error)
        return
      }

      setReviews(reviews.filter(review => review.id !== reviewId))
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen)
  }

  // Update lastViewedSupportAt and localStorage
  const updateLastViewedSupportAt = (timestamp: number) => {
    setLastViewedSupportAt(timestamp)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ozcanfit.support.lastViewedAt', timestamp.toString())
    }
  }

  return (
    <AppContext.Provider value={{
      user,
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
      addReview,
      deleteReview,
      customPrograms,
      fetchCustomPrograms,
      refreshCustomPrograms,
      isNavbarOpen,
      toggleNavbar,
      lastViewedSupportAt,
      setLastViewedSupportAt,
      updateLastViewedSupportAt
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