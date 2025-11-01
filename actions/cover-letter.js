"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    const prompt = `
    Escribe una carta de presentación profesional para un puesto de ${data.jobTitle} en ${data.companyName
        }.
    
    Sobre el candidato:
    - Industria: ${user.industry}
    - Años de Experiencia: ${user.experience}
    - Habilidades: ${user.skills?.join(", ")}
    - Trayectoria Profesional: ${user.bio}
    
    Descripción del Puesto:
    ${data.jobDescription}
    
    Requisitos:
    1. Usa un tono profesional y entusiasta
    2. Destaca las habilidades y experiencia relevantes
    3. Muestra comprensión de las necesidades de la empresa
    4. Sé conciso (máximo 400 palabras)
    5. Usa un formato de carta de negocios proper en markdown
    6. Incluye ejemplos específicos de logros
    7. Relaciona la trayectoria del candidato con los requisitos del puesto
    
    Formatea la carta en markdown.
  `;

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();

        const coverLetter = await db.coverLetter.create({
            data: {
                content,
                jobDescription: data.jobDescription,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                status: "completed", // Nota: Mantener "completed" para no romper la DB
                userId: user.id,
            },
        });

        return coverLetter;
    } catch (error) {
        console.error("Error generating cover letter:", error.message);
        throw new Error("Error al generar la carta de presentación");
    }
}

export async function getCoverLetters() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    return await db.coverLetter.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getCoverLetter(id) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    return await db.coverLetter.findUnique({
        where: {
            id,
            userId: user.id,
        },
    });
}

export async function deleteCoverLetter(id) {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("Usuario no encontrado");

    return await db.coverLetter.delete({
        where: {
            id,
            userId: user.id,
        },
    });
}