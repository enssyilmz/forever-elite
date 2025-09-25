import { CustomProgram } from '@/lib/database.types'
import { Calendar, Clock, User, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import dayjs from 'dayjs'

interface CustomProgramsProps {
  programs: CustomProgram[]
  loading: boolean
}

export default function CustomPrograms({ programs, loading }: CustomProgramsProps) {
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null)
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <Dumbbell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Custom Programs</h3>
        <p className="text-gray-500">You don't have any custom programs yet. Your trainer will create personalized programs for you.</p>
      </div>
    )
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Your Custom Programs</h3>
        <p className="text-gray-600 mb-6">Personalized workout programs created by your trainer.</p>
        
        <div className="space-y-4">
          {programs.map((program) => (
            <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">{program.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(program.difficulty_level)}`}>
                        {program.difficulty_level}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{program.duration_weeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Created {dayjs(program.created_at).format('DD/MM/YYYY')}</span>
                      </div>
                    </div>
                    
                    {program.description && (
                      <p className="text-gray-700 text-sm">{program.description}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                    className="ml-4 p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {expandedProgram === program.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              {expandedProgram === program.id && (
                <div className="p-4 border-t">
                  {program.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-1">Trainer Notes</h5>
                      <p className="text-blue-700 text-sm">{program.notes}</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-800 mb-3">Workout Schedule</h5>
                    {program.workouts?.length ? (
                      program.workouts.map((workout, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div 
                            className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setExpandedWorkout(expandedWorkout === index ? null : index)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="font-medium text-gray-800">
                                  Day {workout.day_number}: {workout.workout_name}
                                </h6>
                                <p className="text-sm text-gray-600">
                                  Week {workout.week_number} • Rest: {workout.rest_time_seconds}s
                                </p>
                              </div>
                              {expandedWorkout === index ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                          </div>
                          
                          {expandedWorkout === index && (
                            <div className="p-3 border-t">
                              {workout.description && (
                                <p className="text-sm text-gray-700 mb-3">{workout.description}</p>
                              )}
                              
                              {workout.exercises?.length ? (
                                <div className="space-y-2">
                                  <h6 className="font-medium text-gray-800">Exercises</h6>
                                  {workout.exercises.map((exercise, exIndex) => (
                                    <div key={exIndex} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <h6 className="font-medium text-gray-800">{exercise.exercise_name}</h6>
                                        <span className="text-xs text-gray-600">Rest: {exercise.rest_time_seconds}s</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span><strong>Sets:</strong> {exercise.sets}</span>
                                        <span><strong>Reps:</strong> {exercise.reps}</span>
                                        {exercise.weight && <span><strong>Weight:</strong> {exercise.weight}</span>}
                                      </div>
                                      {exercise.notes && (
                                        <p className="text-xs text-gray-600 mt-1 italic">{exercise.notes}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No exercises added yet.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No workouts scheduled yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
