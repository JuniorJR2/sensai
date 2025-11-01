import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Incorporación Profesional",
    description: "Comparte tu industria y experiencia para recibir orientación personalizada",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Crea tus Documentos",
    description: "Crea currículums optimizados para ATS y cartas de presentación convincentes",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Prepárate para las Entrevistas",
    description:
      "Practica con entrevistas simuladas con IA adaptadas a tu puesto",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Sigue tu Progreso",
    description: "Supervisa las mejoras con análisis de rendimiento detallados",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];