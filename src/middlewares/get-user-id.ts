import { FastifyReply, FastifyRequest } from "fastify"
import { knex } from "../database"

export async function getUserID(request:FastifyRequest, reply:FastifyReply){
    const sessionId = request.cookies.sessionId

    const user_reference = await knex('users')
        .where('session_id', sessionId)
        .first()
        .select('id')

      if (!user_reference) {
        return reply.status(404).send({
          error: 'User not found.',
        })
      }

    request.userId = user_reference.id
}