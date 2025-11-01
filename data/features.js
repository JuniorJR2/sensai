import { BrainCircuit, Briefcase, LineChart, ScrollText } from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "Guía de Carrera con IA",
    description:
      "Obtén asesoramiento y perspectivas de carrera personalizadas, potenciadas por tecnología de IA avanzada.",
  },
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "Preparación de Entrevistas",
    description:
      "Practica con preguntas específicas del puesto y obtén retroalimentación instantánea para mejorar tu rendimiento.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Perspectivas de la Industria",
    description:
      "Mantente a la vanguardia con tendencias de la industria en tiempo real, datos salariales y análisis de mercado.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Creación Inteligente de Currículums",
    description: "Genera currículums optimizados para ATS con la ayuda de la IA.",
  },
];