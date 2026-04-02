"use client"
import { supabase } from "@/lib/supabase"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [deadline, setDeadline] = useState("1 week")
  const [isLoading, setIsLoading] = useState(false)
  const [tasks, setTasks] = useState<
    { title: string; scheduled_date: string; start_time: string; end_time: string; duration_minutes: number }[]
  >([])
  const [goals, setGoals] = useState<{ id: number; name: string; deadline: string }[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [hoursPerDay, setHoursPerDay] = useState("")
  const [constraints, setConstraints] = useState("")

  useEffect(() => {
    async function loadGoals() {
      const { data } = await supabase.from("goals").select()
      if (data) setGoals(data)
    }
    loadGoals()
  }, [])

  useEffect(() => {
    if (!selectedGoalId) return
    async function loadTasks() {
      const { data } = await supabase
        .from("tasks")
        .select()
        .eq("goal_id", selectedGoalId)
      if (data) setTasks(data)
    }
    loadTasks()
  }, [selectedGoalId])

  async function deleteGoal(id: number) {
    await supabase.from("goals").delete().eq("id", id)
    const { data } = await supabase.from("goals").select()
    if (data) setGoals(data)
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white pt-14">

      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 z-10">
        <h1 className="text-lg font-bold">Goalkeeper</h1>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">My Goals</h2>

        <div className="flex-1 overflow-y-auto mb-4">
          {goals.map((goal, index) => (
            <div key={index} onClick={() => setSelectedGoalId(goal.id)}
              className={`bg-gray-800 rounded-lg p-3 mb-2 flex justify-between items-center cursor-pointer hover:bg-gray-700 ${selectedGoalId === goal.id ? "border border-blue-500" : ""}`}>
              {goal.name}
              <button onClick={() => deleteGoal(goal.id)} className="text-gray-500 hover:text-red-400">
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => setIsOpen(true)} className="w-full bg-blue-500 text-white p-3 rounded-lg">
          Add Goal
        </button>
      </div>


      {/* Popup for adding a goal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add a Goal</h2>
            <button onClick={() => setIsOpen(false)} className="absolute top-17 right-5 text-white hover:text-gray-400">
              ✕
            </button>
            <input type="text"
              className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Enter your goal" />

            <select value={deadline}
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
            onChange={(e) => setDeadline(e.target.value)}>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="3 month">3 month</option>
              <option value="6 month">6 month</option>
            </select>

            <input type="number"
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
            value={hoursPerDay}
            onChange ={(e) => setHoursPerDay(e.target.value)}
            placeholder="Enter the amount of hours you want to work per day"
            />

            <input type="text"
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4"
            value={constraints}
            onChange ={(e) => setConstraints(e.target.value)}
            placeholder="Enter any constraints you have"
            />

            <button onClick={async () => {
              setIsLoading(true)
              // 1. Save goal to Supabase
              const { data: goalData } = await supabase
                .from("goals")
                .insert({ name: goalName, deadline: deadline })
                .select()
                .single()

              // 2. Send goal to Claude API
              const response = await fetch("/api/breakdown", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goalName, deadline, hoursPerDay, constraints })
              })

              const { tasks } = await response.json()
              setTasks(tasks)

              // 3. Save tasks to Supabase
              const { error } = await supabase.from("tasks").insert(
                tasks.map(
                  (task: {
                    title: string
                    scheduled_date: string
                    start_time: string
                    end_time: string
                    duration_minutes: number
                  }) => ({
                    goal_id: goalData.id,
                    title: task.title,
                    scheduled_date: task.scheduled_date,
                    start_time: task.start_time,
                    end_time: task.end_time,
                    duration_minutes: task.duration_minutes,
                  })
                )
              )

              console.log("insert error:", error)
              console.log("goalData:", goalData)
              console.log("tasks to insert:", tasks)

              // 4. Reload goals and close
              const { data } = await supabase.from("goals").select()
              if (data) setGoals(data)
              setSelectedGoalId(goalData.id)
              setIsOpen(false)
              setIsLoading(false)
              setGoalName("")
              setDeadline("")
            }}>
              {isLoading ? "Generating your plan..." : "Add Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 p-6">
        <h2 className="text-lg font-semibold mb-4">My Schedule</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">Select a goal to see your plan</p>
        ) : (
          tasks.map((task, index) => (
            <div key={index} className="bg-gray-900 rounded-xl p-4 mb-3">
              <p className="font-medium">{task.title}</p>
              <p className="text-gray-400 text-sm">
                {task.scheduled_date} · {task.start_time}–{task.end_time} · {task.duration_minutes} mins
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
