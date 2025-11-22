'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateGreenScoreInputSchema = z.object({
  detectedTrees: z.number().describe('The number of trees detected in the image.'),
  landArea: z.number().describe('The area of the land.'),
  unit: z.enum(['sqft', 'sqm']).describe('The unit of measurement for the land area.'),
});
export type CalculateGreenScoreInput = z.infer<typeof CalculateGreenScoreInputSchema>;

const CalculateGreenScoreOutputSchema = z.object({
  greenScore: z.number().describe('The calculated GreenScore.'),
  treesRequired: z.number().describe('The number of trees required per 1000 sq ft.'),
});
export type CalculateGreenScoreOutput = z.infer<typeof CalculateGreenScoreOutputSchema>;

export async function calculateGreenScore(
  input: CalculateGreenScoreInput
): Promise<CalculateGreenScoreOutput> {
  console.log("🟢 calculateGreenScore() received:", input);
  return calculateGreenScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateGreenScorePrompt',
  input: { schema: CalculateGreenScoreInputSchema },
  output: { schema: CalculateGreenScoreOutputSchema },
  prompt: `You are an environmental expert calculating a GreenScore for a piece of land...`,
});

const calculateGreenScoreFlow = ai.defineFlow(
  {
    name: 'calculateGreenScoreFlow',
    inputSchema: CalculateGreenScoreInputSchema,
    outputSchema: CalculateGreenScoreOutputSchema,
  },
  async (input) => {
    console.log("📥 Starting calculateGreenScoreFlow...");
    console.log("🌲 Detected trees:", input.detectedTrees);
    console.log("📐 Land area:", input.landArea, input.unit);

    // ✅ Set to 5 trees per 1000 sqft for full GreenScore
    const treesRequiredPerThousandSqFt = 5;
    console.log("📌 Reference – Trees required per 1000 sqft:", treesRequiredPerThousandSqFt);

    let landAreaSqft = input.landArea;
    if (input.unit === "sqm") {
      landAreaSqft = input.landArea * 10.764;
      console.log("🔁 Converted sqm → sqft:", landAreaSqft);
    }

    const treesRequired = (landAreaSqft / 1000) * treesRequiredPerThousandSqFt;
    console.log("📊 Trees required for this land:", treesRequired);

    let greenScore = (input.detectedTrees / treesRequired) * 100; // scale to 100
    greenScore = Math.min(100, Math.round(greenScore));
    console.log("🟢 Final GreenScore (0-100):", greenScore);

    return {
      greenScore,
      treesRequired: treesRequiredPerThousandSqFt,
    };
  }
);
