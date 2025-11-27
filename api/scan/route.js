import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image missing" }, { status: 400 });
    }

    // ---- 1. CHAMAR CLARIFAI ----
    const clarifaiKey = process.env.CLARIFAI_API_KEY;
    if (!clarifaiKey) {
      return NextResponse.json(
        { error: "Clarifai API Key missing" },
        { status: 500 }
      );
    }

    const clarifaiResp = await fetch(
      "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${clarifaiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: { base64: imageBase64 }
              }
            }
          ]
        })
      }
    );

    const clarifaiData = await clarifaiResp.json();

    const concept =
      clarifaiData?.outputs?.[0]?.data?.concepts?.[0]?.name || null;

    if (!concept) {
      return NextResponse.json(
        { error: "No food detected" },
        { status: 422 }
      );
    }

    const foodName = concept.toLowerCase();

    // ---- 2. MINI BANCO DE ALIMENTOS ----
    const FOOD_DATA = {
      banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      egg: { calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
      steak: { calories: 271, protein: 25, carbs: 0, fat: 19 }
    };

    const macros = FOOD_DATA[foodName] || null;

    return NextResponse.json({
      food: foodName,
      confidence:
        clarifaiData.outputs?.[0]?.data?.concepts?.[0]?.value || 0,
      macros
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
