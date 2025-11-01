'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '@/app/lib/schema';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { id } from 'zod/v4/locales';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { updateUser } from '@/actions/user';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OnboardingForm = ({ industries }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();

  const {
    loading: updateLoading,
    fn: updateUserFn,
    data: updateResult,
  } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${values.industry}-${values.subIndustry
        .toLowerCase()
        .replace(/ /g, '-')}`;

      await updateUserFn({
        ...values,
        industry: formattedIndustry,
      });
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success('Perfil completado con éxito');
      router.push('/dashboard');
      router.refresh();
    }
  }, [updateResult, updateLoading]);

  const watchIndustry = watch('industry');

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title text-4xl">
            Completa tu Perfil
          </CardTitle>
          <CardDescription>
            Selecciona tu industria para obtener perspectivas de carrera y
            recomendaciones personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Select
                onValueChange={(value) => {
                  setValue('industry', value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue('subIndustry', '');
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => {
                    return (
                      <SelectItem value={ind.id} key={ind.id}>
                        {ind.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-2">
                <Label htmlFor="subIndustry">Especialización</Label>
                <Select
                  onValueChange={(value) => setValue('subIndustry', value)}
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Selecciona una especialización" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry?.subIndustries.map((ind) => {
                      return (
                        <SelectItem value={ind} key={ind}>
                          {ind}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className="text-sm text-red-500">
                    {errors.subIndustry.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Años de Experiencia</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Introduce tus años de experiencia"
                {...register('experience')}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Habilidades</Label>
              <Input
                id="skills"
                placeholder="ej., Python, JavaScript, Gestión de Proyectos"
                {...register('skills')}
              />
              <p className="text-sm text-muted-foreground">
                Separa múltiples habilidades con comas
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía Profesional</Label>
              <Textarea
                id="bio"
                placeholder="Cuéntanos sobre tu trayectoria profesional..."
                className="h-32"
                {...register('bio')}
              />

              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Completar Perfil'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
