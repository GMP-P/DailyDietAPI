import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { randomUUID } from "node:crypto"
import { knex } from "../database"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { getUserID } from "../middlewares/get-user-id"

export async function usersRoutes(app: FastifyInstance) {

  app.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const createUserBodySchema = z.object({
        name: z.string(),
      })

      const { name } = createUserBodySchema.parse(
        request.body,
      )

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      const userAlreadyExists = await knex('users')
        .where('session_id', sessionId)
        .first()

      if (userAlreadyExists) {
        return reply.status(409).send({
          error: 'User already exists.',
        })
      }

      await knex('users').insert({
        id: randomUUID(),
        name,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists, getUserID],
    },
    async (request, reply) => {
      const total_meals = await knex('meals')
        .where('user_id', request.userId)
        .count('id', { as: 'total_meals' })
        .first()

      const out_diet = await knex('meals')
        .where('user_id', request.userId)
        .where('is_diet', false)
        .count('id', { as: 'out_diet_meals' })
        .first()

      const on_diet = await knex('meals')
        .where('user_id', request.userId)
        .where('is_diet', true)
        .count('id', { as: 'on_diet_meals' })
        .first()

      const meals = await knex('meals')
        .where('user_id', request.userId)
        .orderBy('date_and_time', 'asc')

      let bestSequence = 0
      let currentSequence = 0

      for (const meal of meals) {
        if (meal.is_diet) {
          currentSequence++
        } else {
          currentSequence = 0
        }

        if (currentSequence > bestSequence) {
          bestSequence = currentSequence
        }
      }

      return {
        metrics: {
          total_meals: Number(total_meals?.total_meals),
          out_diet_meals: Number(out_diet?.out_diet_meals),
          on_diet_meals: Number(on_diet?.on_diet_meals),
          best_on_diet_sequence: bestSequence,
        },
      }
    },
  )
}