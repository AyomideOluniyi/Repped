import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageUrl, imageBase64 } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        name: "Cable Machine",
        category: "Cable Equipment",
        primaryMuscles: ["Chest", "Back", "Shoulders", "Arms"],
        exercises: [
          { name: "Cable Crossover", description: "Stand between pulleys, bring hands together in a hugging motion.", difficulty: "Intermediate" },
          { name: "Lat Pulldown", description: "Attach a wide bar, pull down to chin level while leaning slightly back.", difficulty: "Beginner" },
          { name: "Tricep Pushdown", description: "Using a rope or bar attachment, push down to full extension.", difficulty: "Beginner" },
        ],
        setupInstructions: "Adjust the pulley height for your target exercise. Select appropriate weight using the pin.",
        commonMistakes: ["Using too much weight with poor form", "Not controlling the negative portion"],
        adjustmentTips: "Most cable machines have adjustable pulley heights. Lower for rows, higher for pushdowns, mid-level for crossovers.",
      });
    }

    const imageContent = imageBase64
      ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" } }
      : { type: "image_url", image_url: { url: imageUrl } };

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
          content: [
            imageContent,
            {
              type: "text",
              text: `Identify this gym equipment and return JSON:
{
  "name": string,
  "category": string,
  "primaryMuscles": string[],
  "exercises": [{ "name": string, "description": string, "difficulty": "Beginner"|"Intermediate"|"Advanced" }],
  "setupInstructions": string,
  "commonMistakes": string[],
  "adjustmentTips": string
}
Return only valid JSON.`,
            },
          ],
        }],
        max_tokens: 800,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from AI");
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("Equipment ID error:", err);
    return NextResponse.json({ error: "Identification failed" }, { status: 500 });
  }
}
