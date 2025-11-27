export const runtime = "edge";

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem enviada" }),
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.clarifai.com/v2/models/food-item-v1/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { base64: image } } }]
        })
      }
    );

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
