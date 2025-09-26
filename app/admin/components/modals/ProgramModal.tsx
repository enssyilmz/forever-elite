'use client'

import React from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { CustomProgram } from '@/lib/database.types'

interface WorkoutDay {
  day_number: number
  week_number: number
  workout_name: string
  description: string
  rest_time_seconds: number
  exercises: Exercise[]
}

interface Exercise {
  exercise_name: string
  sets: number
  reps: string
  weight: string
  rest_time_seconds: number
  notes: string
}

export default function ProgramModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  users,
  formatUserName,
  onSubmit,
  editingProgram
}: {
  isOpen: boolean
  onClose: () => void
  formData: {
    title: string
    description: string
    user_id: string
    difficulty_level: string
    duration_weeks: number
    notes: string
    workouts: WorkoutDay[]
  }
  setFormData: React.Dispatch<any>
  users: any[]
  formatUserName: (u: any) => string | null
  onSubmit: (e: React.FormEvent) => Promise<void>
  editingProgram: CustomProgram | null
}) {
  if (!isOpen) return null

  const addWorkoutDay = () => {
    const newWorkout: WorkoutDay = {
      day_number: formData.workouts.length + 1,
      week_number: 1,
      workout_name: '',
      description: '',
      rest_time_seconds: 60,
      exercises: []
    }
    setFormData({ ...formData, workouts: [...formData.workouts, newWorkout] })
  }

  const updateWorkout = (index: number, workout: WorkoutDay) => {
    const updated = [...formData.workouts]
    updated[index] = workout
    setFormData({ ...formData, workouts: updated })
  }

  const removeWorkout = (index: number) => {
    const updated = formData.workouts.filter((_, i) => i !== index)
    setFormData({ ...formData, workouts: updated })
  }

  const addExercise = (workoutIndex: number) => {
    const newEx: Exercise = {
      exercise_name: '',
      sets: 3,
      reps: '8-12',
      weight: '',
      rest_time_seconds: 60,
      notes: ''
    }
    const updated = [...formData.workouts]
    updated[workoutIndex].exercises.push(newEx)
    setFormData({ ...formData, workouts: updated })
  }

  const updateExercise = (workoutIndex: number, exerciseIndex: number, exercise: Exercise) => {
    const updated = [...formData.workouts]
    updated[workoutIndex].exercises[exerciseIndex] = exercise
    setFormData({ ...formData, workouts: updated })
  }

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const updated = [...formData.workouts]
    updated[workoutIndex].exercises = updated[workoutIndex].exercises.filter((_, i) => i !== exerciseIndex)
    setFormData({ ...formData, workouts: updated })
  }

  return (
    <div 
      className="fixed inset-0 bg-black/10 backdrop-blur-md flex justify-center items-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-2 sm:mx-4 my-2 sm:my-4 md:my-8 relative max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b flex-shrink-0">
          <h2 className="text-responsive-lg font-semibold text-gray-900">
            {editingProgram ? 'Edit Program' : 'Create New Program'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label htmlFor="title" className="block text-responsive-sm font-medium text-gray-700">Program Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-responsive-sm mt-1 block w-full text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="user_id" className="block text-responsive-sm font-medium text-gray-700">Select User</label>
                <select
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="input-responsive-sm mt-1 block w-full text-black"
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatUserName(user) || 'No name'} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="difficulty_level" className="block text-responsive-sm font-medium text-gray-700">Difficulty Level</label>
                <select
                  id="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="input-responsive-sm mt-1 block w-full text-black"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="duration_weeks" className="block text-responsive-sm font-medium text-gray-700">Duration (weeks)</label>
                <input
                  type="number"
                  id="duration_weeks"
                  value={formData.duration_weeks || ''}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 0 })}
                  className="input-responsive-sm mt-1 block w-full text-black"
                  min="1"
                  max="52"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-responsive-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-responsive-sm mt-1 block w-full text-black"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-responsive-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-responsive-sm mt-1 block w-full text-black"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
                <h3 className="text-responsive-base font-medium text-gray-900">Workout Days</h3>
                <button type="button" onClick={addWorkoutDay} className="btn-tertiary-sm flex items-center gap-2">
                  <Plus size={16} />
                  Add Workout Day
                </button>
              </div>

              {formData.workouts.map((workout, workoutIndex) => (
                <div key={workoutIndex} className="border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                    <h4 className="text-responsive-sm font-medium text-gray-900">Day {workout.day_number}</h4>
                    <button type="button" onClick={() => removeWorkout(workoutIndex)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700">Workout Name</label>
                      <input
                        type="text"
                        value={workout.workout_name}
                        onChange={(e) => updateWorkout(workoutIndex, { ...workout, workout_name: e.target.value })}
                        className="input-responsive-sm mt-1 block w-full text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700">Week Number</label>
                      <input
                        type="number"
                        value={workout.week_number}
                        onChange={(e) => updateWorkout(workoutIndex, { ...workout, week_number: parseInt(e.target.value) })}
                        className="input-responsive-sm mt-1 block w-full text-black"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-responsive-sm font-medium text-gray-700">Rest Time (seconds)</label>
                      <input
                        type="number"
                        value={workout.rest_time_seconds}
                        onChange={(e) => updateWorkout(workoutIndex, { ...workout, rest_time_seconds: parseInt(e.target.value) })}
                        className="input-responsive-sm mt-1 block w-full text-black"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mb-2 sm:mb-3 md:mb-4">
                    <label className="block text-responsive-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={workout.description}
                      onChange={(e) => updateWorkout(workoutIndex, { ...workout, description: e.target.value })}
                      className="input-responsive-sm mt-1 block w-full text-black"
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-responsive-sm font-medium text-gray-800">Exercises</h5>
                      <button type="button" onClick={() => addExercise(workoutIndex)} className="btn-fourth-sm flex items-center gap-1">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add Exercise
                      </button>
                    </div>

                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="border border-gray-100 rounded-md p-2 sm:p-3 mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-responsive-sm font-medium text-gray-700">Exercise {exerciseIndex + 1}</span>
                          <button type="button" onClick={() => removeExercise(workoutIndex, exerciseIndex)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Exercise Name</label>
                            <input
                              type="text"
                              value={exercise.exercise_name}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, exercise_name: e.target.value })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Sets</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, sets: parseInt(e.target.value) })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, reps: e.target.value })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                              placeholder="e.g., 8-12, 15, to failure"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Weight</label>
                            <input
                              type="text"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, weight: e.target.value })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                              placeholder="e.g., 20kg, bodyweight"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Rest (seconds)</label>
                            <input
                              type="number"
                              value={exercise.rest_time_seconds}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, rest_time_seconds: parseInt(e.target.value) })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600">Notes</label>
                            <input
                              type="text"
                              value={exercise.notes}
                              onChange={(e) => updateExercise(workoutIndex, exerciseIndex, { ...exercise, notes: e.target.value })}
                              className="input-responsive-sm mt-1 block w-full text-black"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 md:pt-4 border-t mt-3 md:mt-4 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary-sm">Cancel</button>
            <button type="submit" className="btn-primary-sm">{editingProgram ? 'Update Program' : 'Create Program'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}


