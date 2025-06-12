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
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()

  // Get user, favorites, and reviews on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (sessionError) {
        console.error('Session error:', sessionError)
        return
      }

      setUser(user)
      console.log('Initial session:', session) // Debug log
      console.log('Initial user:', user) // Debug log

      if (user) {
        // Fetch favorites from Supabase
        const { data: userFavorites, error: favoritesError } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id)
        
        if (favoritesError) {
          console.error('Error fetching user favorites:', favoritesError)
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
        setFavoriteItems([])
      }
    }

    fetchInitialData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event) // Debug log
      console.log('Session update:', session) // Debug log
      
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setFavoriteItems([])
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchInitialData()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    }
  }, [])

  // Save cart to localStorage whenever state changes
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
      // User should be redirected to login or shown a modal by the calling component
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
      // Error should be handled by the calling component
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
      // Error should be handled by the calling component
    }
  }

  const isFavorite = (programId: number) => {
    return favoriteItems.some(item => item.id === programId)
  }

  const addReview = async (programId: number, rating: number, comment: string) => {
    if (!user) throw new Error("User must be logged in to add a review.");

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        program_id: programId,
        rating,
        comment,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding review:', error)
      throw error;
    }
    
    if (data) {
      setReviews(prev => [data as Review, ...prev]);
    }
  }

  const deleteReview = async (reviewId: number) => {
    if (!user) throw new Error("User must be logged in to delete a review.");

    // First, check if the user is the owner of the review
    const reviewToDelete = reviews.find(r => r.id === reviewId);
    if (!reviewToDelete || reviewToDelete.user_id !== user.id) {
      throw new Error("You can only delete your own reviews.");
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);
      
    if (error) {
      console.error('Error deleting review:', error)
      throw error;
    }

    setReviews(prev => prev.filter(review => review.id !== reviewId));
  }

  return (
    <AppContext.Provider
      value={{
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
        deleteReview
      }}
    >
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