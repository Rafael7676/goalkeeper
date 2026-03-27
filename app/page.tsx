"use client"
import { supabase } from "@/lib/supabase"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [deadline, setDeadline] = useState("")
  const [tasks, setTasks] = useState<{ title: string; scheduled_date: string; duration_minutes: number }[]>([])
  const [goals, setGoals] = useState<{ name: string; deadline: string }[]>([])

  useEffect(() => {
    async function loadGoals() {
      const { data } = await supabase.from("goals").select()
      if (data) setGoals(data)
    }
    loadGoals()
  }, [])

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

      <button onClick={async() => {
  // 1. Save goal to Supabase
  await supabase
    .from("goals")
    .insert({ name: goalName, deadline: deadline })

  // 2. Send goal to Claude API
  const response = await fetch("/api/breakdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goalName, deadline })
  })

  const { tasks } = await response.json()
  setTasks(tasks)

  // 3. Reload goals and close
  const { data } = await supabase.from("goals").select()
  if (data) setGoals(data)
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
  <h2 className="text-lg font-semibold mb-4">My Schedule</h2>
  {tasks.map((task, index) => (
    <div key={index} className="bg-gray-900 rounded-xl p-4 mb-3">
      <p className="font-medium">{task.title}</p>
      <p className="text-gray-400 text-sm">{task.scheduled_date} · {task.duration_minutes} mins</p>
    </div>
  ))}
</div>

    </div>
  )
}
