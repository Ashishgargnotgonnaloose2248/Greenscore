'use server';
/**
 * @fileOverview A tool that uses a custom tree detection model.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const customTreeDetectorTool = ai.defineTool(
  {
    name: 'customTreeDetector',
    description: 'A tool that takes an image of a land area and returns the number of trees detected.',
    inputSchema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of the land area, as a data URI that must include a MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
    outputSchema: z.object({
      numberOfTrees: z.number().describe('The number of trees detected in the image.'),
      annotatedImage: z.string().optional().describe("URL or base64 image returned by Roboflow."),
    }),
  },
  async (input) => {
    console.log("🔥 [customTreeDetectorTool] STARTED");
    console.log("📷 Received photoDataUri length:", input.photoDataUri?.length);

    const apiKey = process.env.CUSTOM_MODEL_API_KEY;
    console.log("🔑 Loaded CUSTOM_MODEL_API_KEY:", apiKey ? "YES" : "NO");

    if (!apiKey) {
      throw new Error('CUSTOM_MODEL_API_KEY is not set in environment.');
    }

    // Extract Base64 ONLY (remove "data:image/...;base64,")
    let base64 = "";
    try {
      base64 = input.photoDataUri.split(',')[1];
      console.log("🧪 Base64 extracted. Length:", base64?.length);
    } catch (err) {
      console.error("❌ Failed to extract Base64:", err);
      throw new Error("Invalid photoDataUri format");
    }

    const endpoint =
      "https://serverless.roboflow.com/greenscore/workflows/detect-count-and-visualize-4";

    console.log("🌍 Roboflow Endpoint:", endpoint);

    try {
      console.log("🚀 Sending request to Roboflow...");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          inputs: {
            image: {
              type: "base64",
              value: base64,
            },
          },
        }),
      });

      console.log("📩 Roboflow responded with status:", response.status);

      const resultText = await response.text();
      console.log("📄 Raw Roboflow response text:", resultText);

      let result = null;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        console.error("❌ Failed to parse JSON:", err);
        throw new Error("Roboflow returned invalid JSON");
      }

      if (!response.ok) {
        console.error("❌ Roboflow API Error:", result);
        throw new Error(result.error || "Roboflow API error");
      }

      console.log("📦 Parsed Roboflow result:", result);

      const treeCount =
        result?.outputs?.[0]?.trees?.count ??
        result?.outputs?.[0]?.predictions?.length ??
        0;

      console.log("🌲 Detected trees:", treeCount);

      const annotated =
        result?.outputs?.[0]?.visualization ?? null;

      console.log("🖼 Annotated Image:", annotated ? "YES" : "NO");

      console.log("✅ [customTreeDetectorTool] COMPLETED");

      return {
        numberOfTrees: treeCount,
        annotatedImage: annotated,
      };
    } catch (error) {
      console.error("❌ Error calling Roboflow model:", error);
      throw new Error("Failed to detect trees using Roboflow.");
    }
  }
);
