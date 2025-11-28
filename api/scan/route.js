export const runtime = "edge";

export async function POST(req) {
  try {
    // Pega o arquivo enviado via form-data
    const formData = await req.formData();
    const file = formData.get("image"); // campo 'image'

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Nenhuma imagem enviada" }),
        { status: 400 }
      );
    }

    // Converte o arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Chama a API da Clarifai
    const response = await fetch(
      "https://api.clarifai.com/v2/models/food-item-v1/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { base64: base64Image } } }],
        }),
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
