# Sensai: Coach de Carrera con IA Full Stack

Una aplicación web moderna que utiliza inteligencia artificial para ayudar a los profesionales a avanzar en sus carreras. Ofrece herramientas personalizadas para la creación de currículums, generación de cartas de presentación y preparación para entrevistas, todo adaptado a la industria y habilidades del usuario.

![sensai](https://github.com/user-attachments/assets/eee79242-4056-4d19-b655-2873788979e1)

## 🌟 Características

- 📝️ **Creador de Currículums con IA:** Genera currículums optimizados para ATS (Sistemas de Seguimiento de Candidatos) con la ayuda de la inteligencia artificial.
- ✉️ **Generador de Cartas de Presentación:** Crea cartas de presentación personalizadas y convincentes para cada solicitud de empleo.
- 🎯 **Preparación de Entrevistas:** Practica con preguntas de entrevista específicas de la industria y recibe retroalimentación instantánea.
- 📊 **Perspectivas de la Industria:** Obtén datos en tiempo real sobre tendencias del mercado, rangos salariales y habilidades demandadas.
- 🌍 **Soporte Multi-industria:** Personaliza la experiencia para más de 50 industrias diferentes.
- 🤖 **Experiencia de Usuario Moderna:** Una interfaz limpia, rápida y responsive construida con Next.js y Tailwind CSS.

## 🛠️ Stack Tecnológico

- **Frontend:** React, Next.js, JavaScript, Tailwind CSS, Shadcn/ui
- **Backend:** Node.js, Prisma, Inngest
- **Base de Datos:** Neon (PostgreSQL)
- **Autenticación:** Clerk
- **Inteligencia Artificial:** Google Gemini API
- **Despliegue:** Vercel

## 🚀 Empezando

Sigue estos sencillos pasos para configurar y ejecutar una copia local del proyecto en tu máquina.

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) y [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/).

### 1. Clona el Repositorio

```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO

npm install
# o
yarn install
# o
pnpm install

# URL de tu base de datos de Neon
DATABASE_URL=

# Claves de la API de Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# URLs de redirección de Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Clave de la API de Google Gemini
GEMINI_API_KEY=
