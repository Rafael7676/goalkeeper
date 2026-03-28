import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  const { goalName, deadline } = await request.json()
  const today = new Date().toISOString().split('T')[0]



  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2500,
    messages: [
      {
        role: "user",
        content: `Today's date is ${today}. Create a plan for this goal: "${goalName}" with deadline: "${deadline}".
        Return ONLY a JSON array of tasks, no other text. Each task should have:
        - title (string)
        - scheduled_date (YYYY-MM-DD format)
        - duration_minutes (number)
        
        Example format:
        [{"title": "Task 1", "scheduled_date": "2026-04-01", "duration_minutes": 30}]`
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