import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  async function createUserAndGetCookies() {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    return createUserResponse.get('Set-Cookie')
  }

  it('should be able to create a new meal', async () => {
    const cookies = await createUserAndGetCookies()

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
  })

  it('should not be able to create a meal without a session id', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: 'Eggs and fruit',
        date_and_time: '2026-05-14 08:00:00',
        is_diet: true,
      })
      .expect(401)
  })

  it('should be able to list all meals from the authenticated user', async () => {
    const cookies = await createUserAndGetCookies()

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.all_meals).toEqual([
      expect.objectContaining({
        name: 'Lunch',
        description: 'Rice and chicken',
      }),
      expect.objectContaining({
        name: 'Breakfast',
        description: 'Eggs and fruit',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const cookies = await createUserAndGetCookies()

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'Breakfast',
        description: 'Eggs and fruit',
      }),
    )
  })

  it('should not be able to get a meal from another user', async () => {
    const firstUserCookies = await createUserAndGetCookies()

    await request(app.server)
      .post('/meals')
      .set('Cookie', firstUserCookies)
      .send({
        name: 'Breakfast',
        description: 'Eggs and fruit',
        date_and_time: '2026-05-14 08:00:00',
        is_diet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', firstUserCookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    const secondUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jane Doe',
      })
      .expect(201)

    const secondUserCookies = secondUserResponse.get('Set-Cookie')

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', secondUserCookies)
      .expect(404)

    expect(getMealResponse.body).toEqual({
      error: 'Meal not found.',
    })
  })

  it('should be able to update a meal', async () => {
    const cookies = await createUserAndGetCookies()

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Updated Breakfast',
        description: 'Updated description',
        is_diet: false,
      })
      .expect(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'Updated Breakfast',
        description: 'Updated description',
      }),
    )
  })

  it('should not be able to update a meal without fields', async () => {
    const cookies = await createUserAndGetCookies()

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({})
      .expect(400)

    expect(updateMealResponse.body).toEqual({
      error: 'No fields to update.',
    })
  })

  it('should not be able to update a meal from another user', async () => {
    const firstUserCookies = await createUserAndGetCookies()

    await request(app.server)
      .post('/meals')
      .set('Cookie', firstUserCookies)
      .send({
        name: 'Breakfast',
        description: 'Eggs and fruit',
        date_and_time: '2026-05-14 08:00:00',
        is_diet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', firstUserCookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    const secondUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jane Doe',
      })
      .expect(201)

    const secondUserCookies = secondUserResponse.get('Set-Cookie')

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', secondUserCookies)
      .send({
        name: 'Updated Breakfast',
      })
      .expect(404)

    expect(updateMealResponse.body).toEqual({
      error: 'Meal not found.',
    })
  })

  it('should be able to delete a meal', async () => {
    const cookies = await createUserAndGetCookies()

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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(404)

    expect(getMealResponse.body).toEqual({
      error: 'Meal not found.',
    })
  })

  it('should not be able to delete a meal from another user', async () => {
    const firstUserCookies = await createUserAndGetCookies()

    await request(app.server)
      .post('/meals')
      .set('Cookie', firstUserCookies)
      .send({
        name: 'Breakfast',
        description: 'Eggs and fruit',
        date_and_time: '2026-05-14 08:00:00',
        is_diet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', firstUserCookies)
      .expect(200)

    const mealId = listMealsResponse.body.all_meals[0].id

    const secondUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Jane Doe',
      })
      .expect(201)

    const secondUserCookies = secondUserResponse.get('Set-Cookie')

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', secondUserCookies)
      .expect(404)

    expect(deleteMealResponse.body).toEqual({
      error: 'Meal not found.',
    })
  })
})