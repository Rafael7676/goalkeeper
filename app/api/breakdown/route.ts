import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})


export async function POST(request: Request) {
  const { goalName, deadline, hoursPerDay, constraints } = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const { data: settings } = await supabase
  .from("user_settings")
  .select()
  .eq("id", 1)
  .single()


  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    messages: [
      {
        role: "user",
        content: `Today's date is ${today}. Create a plan for this goal: "${goalName}" with deadline: "${deadline}".
        The user has ${hoursPerDay} hours per day available.
        Constraints: ${constraints || "none"}.
        Fixed commitments: ${JSON.stringify(settings.fixed_commitments)}.
        Wake up time: ${settings.wake_time}.
        Bed time: ${settings.sleep_time}.



        Return ONLY a JSON array of tasks, no other text. Each task should have:
        - title (string)
        - scheduled_date (YYYY-MM-DD format)
        - start_time (HH:MM, 24h format)
        - end_time (HH:MM, 24h format)
        - duration_minutes (number)
        
        
        Example format:
        [{"title": "Task 1", "scheduled_date": "2026-04-01","start_time": "13:00",
        "end_time": "14:30", "duration_minutes": 90}]`
      }
    ]
  })

  const content = message.content[0]
  if (content.type !== "text") {
    return NextResponse.json({ error: "No response" }, { status: 500 })
  }

  const tasks = JSON.parse(content.text)
  return NextResponse.json({ tasks })
}