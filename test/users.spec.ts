import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    expect(createUserResponse.get('Set-Cookie')).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })

  it('should not be able to create two users with the same session id', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    const secondUserResponse = await request(app.server)
      .post('/users')
      .set('Cookie', cookies)
      .send({
        name: 'John Doe',
      })
      .expect(409)

    expect(secondUserResponse.body).toEqual({
      error: 'User already exists.',
    })
  })

  it('should be able to get user metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Breakfast',
        description: 'Eggs and fruit',
        date_and_time: '2026-05-14 08:00:00',
        is_diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Lunch',
        description: 'Rice and chicken',
        date_and_time: '2026-05-14 12:00:00',
        is_diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Snack',
        description: 'Chocolate cake',
        date_and_time: '2026-05-14 16:00:00',
        is_diet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Dinner',
        description: 'Salad and fish',
        date_and_time: '2026-05-14 20:00:00',
        is_diet: true,
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body.metrics).toEqual({
      total_meals: 4,
      out_diet_meals: 1,
      on_diet_meals: 3,
      best_on_diet_sequence: 2,
    })
  })

  it('should not be able to get metrics without a session id', async () => {
    await request(app.server).get('/users/metrics').expect(401)
  })
})