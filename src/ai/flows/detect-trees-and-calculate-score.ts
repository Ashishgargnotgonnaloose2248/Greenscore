'use server';
/**
 * @fileOverview Detects trees in an image and calculates a GreenScore based on land dimensions.
 *
 * - detectTreesAndCalculateScore - A function that initiates the tree detection and score calculation.
 * - DetectTreesAndCalculateScoreInput - The input type for the detectTreesAndCalculateScore function.
 * - DetectTreesAndCalculateScoreOutput - The return type for the detectTreesAndCalculateScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { calculateGreenScore } from './calculate-green-score';

const DetectTreesAndCalculateScoreInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the land area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'" // Corrected typo here
    ),
  landWidth: z.number().describe('The width of the land area.'),
  landHeight: z.number().describe('The height of the land area.'),
  unit: z.enum(['sqft', 'sqm']).describe('The unit of measurement for the land area.'),
});
export type DetectTreesAndCalculateScoreInput = z.infer<typeof DetectTreesAndCalculateScoreInputSchema>;

const TreeDetectionOutputSchema = z.object({
  numberOfTrees: z.number().describe('The number of trees detected in the image.'),
});

const DetectTreesAndCalculateScoreOutputSchema = z.object({
  numberOfTrees: z.number().describe('The number of trees detected in the image.'),
  greenScore: z.number().describe('The calculated GreenScore based on tree density.'),
});
export type DetectTreesAndCalculateScoreOutput = z.infer<typeof DetectTreesAndCalculateScoreOutputSchema>;

export async function detectTreesAndCalculateScore(
  input: DetectTreesAndCalculateScoreInput
): Promise<DetectTreesAndCalculateScoreOutput> {
  return detectTreesAndCalculateScoreFlow(input);
}

const treeDetectionPrompt = ai.definePrompt({
  name: 'treeDetectionPrompt',
  input: {schema: z.object({photoDataUri: z.string()})},
  output: {schema: TreeDetectionOutputSchema},
  prompt: `You are an AI that analyzes images of land areas to detect trees. Analyze the image provided and detect the number of trees present.

  Photo: {{media url=photoDataUri}}
  
  Return only the number of trees detected.
  `,
});

const detectTreesAndCalculateScoreFlow = ai.defineFlow(
  {
    name: 'detectTreesAndCalculateScoreFlow',
    inputSchema: DetectTreesAndCalculateScoreInputSchema,
    outputSchema: DetectTreesAndCalculateScoreOutputSchema,
  },
  async input => {
    // Step 1: Detect trees using the visual model
    const detectionResult = await treeDetectionPrompt({ photoDataUri: input.photoDataUri });
    const detectedTrees = detectionResult.output?.numberOfTrees ?? 0;

    // Step 2: Calculate land area
    const landArea = input.landWidth * input.landHeight;

    // Step 3: Calculate GreenScore
    const scoreResult = await calculateGreenScore({
      detectedTrees: detectedTrees,
      landArea: landArea,
      unit: input.unit,
    });
    
    return {
      numberOfTrees: detectedTrees,
      greenScore: scoreResult.greenScore,
    };
  }
);
