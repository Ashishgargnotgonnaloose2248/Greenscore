'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Leaf } from 'lucide-react';
import Image from 'next/image';
import SpotlightCard from '@/components/SpotlightCard';   

const formSchema = z.object({
  image: z.custom<FileList>().refine(files => files?.length > 0, 'An image of your land is required.'),
  width: z.coerce.number().positive({ message: 'Width must be a positive number.' }),
  height: z.coerce.number().positive({ message: 'Height must be a positive number.' }),
  unit: z.enum(['sqft', 'sqm'], { required_error: 'Please select a unit.' }),
});

export type FormValues = z.infer<typeof formSchema>;

type CalculatorFormProps = {
  onSubmit: (data: FormValues, imageDataUri: string) => void;
  isPending: boolean;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;

  // ✅ REQUIRED FIX — ADDED THIS
  handleFileChange: (file: File) => Promise<string | null>;
};

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function CalculatorForm({
  onSubmit,
  isPending,
  imagePreview,
  setImagePreview,
  handleFileChange,       // ✅ Now properly recognized
}: CalculatorFormProps) 
{
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      width: 100,
      height: 100,
      unit: 'sqft',
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    if (values.image.length > 0) {
      const imageDataUri = await fileToDataUri(values.image[0]);
      onSubmit(values, imageDataUri);
    }
  };

  const imageRef = form.register('image');

  return (
    <Form {...form}>
      <SpotlightCard
        className="p-6 sm:p-10 rounded-xl"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">

          {/* IMAGE UPLOAD FIELD */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Image</FormLabel>
                <FormControl>
                  <Card className={`border-2 border-dashed ${form.formState.errors.image ? 'border-destructive' : ''}`}>
                    <CardContent className="p-0">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center space-y-2 p-6 cursor-pointer"
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-48">
                            <Image
                              src={imagePreview}
                              alt="Image preview"
                              fill
                              style={{ objectFit: 'contain' }}
                              className="rounded-md"
                            />
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                          </>
                        )}
                      </label>

                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        {...imageRef}
                        onChange={async (e) => {
                          field.onChange(e.target.files);

                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];

                            // ⭐ Use your handleFileChange function
                            const base64 = await handleFileChange(file);

                            setImagePreview(base64 || null);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </FormControl>

                <FormDescription>
                  Upload a clear, top-down or angled photo of the land.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WIDTH / HEIGHT / UNIT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Width</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Height</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sqft">feet (ft)</SelectItem>
                      <SelectItem value="sqm">meters (m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Analyzing...' : 'Calculate GreenScore'}
            <Leaf className="ml-2 h-4 w-4" />
          </Button>

        </form>
      </SpotlightCard>
    </Form>
  );
}
