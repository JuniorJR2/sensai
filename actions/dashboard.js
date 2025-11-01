"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});
export const generateAIInsights = async (industry) => {
    const prompt = `
          Analiza el estado actual de la industria ${industry} y proporciona perspectivas ÚNICAMENTE en el siguiente formato JSON sin notas ni explicaciones adicionales:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANTE: Devuelve ÚNICAMENTE el JSON. Sin texto adicional, notas o formato markdown.
          Incluye al menos 5 roles comunes para los rangos salariales.
          La tasa de crecimiento debe ser un porcentaje.
          Incluye al menos 5 habilidades y tendencias.
        `;

    const result = await model.generateContent(prompt)
    const response = result.response;
    const text = response.text()

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
        include: {
            industryInsight: true,
        },
    });

    if (!user) throw new Error("Usuario no encontrado");

    if (!user.industryInsight) {
        const insights = await generateAIInsights(user.industry);

        const industryInsight = await db.industryInsight.create({
            data: {
                industry: user.industry,
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return industryInsight;
    }
    return user.industryInsight;
}