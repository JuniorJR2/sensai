import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Quiz from '../_components/quiz';
import QuizResult from '../_components/quiz-result';

export default function MockInterviewPage() {
  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href={'/interview'}>
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Volver a la Preparacion de Entrevista
          </Button>
        </Link>
        <div>
          <h1 className="text-6xl font-bold gradient-title">
            Entrevista Simulada
          </h1>
          <p className="text-muted-foreground">
            Pon a prueba tus conocimientos con preguntas especificas de la
            industria
          </p>
        </div>
      </div>
      <Quiz />
    </div>
  );
}
