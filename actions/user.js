"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { success } from "zod";
import { generateAIInsights } from "./dashboard";
// import { clerkClient } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";


// export async function updateUser(data) {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//         where: {
//             clerkUserId: userId,
//         },
//     });

//     if (!user) throw new Error("User not found");

//     try {
//         const result = await db.$transaction(async (tx) => {
//             //find if the industry exists
//             let industryInsight = await tx.industryInsight.findUnique({
//                 where: {
//                     industry: data.industry,
//                 },
//             });
//             //if industry doesnt exist, create it with default values - will replace it with ai later
//             if (!industryInsight) {
//                 const insights = await generateAIInsights(data.industry);

//                 industryInsight = await db.industryInsight.create({
//                     data: {
//                         industry: data.industry,
//                         ...insights,
//                         nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                     },
//                 });
//             }
//             //update the user
//             const updatedUser = await tx.user.update({
//                 where: {
//                     id: user.id,
//                 },
//                 data: {
//                     industry: data.industry,
//                     experience: data.experience,
//                     bio: data.bio,
//                     skills: data.skills,
//                 },
//             });

//             return { updatedUser, industryInsight }
//         }, {
//             timeout: 10000, //default:5000
//         });
//         return { success: true, ...result };
//     } catch (error) {
//         console.error("Error updating user and insdustry:", error.message);
//         throw new Error("Failed to update profile" + error.message);

//     }
// }

// export async function getUserOnboardingStatus() {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//         where: {
//             clerkUserId: userId,
//         },
//     });

//     if (!user) throw new Error("User not found");

//     try {
//         const user = await db.user.findUnique({
//             where: {
//                 clerkUserId: userId,
//             },
//             select: {
//                 industry: true,
//             },
//         });

//         return {
//             isOnboarded: !!user?.industry,
//         };
//     } catch (error) {
//         console.error("Erro cheking onboarding status:", error.message);
//         throw new Error("Failed to check onboarding status");
//     }
// }
// actions/user.js

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {
        // 1.Obtener los datos de la IA FUERA de la transacción.
        let industryInsight = await db.industryInsight.findUnique({
            where: {
                industry: data.industry,
            },
        });

        if (!industryInsight) {
            console.log("No se encontró el insight, generando uno nuevo...");
            const insights = await generateAIInsights(data.industry);
            industryInsight = insights; //datos generados
        }

        // 2. Ejecutar las operaciones de la BD DENTRO de la transacción.
        S
        const result = await db.$transaction(async (tx) => {

            if (!await db.industryInsight.findUnique({ where: { industry: data.industry } })) {
                await tx.industryInsight.create({
                    data: {
                        industry: data.industry,
                        ...industryInsight,
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });
            }

            // Actualiza el usuario
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    industry: data.industry,
                    experience: data.experience,
                    bio: data.bio,
                    skills: data.skills,
                },
            });

            return { updatedUser, industryInsight };
        });

        return { success: true, ...result };
    } catch (error) {
        console.error("Error updating user and industry:", error.message);
        throw new Error("Failed to update profile: " + error.message);
    }
}




export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Llama a checkUser para asegurar que el usuario exista en la BD.
    const user = await checkUser();

    if (!user) {
        throw new Error("No se pudo verificar al usuario.");
    }

    if (!user.industry) {
        console.log("El usuario no tiene industria, no está onboarded.");
        return {
            user: {
                id: user.id,
                industry: user.industry,
                skills: user.skills,
                experience: user.experience,
                bio: user.bio,
            },
            industryInsight: null, // Devolvemos null porque no hay insights 
            isOnboarded: false,
        };
    }

    // SÍ tiene una industria.
    try {
        const industryInsight = await db.industryInsight.findUnique({
            where: {
                industry: user.industry,
            },
        });

        return {
            user: {
                id: user.id,
                industry: user.industry,
                skills: user.skills,
                experience: user.experience,
                bio: user.bio,
            },
            industryInsight,
            isOnboarded: true,
        };
    } catch (error) {
        console.error("Error al obtener el estado de onboarding:", error.message);
        throw new Error("Error al obtener el estado de onboarding");
    }
}