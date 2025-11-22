'use client';

import React, { useState } from "react";
import LiquidEther from '@/components/LiquidEther';
import { CalculatorForm, type FormValues } from '@/components/calculator-form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { RotateCcw } from 'lucide-react';
import Image from "next/image";

// Helper to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
};

// Get color based on GreenScore
const getScoreColor = (score: number) => {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-yellow-400';
  return 'bg-green-500';
};

export const CalculatorSection = React.forwardRef<HTMLDivElement, Record<string, never>>(
  (props, ref) => {
    const [result, setResult] = useState<{
      treeCount: number;
      greenScore: number;
      annotatedImage: string | null;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = async (file: File) => {
      if (!file) return null;
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
        return base64;
      } catch (err) {
        console.error("Failed to convert file to Base64", err);
        return null;
      }
    };

    const handleCalculate = async (data: FormValues, imageDataUri: string) => {
      setIsLoading(true);
      setResult(null);

      try {
        const response = await fetch(
          'https://serverless.roboflow.com/greenscore/workflows/detect-count-and-visualize-4',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: 'YOUR_API_KEY',
              options: { show_labels: false, show_confidence: false, confidence_threshold: 0.2 },
              inputs: { image: { type: 'base64', value: imageDataUri.split(',')[1] } },
            }),
          }
        );

        const text = await response.text();
        let rf;
        try { rf = JSON.parse(text); } 
        catch {
          toast({ variant: 'destructive', title: 'Error', description: 'Invalid response from server.' });
          setIsLoading(false);
          return;
        }

        const treeCount = rf.outputs?.[0]?.count_objects ?? 0;
        const annotatedImage = rf.outputs?.[0]?.detection_visualization?.value ?? null;

        // Correct GreenScore logic: 5 trees per 1000 sqft
        let landAreaSqft = data.unit === 'sqm' ? data.width * data.height * 10.764 : data.width * data.height;
        const treesRequiredPerThousandSqFt = 5;
        const treesRequired = (landAreaSqft / 1000) * treesRequiredPerThousandSqFt;

        let greenScore = Math.min(100, Math.round((treeCount / treesRequired) * 100));
        setResult({ treeCount, greenScore, annotatedImage });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Tree detection failed.' });
        console.error(error);
      } finally { setIsLoading(false); }
    };

    const handleReset = () => { setResult(null); setIsLoading(false); setImagePreview(null); };

    return (
      <section ref={ref} className="relative flex min-h-screen w-full items-center justify-center py-24 px-4 md:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black -z-20" />
        {/* LiquidEther Background */}
        <div className="absolute inset-0 -z-10">
          <LiquidEther
            colors={['#3300ff', '#04c324', '#fcfcfc']}
            mouseForce={20} cursorSize={100} isViscous={true} viscous={30}
            iterationsViscous={32} iterationsPoisson={32} resolution={0.5} isBounce={true}
            autoDemo={true} autoSpeed={0.5} autoIntensity={2.2} takeoverDuration={0.25}
            autoResumeDelay={3000} autoRampDuration={0.6} 
          />
        </div>

        {/* Overlay for blur & darkness */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm -z-10" />

        {/* Main Card/Form */}
        <div className="relative z-10 w-full max-w-3xl">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden p-4">
            <CardHeader>
              <CardTitle className="font-body text-3xl text-center text-white">
                {result ? 'Your GreenScore Result' : 'Calculate Your GreenScore'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-300"></div>
                  <p className="text-green-200">Analyzing your image…</p>
                </div>
              ) : result ? (
                <div className="flex flex-col items-center gap-8 p-4">
                  <p className="text-5xl font-bold text-white drop-shadow-lg">{result.greenScore}</p>
                  <p className="text-green-200">GreenScore</p>
                  <p>🌳 Detected Trees: <span className="text-green-300 font-bold">{result.treeCount}</span></p>

                  <div className="w-full bg-white/20 rounded-full h-6 mt-4 overflow-hidden">
                    <div className={`${getScoreColor(result.greenScore)} h-full transition-all`} style={{ width: `${Math.min(result.greenScore, 100)}%` }} />
                  </div>

                  {result.annotatedImage && (
                    <Image src={`data:image/jpeg;base64,${result.annotatedImage}`} alt="Annotated result" width={400} height={300} className="object-contain rounded-xl border border-white/30 shadow-lg" />
                  )}

                  <Button onClick={handleReset} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full">
                    <RotateCcw className="mr-2 h-4 w-4" /> Calculate Again
                  </Button>
                </div>
              ) : (
                <CalculatorForm onSubmit={handleCalculate} isPending={isLoading} imagePreview={imagePreview} setImagePreview={setImagePreview} handleFileChange={handleFileChange} />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }
);

CalculatorSection.displayName = 'CalculatorSection';
