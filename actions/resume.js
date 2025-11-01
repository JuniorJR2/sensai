"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function saveResume(content) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    try {
        const resume = await db.resume.upsert({
            where: {
                userId: user.id,
            },
            update: {
                content,
            },
            create: {
                userId: user.id,
                content,
            },
        });

        revalidatePath("/resume");
        return resume;
    } catch (error) {
        console.error("Error al guardar el currículum:", error);
        throw new Error("Error al guardar el currículum");
    }
}

export async function getResume() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    return await db.resume.findUnique({
        where: {
            userId: user.id,
        },
    });
}

export async function improveWithAI({ current, type }) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            industryInsight: true,
        },
    });

    if (!user) throw new Error("Usuario no encontrado");

    const prompt = `
    Como experto redactor de currículums, mejora la siguiente descripción de ${type} para un profesional de ${user.industry}.
    Hazla más impactante, cuantificable y alineada con los estándares de la industria.
    Contenido actual: "${current}"

    Requisitos:
    1. Usa verbos de acción
    2. Incluye métricas y resultados cuando sea posible
    3. Destaca las habilidades técnicas relevantes
    4. Sé conciso pero detallado
    5. Céntrate en los logros sobre las responsabilidades
    6. Usa palabras clave específicas de la industria
    
    Formatea la respuesta como un solo párrafo sin texto ni explicaciones adicionales.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const improvedContent = response.text().trim();
        return improvedContent;
    } catch (error) {
        console.error("Error al mejorar el contenido:", error);
        throw new Error("Error al mejorar el contenido");
    }
}