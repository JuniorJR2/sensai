'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteCoverLetter } from '@/actions/cover-letter';

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      await deleteCoverLetter(id);
      toast.success('¡Carta de presentación eliminada con éxito!');
      router.refresh();
    } catch (error) {
      toast.error(
        error.message || 'Error al eliminar la carta de presentación'
      );
    }
  };

  if (!coverLetters?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aún no hay Cartas de Presentación</CardTitle>
          <CardDescription>
            Crea tu primera carta de presentación para empezar
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="group relative ">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl gradient-title">
                  {letter.jobTitle} en {letter.companyName}
                </CardTitle>
                <CardDescription>
                  Creada {format(new Date(letter.createdAt), 'PPP')}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <AlertDialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Eliminar Carta de Presentación?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente tu carta de presentación para el puesto
                        de {letter.jobTitle} en {letter.companyName}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(letter.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm line-clamp-3">
              {letter.jobDescription}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
