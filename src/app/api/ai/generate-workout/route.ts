import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { goal, equipment, frequency, experience } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        name: "AI-Generated Push/Pull/Legs Split",
        days: [
          {
            name: "Push Day A",
            exercises: [
              { name: "Bench Press", sets: 4, reps: "8-10", rest: 90, notes: "Controlled descent" },
              { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: 75, notes: "Full range of motion" },
              { name: "Overhead Press", sets: 3, reps: "8-10", rest: 90, notes: "Keep core tight" },
              { name: "Lateral Raises", sets: 3, reps: "15-20", rest: 60, notes: "Light weight, strict form" },
              { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: 60, notes: "Full extension" },
            ],
          },
          {
            name: "Pull Day A",
            exercises: [
              { name: "Deadlift", sets: 4, reps: "5-6", rest: 180, notes: "Priority lift of the week" },
              { name: "Pull-ups", sets: 3, reps: "6-10", rest: 90, notes: "Dead hang at bottom" },
              { name: "Barbell Row", sets: 3, reps: "8-10", rest: 90, notes: "Elbows tight to body" },
              { name: "Face Pulls", sets: 3, reps: "15-20", rest: 60, notes: "Rear delt focus" },
              { name: "Hammer Curls", sets: 3, reps: "12-15", rest: 60, notes: "Slow eccentric" },
            ],
          },
          {
            name: "Legs Day A",
            exercises: [
              { name: "Squat", sets: 4, reps: "8-10", rest: 120, notes: "Depth below parallel" },
              { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: 90, notes: "Hamstring stretch at bottom" },
              { name: "Leg Press", sets: 3, reps: "12-15", rest: 90, notes: "High foot placement for glutes" },
              { name: "Leg Curl", sets: 3, reps: "12-15", rest: 60, notes: "Full range" },
              { name: "Calf Raises", sets: 4, reps: "15-20", rest: 45, notes: "Slow and controlled" },
            ],
          },
        ],
        notes: "Progressive overload: add 2.5kg when you can complete all sets at the top of the rep range with good form.",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: `Generate a personalized workout plan as JSON:
Goal: ${goal}
Available equipment: ${equipment}
Training frequency: ${frequency} days/week
Experience level: ${experience}

Return JSON format:
{
  "name": string,
  "days": [{ "name": string, "exercises": [{ "name": string, "sets": number, "reps": string, "rest": number, "notes": string }] }],
  "notes": string
}`,
        }],
        max_tokens: 2000,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error("Workout generation error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
