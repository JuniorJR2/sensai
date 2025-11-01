'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateCoverLetter } from '@/actions/cover-letter';
import useFetch from '@/hooks/use-fetch';
import { coverLetterSchema } from '@/app/lib/schema';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  // Update content when letter is generated
  useEffect(() => {
    if (generatedLetter) {
      toast.success('¡Carta de presentación generada con éxito!');
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || 'Error al generar la carta de presentación');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Puesto</CardTitle>
          <CardDescription>
            Proporciona información sobre el puesto al que postulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields remain the same */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Introduce el nombre de la empresa"
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Título del Puesto</Label>
                <Input
                  id="jobTitle"
                  placeholder="Introduce el título del puesto"
                  {...register('jobTitle')}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Descripción del Puesto</Label>
              <Textarea
                id="jobDescription"
                placeholder="Pega la descripción del puesto aquí"
                className="h-32"
                {...register('jobDescription')}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  'Generar Carta de Presentación'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
