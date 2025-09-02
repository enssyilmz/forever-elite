'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'
import SuccessModal from '../../components/SuccessModal'

export default function BodyFatCalculator() {
  const [unit, setUnit] = useState<'metric' | 'us'>('metric')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [neckFeet, setNeckFeet] = useState('')
  const [neckInches, setNeckInches] = useState('')
  const [waistFeet, setWaistFeet] = useState('')
  const [waistInches, setWaistInches] = useState('')
  const [hipFeet, setHipFeet] = useState('')
  const [hipInches, setHipInches] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [category, setCategory] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const showPopup = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setShowModal(true)
  }

  const getCategory = (bf: number, gender: string) => {
    if (gender === 'male') {
      if (bf < 6) return 'Essential Fat'
      if (bf < 14) return 'Athletes'
      if (bf < 18) return 'Fitness'
      if (bf < 25) return 'Average'
      return 'Obese'
    } else {
      if (bf < 14) return 'Essential Fat'
      if (bf < 21) return 'Athletes'
      if (bf < 25) return 'Fitness'
      if (bf < 32) return 'Average'
      return 'Obese'
    }
  }

  const calculate = async () => {
    let h: number
    let w: number
    let n: number
    let ws: number
    let hp: number = 0

    if (!age || !weight || !height || !neck || !waist) {
      showPopup('Missing Information', 'Please fill in all required fields')
      return
    }

    if (gender === 'female' && !hip && unit === 'metric') {
      showPopup('Missing Information', 'Hip measurement is required for female calculations')
      return
    }

    if (unit === 'metric') {
      h = parseFloat(height)
      w = parseFloat(weight)
      n = parseFloat(neck)
      ws = parseFloat(waist)
      if (gender === 'female') hp = parseFloat(hip)
    } else {
      if (!heightFeet || !heightInches || !neckFeet || !neckInches || !waistFeet || !waistInches) {
        showPopup('Missing Information', 'Please fill in all measurement fields')
        return
      }
      
      if (gender === 'female' && (!hipFeet || !hipInches)) {
        showPopup('Missing Information', 'Hip measurements are required for female calculations')
        return
      }

      const totalHeightInInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches)
      const totalNeckInInches = parseFloat(neckFeet) * 12 + parseFloat(neckInches)
      const totalWaistInInches = parseFloat(waistFeet) * 12 + parseFloat(waistInches)
      
      h = totalHeightInInches * 2.54
      w = parseFloat(weight) * 0.453592
      n = totalNeckInInches * 2.54
      ws = totalWaistInInches * 2.54
      
      if (gender === 'female') {
        const totalHipInches = parseFloat(hipFeet) * 12 + parseFloat(hipInches)
        hp = totalHipInches * 2.54
      }
    }

    let bodyFat: number

    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(ws - n) + 0.15456 * Math.log10(h)) - 450
    } else {
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(ws + hp - n) + 0.221 * Math.log10(h)) - 450
    }

    if (bodyFat < 0) bodyFat = 0
    if (bodyFat > 50) bodyFat = 50

    const bfRounded = parseFloat(bodyFat.toFixed(1))
    setResult(bfRounded)
    setCategory(getCategory(bfRounded, gender))

    // If user is not logged in, we are done. The result is displayed.
    if (!user) {
      return
    }

    // If user is logged in, proceed to save the result automatically.
    setIsSaving(true)
    try {
      // 1. Log the calculation to the body_fat_logs table
      const { error: logError } = await supabase
        .from('body_fat_logs')
        .insert({
          user_id: user.id,
          user_email: user.email,
          body_fat_percentage: bfRounded,
        })

      if (logError) {
        throw new Error(`Failed to log result: ${logError.message}`)
      }

      // 2. Update the user's main profile in user_registrations
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('email', user.email)
        .single()

      // Ignore 'not found' error (PGRST116), but throw others
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingUser) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_registrations')
          .update({ body_fat: bfRounded.toString(), updated_at: new Date().toISOString() })
          .eq('email', user.email)

        if (updateError) throw updateError
      } else {
        // Create a new record if one doesn't exist
        const { error: insertError } = await supabase
          .from('user_registrations')
          .insert({ 
            email: user.email, 
            body_fat: bfRounded.toString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }

    } catch (error) {
      const err = error as { message?: string }
      console.error('Error auto-saving to profile:', err)
      showPopup('Calculation Complete, Save Failed', err.message || 'Result calculated, but failed to save to your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const clear = () => {
    setAge('')
    setWeight('')
    setHeight('')
    setNeck('')
    setWaist('')
    setHip('')
    setHeightFeet('')
    setHeightInches('')
    setNeckFeet('')
    setNeckInches('')
    setWaistFeet('')
    setWaistInches('')
    setHipFeet('')
    setHipInches('')
    setResult(null)
    setCategory('')
  }

  return (
    <>
        <div className="min-h-screen py-6 px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6 text-black">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center text-gray-800">Body Fat Calculator</h2>

          <div className="flex justify-center gap-3 mb-4 md:mb-6">
            <button
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition text-sm md:text-base ${
                unit === 'metric' 
                  ? 'bg-sky-500 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setUnit('metric')}
            >
              Metric Units
            </button>
            <button
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition text-sm md:text-base ${
                unit === 'us' 
                  ? 'bg-sky-500 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setUnit('us')}
            >
              US Units
            </button>
          </div>

          <div className="flex gap-4 md:gap-6 justify-center mb-4 md:mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="gender" 
                value="male" 
                checked={gender === 'male'} 
                onChange={() => setGender('male')}
                className="w-4 h-4 text-sky-500"
              />
              <span className="font-medium">Male</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="gender" 
                value="female" 
                checked={gender === 'female'} 
                onChange={() => setGender('female')}
                className="w-4 h-4 text-sky-500"
              />
              <span className="font-medium">Female</span>
            </label>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
              <input 
                type="number"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
              />
            </div>

            {unit === 'metric' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Neck Circumference (cm)</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    value={neck} 
                    onChange={(e) => setNeck(e.target.value)}
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waist Circumference (cm)</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    value={waist} 
                    onChange={(e) => setWaist(e.target.value)}
                    min="1"
                    step="0.1"
                  />
                </div>

                {gender === 'female' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hip Circumference (cm)</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                      value={hip} 
                      onChange={(e) => setHip(e.target.value)}
                      min="1"
                      step="0.1"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (pounds)</label>
                  <input 
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feet</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={heightFeet} 
                        onChange={(e) => setHeightFeet(e.target.value)}
                        min="1"
                        max="8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Inches</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={heightInches} 
                        onChange={(e) => setHeightInches(e.target.value)}
                        min="0"
                        max="11"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Neck Circumference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feet</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={neckFeet} 
                        onChange={(e) => setNeckFeet(e.target.value)}
                        min="0"
                        max="2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Inches</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={neckInches} 
                        onChange={(e) => setNeckInches(e.target.value)}
                        min="0"
                        max="11"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waist Circumference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feet</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={waistFeet} 
                        onChange={(e) => setWaistFeet(e.target.value)}
                        min="0"
                        max="5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Inches</label>
                      <input 
                        type="number"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        value={waistInches} 
                        onChange={(e) => setWaistInches(e.target.value)}
                        min="0"
                        max="11"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {gender === 'female' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hip Circumference</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Feet</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                          value={hipFeet} 
                          onChange={(e) => setHipFeet(e.target.value)}
                          min="0"
                          max="5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Inches</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                          value={hipInches} 
                          onChange={(e) => setHipInches(e.target.value)}
                          min="0"
                          max="11"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 md:mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="btn-primary w-full px-6 py-3 text-base"
                onClick={calculate}
                disabled={isSaving}
              >
                {isSaving ? 'Calculating & Saving...' : 'Calculate Body Fat'}
              </button>
              <button 
                className="btn-secondary w-full px-6 py-3 text-base"
                onClick={clear}
                disabled={isSaving}
              >
                Clear All
              </button>
            </div>
          </div>

          {result !== null && (
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-sky-50 rounded-lg text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Your Result</h3>
              <p className="text-4xl md:text-5xl font-extrabold text-sky-600 my-2">
                {result}%
              </p>
              <p className="font-semibold text-lg text-gray-700">{category}</p>
            </div>
          )}
        </div>
      </div>

      <SuccessModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </>
  )
}
