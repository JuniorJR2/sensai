const { Button } = require('@/components/ui/button');
const { CardContent, CardFooter } = require('@/components/ui/card');
const { Progress } = require('@/components/ui/progress');
const { Trophy, CheckCircle2, XCircle } = require('lucide-react');
const { DEFAULT_RUNTIME_WEBPACK } = require('next/dist/shared/lib/constants');

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Resultados del Cuestionario
      </h1>

      <CardContent className="space-y-6">
        {/* Score overview */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
          <Progress value={result.quizScore} className="w-full" />
        </div>

        {/* Improvement Tip */}
        {result.improvementTip && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">Consejo de Mejora:</p>
            <p className="text-muted-foreground">{result.improvementTip}</p>
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-4">
          <h3 className="font-medium">Revision de Preguntas</h3>
          {result.questions.map((q, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Tu respuesta: {q.userAnswer}</p>
                {!q.isCorrect && <p>Respuesta Correcta: {q.answer}</p>}
              </div>
              <div className="text-sm bg-muted p-2 rounded">
                <p className="font-medium">Explicacion:</p>
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Comenzar Nuevo Cuestionario
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
