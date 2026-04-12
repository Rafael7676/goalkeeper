"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
    const [newDay, setNewDay] = useState("")
    const [newStart, setNewStart] = useState("")
    const [newEnd, setNewEnd] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [hoursPerDay, setHoursPerDay] = useState("")
    const [wakeUpTime, setWakeUpTime] = useState("")
    const [bedTime, setBedTime] = useState("")
    const [fixed_commitments, setCommitments] = useState<{
        day: string
        start: string
        end: string
        label: string
    }[]>([])

    function addCommitment() {
        const newCommitment = {
            day: newDay,
            start: newStart,
            end: newEnd,
            label: newLabel
        }
        setCommitments([...fixed_commitments, newCommitment])
    }

    async function saveSettings() {
        await supabase.from("user_settings").upsert({
            id: 1,
            wake_time: wakeUpTime,
            sleep_time: bedTime,
            max_work_hours: hoursPerDay,
            fixed_commitments: fixed_commitments
        })
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            {/* Daily Rhythm */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Daily Rhythm</h2>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Max work hours per day</label>
                    <input type="number"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg"
                        placeholder="e.g. 4"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Wake up time</label>
                    <input type="time"
                        value={wakeUpTime}
                        onChange={(e) => setWakeUpTime(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Bed time</label>
                    <input type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="w-full bg-gray-800 text-white p-3 rounded-lg"
                    />
                </div>
            </section>

            {/* Fixed Commitments */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-300">Fixed Commitments</h2>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Day</label>
                        <input type="text"
                            value={newDay}
                            onChange={(e) => setNewDay(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg"
                            placeholder="e.g. Monday"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Label</label>
                        <input type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg"
                            placeholder="e.g. Gym"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Start time</label>
                        <input type="time"
                            value={newStart}
                            onChange={(e) => setNewStart(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">End time</label>
                        <input type="time"
                            value={newEnd}
                            onChange={(e) => setNewEnd(e.target.value)}
                            className="w-full bg-gray-800 text-white p-3 rounded-lg"
                        />
                    </div>
                </div>

                <button onClick={addCommitment}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg mb-4">
                    + Add Commitment
                </button>

                {/* Commitments list */}
                {fixed_commitments.map((c, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 mb-2 flex justify-between items-center">
                        <span className="font-medium">{c.label}</span>
                        <span className="text-gray-400 text-sm">{c.day} · {c.start}–{c.end}</span>
                    </div>
                ))}
            </section>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold"
            onClick={saveSettings}>
                Save Settings
            </button>
        </div >
    )
}