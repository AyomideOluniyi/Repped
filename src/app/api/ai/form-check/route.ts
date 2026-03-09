import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { exercise } = await request.json();
  if (!exercise?.trim()) return NextResponse.json({ error: "Exercise name required" }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are an expert strength and conditioning coach specialising in exercise form and biomechanics.
Analyse the given exercise and provide realistic, specific form feedback as if you watched a video of someone performing it.
Assume the person has intermediate experience and may have common form errors for that lift.
Respond ONLY with valid JSON matching this exact structure:
{
  "exercise": "string (normalised exercise name)",
  "rating": number (6-9, realistic score),
  "feedback": [
    { "type": "positive", "point": "string" },
    { "type": "issue", "point": "string" }
  ],
  "cues": ["string", "string", "string"]
}
Include 2-3 positives and 2-3 issues. Cues should be actionable coaching cues specific to this exercise.`,
        },
        {
          role: "user",
          content: `Exercise: ${exercise.trim()}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
