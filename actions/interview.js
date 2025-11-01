"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export async function generateQuiz() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("Usuario no encontrado");

    try {
        const prompt = `
    Genera 10 preguntas de entrevista técnica para un profesional de ${user.industry
            }${user.skills?.length ? ` con experiencia en ${user.skills.join(", ")}` : ""
            }.
    
    Cada pregunta debe ser de opción múltiple con 4 opciones.
    
    Devuelve la respuesta ÚNICAMENTE en este formato JSON, sin texto adicional:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

        const result = await model.generateContent(prompt)
        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz = JSON.parse(cleanedText);

        return quiz.questions;
    } catch (error) {
        console.error("Error al generar el cuestionario:", error);
        throw new Error("Error al generar las preguntas del cuestionario");
    }
}

export async function saveQuizResult(questions, answers, score) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("Usuario no encontrado");

    const questionResults = questions.map((q, index) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers[index],
        isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

    let improvementTip = null;

    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers
            .map(
                (q) =>
                    `Pregunta: "${q.question}"\nRespuesta Correcta: "${q.answer}"\nRespuesta del Usuario: "${q.userAnswer}`
            )
            .join("\n\n");

        const improvementPrompt = `
            El usuario respondió incorrectamente a las siguientes preguntas de entrevista técnica de ${user.industry}:

             ${wrongQuestionsText}

            Basándose en estos errores, proporciona un consejo de mejora conciso y específico.
            Enfócate en las lagunas de conocimiento reveladas por estas respuestas incorrectas.
            Mantén la respuesta en menos de 2 frases y hazla alentadora.
            No menciones los errores explícitamente, en su lugar, enfócate en qué aprender/practicar.
        `;

        try {
            const tipResult = await model.generateContent(improvementPrompt);
            improvementTip = tipResult.response.text().trim();
            console.log(improvementTip);
        } catch (error) {
            console.error("Error al generar el consejo de mejora:", error);
            // Continuar sin el consejo de mejora si la generación falla
        }
    }

    try {
        const assessment = await db.assessment.create({
            data: {
                userId: user.id,
                quizScore: score,
                questions: questionResults,
                category: "Technical", // Nota: Mantener "Technical" para no romper la DB
                improvementTip,
            },
        });

        return assessment;
    } catch (error) {
        console.error("Error al guardar el resultado del cuestionario:", error);
        throw new Error("Error al guardar el resultado del cuestionario");
    }
}

export async function getAssessments() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    try {
        const assessments = await db.assessment.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return assessments;
    } catch (error) {
        console.error("Error al obtener las evaluaciones:", error);
        throw new Error("Error al obtener las evaluaciones");
    }
}