"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [deadline, setDeadline] = useState("")
  const [goals, setGoals] = useState<{ name: string; deadline: string }[]>([])

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 p-6">
        <h2>My Goals</h2>
        {goals.map((goal, index) => (
    <div key={index}>
    {goal.name}
    </div>
    ))}
        
        <button onClick={() => setIsOpen(true)} className="w-full bg-blue-400 text-white p-3 rounded-lg">
          Add Goal
        </button>
      </div>

      {isOpen && ( 
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Add a Goal</h2>
      <button onClick={() => setIsOpen(false)} className="absolute top-4 right-5 text-white hover:text-gray-400">
      ✕
      </button>
      <input type = "text"
      value={goalName}
       onChange={(e) => setGoalName(e.target.value)}
       placeholder = "Enter your goal" />
      <input type = "date"
      value={deadline}
      onChange={(e) => setDeadline(e.target.value)}
      placeholder = "Enter the deadline" />
      <button onClick={() => {
        setGoals([...goals, { name: goalName, deadline: deadline }])
        setIsOpen(false)
        setGoalName("")
        setDeadline("")
      }}>
        Add Goal
      </button>
    </div>
  </div>
)}

      {/* Main area */}
      <div className="flex-1 p-6">
        <h2>My Schedule</h2>
      </div>

    </div>
  )
}
