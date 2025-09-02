'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Pause,
  CheckCircle,
  Timer,
  Activity,
  User as UserIcon
} from 'lucide-react'
import { CustomProgram, CustomWorkout, CustomExercise } from '@/lib/database.types'

export default function MyWorkoutsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [programs, setPrograms] = useState<CustomProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null)
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/signup')
          return
        }
        
        setUser(user)
        await fetchPrograms()
      } catch (e: any) {
        setError('Authentication error: ' + e.message)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/custom-programs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs')
      }
      
      const data = await response.json()
      setPrograms(data.programs || [])
    } catch (e: any) {
      setError('Failed to fetch programs: ' + e.message)
    }
  }

  const toggleProgramExpansion = (programId: number) => {
    setExpandedProgram(expandedProgram === programId ? null : programId)
    setExpandedWorkout(null) // Close any open workout when switching programs
  }

  const toggleWorkoutExpansion = (workoutId: number) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId)
  }

  const formatRestTime = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }
    return `${seconds}s`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const groupWorkoutsByWeek = (workouts: CustomWorkout[]) => {
    const grouped = workouts.reduce((acc, workout) => {
      const week = workout.week_number || 1
      if (!acc[week]) acc[week] = []
      acc[week].push(workout)
      return acc
    }, {} as { [key: number]: CustomWorkout[] })

    // Sort workouts within each week by day_number
    Object.keys(grouped).forEach(week => {
      grouped[parseInt(week)].sort((a, b) => a.day_number - b.day_number)
    })

    return grouped
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-700">
        <Activity size={64} className="mb-4" />
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-center mb-4">{error}</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Dumbbell size={24} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Custom Programs</h1>
                <p className="text-sm text-gray-600">
                  Personalized workout programs designed just for you
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-full">
                <UserIcon size={20} className="text-gray-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <div className="text-gray-500">
                  {programs.length} {programs.length === 1 ? 'program' : 'programs'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Dumbbell size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Custom Programs Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Your trainer hasn't created any custom programs for you yet.
            </p>
            <button
              onClick={() => router.push('/packages')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse General Packages
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {programs.map((program) => {
              const isExpanded = expandedProgram === program.id
              const groupedWorkouts = groupWorkoutsByWeek(program.workouts || [])
              
              return (
                <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Program Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleProgramExpansion(program.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {program.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(program.difficulty_level)}`}>
                            {program.difficulty_level}
                          </span>
                        </div>
                        
                        {program.description && (
                          <p className="text-gray-600 mb-3">{program.description}</p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{program.duration_weeks} weeks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity size={16} />
                            <span>{program.workouts?.length || 0} workouts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>Created {new Date(program.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Program Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {program.notes && (
                        <div className="p-6 bg-blue-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">Trainer Notes:</h4>
                          <p className="text-gray-700 text-sm">{program.notes}</p>
                        </div>
                      )}
                      
                      {Object.keys(groupedWorkouts).length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <p>No workouts have been added to this program yet.</p>
                        </div>
                      ) : (
                        Object.keys(groupedWorkouts).map((weekKey) => {
                          const week = parseInt(weekKey)
                          const workouts = groupedWorkouts[week]
                          
                          return (
                            <div key={week} className="border-b border-gray-200 last:border-b-0">
                              <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900">Week {week}</h4>
                              </div>
                              
                              <div className="divide-y divide-gray-200">
                                {workouts.map((workout) => {
                                  const isWorkoutExpanded = expandedWorkout === workout.id
                                  
                                  return (
                                    <div key={workout.id}>
                                      <div 
                                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleWorkoutExpansion(workout.id)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                                Day {workout.day_number}
                                              </span>
                                              <h5 className="font-medium text-gray-900">
                                                {workout.workout_name}
                                              </h5>
                                            </div>
                                            
                                            {workout.description && (
                                              <p className="text-sm text-gray-600 mb-2">{workout.description}</p>
                                            )}
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                              <div className="flex items-center gap-1">
                                                <Target size={12} />
                                                <span>{workout.exercises?.length || 0} exercises</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Timer size={12} />
                                                <span>Rest: {formatRestTime(workout.rest_time_seconds)}</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            {isWorkoutExpanded ? (
                                              <ChevronUp size={16} className="text-gray-400" />
                                            ) : (
                                              <ChevronDown size={16} className="text-gray-400" />
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Workout Exercises */}
                                      {isWorkoutExpanded && (
                                        <div className="bg-gray-50 border-t border-gray-200">
                                          {workout.exercises && workout.exercises.length > 0 ? (
                                            <div className="p-4">
                                              <h6 className="font-medium text-gray-900 mb-3">Exercises:</h6>
                                              <div className="space-y-3">
                                                {workout.exercises
                                                  .sort((a, b) => a.order_index - b.order_index)
                                                  .map((exercise, index) => (
                                                    <div key={exercise.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                      <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                          <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                                            {index + 1}
                                                          </span>
                                                          <h6 className="font-medium text-gray-900">
                                                            {exercise.exercise_name}
                                                          </h6>
                                                        </div>
                                                      </div>
                                                      
                                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                          <span className="text-gray-500">Sets:</span>
                                                          <span className="ml-2 font-medium">{exercise.sets}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Reps:</span>
                                                          <span className="ml-2 font-medium">{exercise.reps || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Weight:</span>
                                                          <span className="ml-2 font-medium">{exercise.weight || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-gray-500">Rest:</span>
                                                          <span className="ml-2 font-medium">{formatRestTime(exercise.rest_time_seconds)}</span>
                                                        </div>
                                                      </div>
                                                      
                                                      {exercise.notes && (
                                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                          <p className="text-sm text-yellow-800">
                                                            <strong>Note:</strong> {exercise.notes}
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="p-4 text-center text-gray-500">
                                              <p>No exercises have been added to this workout yet.</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 