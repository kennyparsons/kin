import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Kin API is running!')
})

app.get('/api/dashboard', async (c) => {
  // Get upcoming/overdue reminders
  const reminders = await c.env.DB.prepare(`
    SELECT r.*, p.name as person_name 
    FROM reminders r 
    JOIN people p ON r.person_id = p.id 
    WHERE r.status = 'pending' 
    ORDER BY r.due_date ASC 
    LIMIT 10
  `).all()

  // Get people who haven't had an interaction in 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
  const stalePeople = await c.env.DB.prepare(`
    SELECT p.*, MAX(i.date) as last_interaction
    FROM people p
    LEFT JOIN interactions i ON p.id = i.person_id
    GROUP BY p.id
    HAVING last_interaction < ? OR last_interaction IS NULL
    ORDER BY last_interaction ASC
    LIMIT 5
  `).bind(thirtyDaysAgo).all()

  return c.json({
    reminders: reminders.results,
    stalePeople: stalePeople.results
  })
})

// --- People Routes ---

app.get('/api/people', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM people ORDER BY updated_at DESC').all()
  return c.json(results)
})

app.get('/api/people/:id', async (c) => {
  const id = c.req.param('id')
  const person = await c.env.DB.prepare('SELECT * FROM people WHERE id = ?').bind(id).first()
  if (!person) return c.notFound()
  
  const interactions = await c.env.DB.prepare('SELECT * FROM interactions WHERE person_id = ? ORDER BY date DESC').bind(id).all()
  const reminders = await c.env.DB.prepare('SELECT * FROM reminders WHERE person_id = ? ORDER BY due_date ASC').bind(id).all()
  
  return c.json({ ...person, interactions: interactions.results, reminders: reminders.results })
})

app.post('/api/people', async (c) => {
  const body = await c.req.json()
  const { name, email, company, manager_name, role, tags, metadata } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO people (name, email, company, manager_name, role, tags, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(name, email, company, manager_name, role, tags, JSON.stringify(metadata || {})).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.put('/api/people/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, email, company, manager_name, role, tags, metadata } = body

  await c.env.DB.prepare(
    `UPDATE people SET name = ?, email = ?, company = ?, manager_name = ?, role = ?, tags = ?, metadata = ?, updated_at = unixepoch() WHERE id = ?`
  ).bind(name, email, company, manager_name, role, tags, JSON.stringify(metadata || {}), id).run()

  return c.json({ success: true })
})

app.delete('/api/people/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM people WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// --- Interaction Routes ---

app.post('/api/interactions', async (c) => {
  const body = await c.req.json()
  const { person_id, type, summary, date } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO interactions (person_id, type, summary, date) VALUES (?, ?, ?, ?)`
  ).bind(person_id, type, summary, date || Math.floor(Date.now() / 1000)).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

// --- Reminder Routes ---

app.post('/api/reminders', async (c) => {
  const body = await c.req.json()
  const { person_id, title, due_date } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO reminders (person_id, title, due_date) VALUES (?, ?, ?)`
  ).bind(person_id, title, due_date).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.patch('/api/reminders/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json() // 'pending' or 'done'
  await c.env.DB.prepare('UPDATE reminders SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

export default app
