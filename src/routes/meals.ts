import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { randomUUID } from "node:crypto"
import { knex } from "../database"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { getUserID } from "../middlewares/get-user-id"


export async function mealsRoutes(app: FastifyInstance) {

    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists, getUserID],
        },
        async (request) => {
            const all_meals = await knex('meals')
                .where('user_id', request.userId)
                .orderBy('date_and_time', 'desc')

            return { all_meals }
        },
    )

    app.get(
        '/:id',
        {
            preHandler: [checkSessionIdExists, getUserID],
        },
        async (request, reply) => {

            const getMealsParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getMealsParamsSchema.parse(request.params)

            const meal = await knex('meals')
                .where('user_id', request.userId)
                .andWhere("id", id)
                .first()

            if (!meal) {
                return reply.status(404).send({
                    error: 'Meal not found.',
                })
            }

            return { meal }
        },
    )

    app.post(
        '/',
        {
            config: {
                rateLimit: {
                    max: 20,
                    timeWindow: '1 minute',
                },
            },
            preHandler: [checkSessionIdExists, getUserID],
        },
        async (request, reply) => {

            if (!request.userId) {
                return reply.status(401).send()
            }

            const createMealBodySchema = z.object({
                name: z.string(),
                description: z.string(),
                date_and_time: z.string(),
                is_diet: z.boolean()
            })

            const { name, description, date_and_time, is_diet } = createMealBodySchema.parse(
                request.body,
            )

            await knex('meals').insert({
                id: randomUUID(),
                user_id: request.userId,
                name,
                description,
                date_and_time,
                is_diet,
            })

            return reply.status(201).send()
        },
    )

    app.put(
        '/:id',
        {
             config: {
                rateLimit: {
                    max: 20,
                    timeWindow: '1 minute',
                },
            },
            preHandler: [checkSessionIdExists, getUserID],
        },
        async (request, reply) => {

            const getMealsParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const updateMealBodySchema = z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                date_and_time: z.string().optional(),
                is_diet: z.boolean().optional(),
            })

            const { id } = getMealsParamsSchema.parse(request.params)

            const data = updateMealBodySchema.parse(request.body)

            const dataToUpdate = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== undefined),
            )

            if (Object.keys(dataToUpdate).length === 0) {
                return reply.status(400).send({
                    error: 'No fields to update.',
                })
            }

            const updatedRows = await knex('meals')
                .where('user_id', request.userId)
                .andWhere("id", id)
                .update(dataToUpdate)

            if (!updatedRows) {
                return reply.status(404).send({
                    error: 'Meal not found.',
                })
            }

            return reply.status(204).send()
        },
    )

    app.delete(
        '/:id',
        {
             config: {
                rateLimit: {
                    max: 20,
                    timeWindow: '1 minute',
                },
            },
            preHandler: [checkSessionIdExists, getUserID],
        },
        async (request, reply) => {

            const getMealsParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getMealsParamsSchema.parse(request.params)

            const deletedRows = await knex('meals')
                .where('user_id', request.userId)
                .andWhere('id', id)
                .delete()

            if (!deletedRows) {
                return reply.status(404).send({
                    error: 'Meal not found.',
                })
            }

            return reply.status(204).send()
        },
    )

}