import fastify from 'fastify'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'

import { usersRoutes } from './routes/users'

import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

app.register(usersRoutes,{
    prefix: 'users',
})

app.register(mealsRoutes,{
    prefix: 'meals',
})

