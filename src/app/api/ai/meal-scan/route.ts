import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageUrl, imageBase64 } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      // Return mock data if no API key configured
      return NextResponse.json({
        foods: [
          { name: "Grilled Chicken Breast", quantity: "180g", calories: 297, protein: 56, carbs: 0, fat: 6 },
          { name: "Brown Rice", quantity: "1 cup", calories: 216, protein: 5, carbs: 45, fat: 2 },
          { name: "Broccoli", quantity: "1 cup", calories: 55, protein: 4, carbs: 11, fat: 1 },
        ],
        totals: { calories: 568, protein: 65, carbs: 56, fat: 9 },
        healthRating: 9,
        healthNotes: "Excellent high-protein, nutrient-dense meal with good complex carbs and vegetables.",
        suggestions: ["Great meal for muscle building!", "Consider adding healthy fats like olive oil for better nutrient absorption."],
      });
    }

    const imageContent = imageBase64
      ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              imageContent,
              {
                type: "text",
                text: `Analyze this meal photo and return a JSON object with:
{
  "foods": [{ "name": string, "quantity": string, "calories": number, "protein": number, "carbs": number, "fat": number }],
  "totals": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "healthRating": number (1-10),
  "healthNotes": string,
  "suggestions": string[]
}
Be specific about food items and realistic with estimates. Return only valid JSON.`,
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    // Save to meal log
    await prisma.mealLog.create({
      data: {
        userId: session.user.id,
        photoUrl: imageUrl,
        aiAnalysis: parsed,
        calories: parsed.totals?.calories,
        protein: parsed.totals?.protein,
        carbs: parsed.totals?.carbs,
        fat: parsed.totals?.fat,
        rating: parsed.healthRating,
        aiSuggestions: parsed.suggestions?.join("\n"),
      },
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Meal scan error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
