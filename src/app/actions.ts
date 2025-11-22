'use server';

import { detectTreesAndCalculateScore } from '@/ai/flows/detect-trees-and-calculate-score';
import { runCustomDetection } from '@/ai/flows/custom-tree-detection';
import { z } from 'zod';

const ActionInputSchema = z.object({
  photoDataUri: z.string(),
  landWidth: z.coerce.number().positive("Width must be a positive number."),
  landHeight: z.coerce.number().positive("Height must be a positive number."),
  unit: z.enum(['sqft', 'sqm']),
});

export async function getGreenScore(input: z.infer<typeof ActionInputSchema>) {
  console.log("➡️ [ACTION] getGreenScore CALLED");
  console.log("📥 RAW INPUT:", input);

  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error("❌ Zod Parsing Error:", parsedInput.error.errors);
    throw new Error(parsedInput.error.errors.map(e => e.message).join(', '));
  }

  console.log("✅ Input parsed successfully:", parsedInput.data);

  try {
    console.log("🌲 Using custom tree detection model…");
    console.log("📸 Sending image length:", parsedInput.data.photoDataUri.length);

    const result = await runCustomDetection(parsedInput.data);

    console.log("📤 [ACTION] Detection Result RECEIVED:", result);

    return result;

  } catch (error) {
    console.error("🔥 Error inside getGreenScore action:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";

    throw new Error(`Failed to calculate GreenScore. ${errorMessage}`);
  }
}
