import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    const workflowUrl = process.env.ROBOFLOW_WORKFLOW_URL;

    if (!apiKey || !workflowUrl) {
      return NextResponse.json(
        { error: "Missing API key or URL" },
        { status: 500 }
      );
    }

    const roboflowResponse = await fetch(workflowUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: {
          image: {
            type: "base64",
            value: image.split(",")[1],
          },
        },
        options: { show_labels: false, show_confidence: false },
      }),
    });

    const data = await roboflowResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
