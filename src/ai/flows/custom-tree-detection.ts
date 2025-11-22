'use server';
/**
 * @fileOverview A flow that uses a custom tool to detect trees and then calculates a GreenScore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { customTreeDetectorTool } from '../tools/custom-tree-detector';
import { calculateGreenScore } from './calculate-green-score';

const CustomTreeDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the land area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  landWidth: z.number().describe('The width of the land area.'),
  landHeight: z.number().describe('The height of the land area.'),
  unit: z.enum(['sqft', 'sqm']).describe('The unit of measurement for the land area.'),
});
export type CustomTreeDetectionInput = z.infer<typeof CustomTreeDetectionInputSchema>;

const CustomTreeDetectionOutputSchema = z.object({
  numberOfTrees: z.number().describe('The number of trees detected by the custom model.'),
  greenScore: z.number().describe('The calculated GreenScore based on the custom detection.'),
});
export type CustomTreeDetectionOutput = z.infer<typeof CustomTreeDetectionOutputSchema>;

// Main flow function
export async function runCustomDetection(
  input: CustomTreeDetectionInput
): Promise<CustomTreeDetectionOutput> {
  console.log("🔥 runCustomDetection() received input:", input);
  return customTreeDetectionFlow(input);
}

const customTreeDetectionFlow = ai.defineFlow(
  {
    name: 'customTreeDetectionFlow',
    inputSchema: CustomTreeDetectionInputSchema,
    outputSchema: CustomTreeDetectionOutputSchema,
  },
  async (input) => {
    console.log("🔍 Starting customTreeDetectionFlow...");
    console.log("📥 Input received:", input);

    // STEP 1 — Call custom tree detection
    console.log("🌲 Calling customTreeDetectorTool...");
    const detectionResult = await customTreeDetectorTool(input);
    console.log("🌲 Detection result:", detectionResult);

    const detectedTrees = detectionResult.numberOfTrees;
    console.log("🌲 Trees detected:", detectedTrees);

    // STEP 2 — Calculate area
    const landArea = input.landWidth * input.landHeight;
    console.log("📐 Calculated land area:", landArea);

    // STEP 3 — Calculate GreenScore
    console.log("🟢 Calling calculateGreenScore...");
    const scoreResult = await calculateGreenScore({
      detectedTrees: detectedTrees,
      landArea: landArea,
      unit: input.unit,
    });
    console.log("🟢 GreenScore result:", scoreResult);

    return {
      numberOfTrees: detectedTrees,
      greenScore: scoreResult.greenScore,
    };
  }
);
