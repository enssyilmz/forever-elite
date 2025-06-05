'use client'

import { useState } from 'react'

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

  const getCategory = (bf: number) => {
    if (bf < 6) return 'Essential'
    if (bf < 14) return 'Athletes'
    if (bf < 18) return 'Fitness'
    if (bf < 25) return 'Average'
    return 'Obese'
  }

  const calculate = () => {
    let h: number
    let w: number
    let n: number
    let ws: number
    let hp: number = 0

    if (unit === 'metric') {
      h = parseFloat(height)
      w = parseFloat(weight)
      n = parseFloat(neck)
      ws = parseFloat(waist)
      if (gender === 'female') hp = parseFloat(hip)
    } else {
      const totalHeightInInches = parseFloat(heightFeet) * 12 + parseFloat(heightInches)
      const totalNeckInInches = parseFloat(neckFeet) * 12 + parseFloat(neckInches)
      const totalWaistInInches = parseFloat(waistFeet) * 12 + parseFloat(waistInches)
      const totalHipInches = parseFloat(hipFeet) * 12 + parseFloat(hipInches)

      h = totalHeightInInches * 2.54
      w = parseFloat(weight) * 0.453592
      n = totalNeckInInches * 2.54
      ws = totalWaistInInches * 2.54
      if (gender === 'female') hp = totalHipInches * 2.54
    }

    if (gender === 'male') {
      const bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(ws - n) + 0.15456 * Math.log10(h)) - 450
      const bfRounded = parseFloat(bodyFat.toFixed(1))
      setResult(bfRounded)
      setCategory(getCategory(bfRounded))
    } else {
      const bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(ws + hp - n) + 0.221 * Math.log10(h)) - 450
      const bfRounded = parseFloat(bodyFat.toFixed(1))
      setResult(bfRounded)
      setCategory(getCategory(bfRounded))
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
      <h2 className="text-2xl font-bold mb-4 text-center">Body Fat Calculator</h2>

      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${unit === 'metric' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setUnit('metric')}
        >
          Metric Units
        </button>
        <button
          className={`px-4 py-2 rounded ${unit === 'us' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setUnit('us')}
        >
          US Units
        </button>
      </div>

      <div className="flex gap-4 justify-center mb-4">
        <label className="flex items-center gap-2">
          <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
          Male
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
          Female
        </label>
      </div>

      <div className="grid gap-4 mb-4">
        <input placeholder="Age" className="border p-2 rounded" value={age} onChange={(e) => setAge(e.target.value)} />
        {unit === 'metric' ? (
          <>
            <input placeholder="Weight (kg)" className="border p-2 rounded" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <input placeholder="Height (cm)" className="border p-2 rounded" value={height} onChange={(e) => setHeight(e.target.value)} />
            <input placeholder="Neck (cm)" className="border p-2 rounded" value={neck} onChange={(e) => setNeck(e.target.value)} />
            <input placeholder="Waist (cm)" className="border p-2 rounded" value={waist} onChange={(e) => setWaist(e.target.value)} />
            {gender === 'female' && (
              <input placeholder="Hip (cm)" className="border p-2 rounded" value={hip} onChange={(e) => setHip(e.target.value)} />
            )}
          </>
        ) : (
          <>
            <input placeholder="Weight (pounds)" className="border p-2 rounded" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Height (feet)" className="border p-2 rounded" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
              <input placeholder="Height (inches)" className="border p-2 rounded" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
              <input placeholder="Neck (feet)" className="border p-2 rounded" value={neckFeet} onChange={(e) => setNeckFeet(e.target.value)} />
              <input placeholder="Neck (inches)" className="border p-2 rounded" value={neckInches} onChange={(e) => setNeckInches(e.target.value)} />
              <input placeholder="Waist (feet)" className="border p-2 rounded" value={waistFeet} onChange={(e) => setWaistFeet(e.target.value)} />
              <input placeholder="Waist (inches)" className="border p-2 rounded" value={waistInches} onChange={(e) => setWaistInches(e.target.value)} />
              {gender === 'female' && (
                <>
                  <input placeholder="Hip (feet)" className="border p-2 rounded" value={hipFeet} onChange={(e) => setHipFeet(e.target.value)} />
                  <input placeholder="Hip (inches)" className="border p-2 rounded" value={hipInches} onChange={(e) => setHipInches(e.target.value)} />
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button className="btn-primary w-full" onClick={calculate}>Calculate</button>
        <button className="btn-secondary w-full" onClick={clear}>Clear</button>
      </div>

      {result !== null && (
        <div className="mt-6 text-center bg-gray-50 dark:bg-neutral-800 p-4 rounded shadow-inner">
          <h3 className="text-lg font-semibold text-sky-500">Body Fat: {result}%</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">Category: {category}</p>
        </div>
      )}
    </div>
  )
}
