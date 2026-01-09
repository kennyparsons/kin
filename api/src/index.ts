import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { compare, hash } from 'bcryptjs'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: (origin, c) => {
    return c.env.FRONTEND_URL || origin
  },
  credentials: true,
}))

app.get('/', (c) => {
  return c.text('Kin API is running!')
})

// --- Auth Routes ---

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  try {
    const isValid = await compare(password, user.password_hash as string)
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
  } catch (err) {
    return c.json({ error: 'Auth error' }, 500)
  }

  const token = await sign({ 
    id: user.id, 
    email: user.email, 
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 
  }, c.env.JWT_SECRET)
  
  // Detect if we are on localhost to set secure flag
  const isLocal = c.req.header('host')?.includes('localhost')

  setCookie(c, 'kin_session', token, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? 'Lax' : 'None',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return c.json({ success: true, token, user: { email: user.email } })
})

app.get('/auth/me', async (c) => {
  const cookieToken = getCookie(c, 'kin_session')
  const headerToken = c.req.header('Authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  if (!token) return c.json({ authenticated: false }, 401)
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    return c.json({ authenticated: true, user: payload })
  } catch (e) {
    return c.json({ authenticated: false }, 401)
  }
})

app.post('/auth/logout', (c) => {
  deleteCookie(c, 'kin_session')
  return c.json({ success: true })
})

// --- Middleware ---

app.use('/api/*', async (c, next) => {
  const cookieToken = getCookie(c, 'kin_session')
  const headerToken = c.req.header('Authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  
  try {
    await verify(token, c.env.JWT_SECRET)
    await next()
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})


// --- Protected Routes ---

app.get('/api/dashboard', async (c) => {
  const reminders = await c.env.DB.prepare(`
    SELECT r.*, p.name as person_name 
    FROM reminders r 
    JOIN people p ON r.person_id = p.id 
    WHERE r.status = 'pending' 
    ORDER BY r.due_date ASC 
    LIMIT 10
  `).all()

  const overduePeople = await c.env.DB.prepare(`
    SELECT p.*, MAX(i.date) as last_interaction
    FROM people p
    LEFT JOIN interactions i ON p.id = i.person_id
    WHERE p.frequency_days IS NOT NULL
    GROUP BY p.id
    HAVING (unixepoch() - COALESCE(MAX(i.date), 0)) > (p.frequency_days * 86400)
    ORDER BY (unixepoch() - COALESCE(MAX(i.date), 0)) DESC
    LIMIT 10
  `).all()

  return c.json({
    reminders: reminders.results,
    stalePeople: overduePeople.results
  })
})

app.get('/api/reminders', async (c) => {
  const status = c.req.query('status') // 'pending' or 'all'
  const search = c.req.query('search')
  
  let query = `
    SELECT r.*, p.name as person_name 
    FROM reminders r 
    JOIN people p ON r.person_id = p.id
    WHERE 1=1
  `
  const params: any[] = []

  if (status !== 'all') {
    query += ` AND r.status = 'pending'`
  }

  if (search) {
    query += ` AND (r.title LIKE ? OR p.name LIKE ?)`
    params.push(`%${search}%`, `%${search}%`)
  }

  query += ` ORDER BY r.due_date ASC`

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json(results)
})

app.get('/api/people', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, MAX(i.date) as last_interaction
    FROM people p
    LEFT JOIN interactions i ON p.id = i.person_id
    GROUP BY p.id
    ORDER BY updated_at DESC
  `).all()
  return c.json(results)
})

app.get('/api/people/search', async (c) => {
  const q = c.req.query('q')
  if (!q) return c.json([])
  
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, email, company, role FROM people WHERE name LIKE ? OR company LIKE ? LIMIT 10'
  ).bind(`%${q}%`, `%${q}%`).all()
  
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
  const { name, email, company, manager_name, role, tags, metadata, frequency_days, notes, phone, function: func, location } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO people (name, email, company, manager_name, role, tags, metadata, frequency_days, notes, phone, function, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(name, email, company, manager_name, role, tags, JSON.stringify(metadata || {}), frequency_days || null, notes || null, phone || null, func || null, location || null).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.put('/api/people/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, email, company, manager_name, role, tags, metadata, frequency_days, notes, phone, function: func, location } = body

  await c.env.DB.prepare(
    `UPDATE people SET name = ?, email = ?, company = ?, manager_name = ?, role = ?, tags = ?, metadata = ?, frequency_days = ?, notes = ?, phone = ?, function = ?, location = ?, updated_at = unixepoch() WHERE id = ?`
  ).bind(
    name, 
    email || null, 
    company || null, 
    manager_name || null, 
    role || null, 
    tags || null, 
    JSON.stringify(metadata || {}), 
    frequency_days || null, 
    notes || null, 
    phone || null,
    func || null,
    location || null,
    id
  ).run()

  return c.json({ success: true })
})

app.delete('/api/people/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM people WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

app.post('/api/interactions', async (c) => {
  const body = await c.req.json()
  const { person_id, type, summary, date } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO interactions (person_id, type, summary, date) VALUES (?, ?, ?, ?)`
  ).bind(person_id, type, summary, date || Math.floor(Date.now() / 1000)).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.put('/api/interactions/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { type, summary, date } = body

  await c.env.DB.prepare(
    `UPDATE interactions SET type = ?, summary = ?, date = ? WHERE id = ?`
  ).bind(type, summary, date, id).run()

  return c.json({ success: true })
})

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
  const { status } = await c.req.json() 
  await c.env.DB.prepare('UPDATE reminders SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

// --- Campaign Routes ---

app.get('/api/campaigns', async (c) => {
  const status = c.req.query('status') || 'open'
  const query = status === 'all' 
    ? 'SELECT * FROM campaigns ORDER BY created_at DESC'
    : 'SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC'
  
  const { results } = await c.env.DB.prepare(query).bind(status === 'all' ? undefined : status).all()
  return c.json(results)
})

app.post('/api/campaigns', async (c) => {
  const { title, subject_template, body_template } = await c.req.json()
  const result = await c.env.DB.prepare(
    'INSERT INTO campaigns (title, subject_template, body_template) VALUES (?, ?, ?)'
  ).bind(title, subject_template || '', body_template || '').run()
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.get('/api/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  const campaign = await c.env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first()
  if (!campaign) return c.notFound()

  const recipients = await c.env.DB.prepare(`
    SELECT cr.*, p.name, p.email 
    FROM campaign_recipients cr 
    JOIN people p ON cr.person_id = p.id 
    WHERE cr.campaign_id = ?
  `).bind(id).all()

  return c.json({ ...campaign, recipients: recipients.results })
})

app.put('/api/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  const { title, subject_template, body_template } = await c.req.json()
  await c.env.DB.prepare(
    'UPDATE campaigns SET title = ?, subject_template = ?, body_template = ? WHERE id = ?'
  ).bind(title, subject_template, body_template, id).run()
  return c.json({ success: true })
})

app.delete('/api/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM campaigns WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

app.patch('/api/campaigns/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  await c.env.DB.prepare('UPDATE campaigns SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

app.post('/api/campaigns/:id/recipients', async (c) => {
  const campaign_id = c.req.param('id')
  const { person_ids } = await c.req.json() // Array of IDs

  const statements = person_ids.map((pid: number) => 
    c.env.DB.prepare('INSERT OR IGNORE INTO campaign_recipients (campaign_id, person_id) VALUES (?, ?)').bind(campaign_id, pid)
  )
  
  await c.env.DB.batch(statements)
  return c.json({ success: true })
})

app.delete('/api/campaigns/:id/recipients/:person_id', async (c) => {
  const { id, person_id } = c.req.param()
  await c.env.DB.prepare('DELETE FROM campaign_recipients WHERE campaign_id = ? AND person_id = ?').bind(id, person_id).run()
  return c.json({ success: true })
})

app.post('/api/campaigns/:id/send/:person_id', async (c) => {
  const { id, person_id } = c.req.param()
  const campaign = await c.env.DB.prepare('SELECT title FROM campaigns WHERE id = ?').bind(id).first()
  if (!campaign) return c.notFound()

  // 1. Update recipient status
  await c.env.DB.prepare(
    "UPDATE campaign_recipients SET status = 'sent', sent_at = unixepoch() WHERE campaign_id = ? AND person_id = ?"
  ).bind(id, person_id).run()

  // 2. Log interaction
  await c.env.DB.prepare(
    "INSERT INTO interactions (person_id, type, summary, date) VALUES (?, 'email', ?, unixepoch())"
  ).bind(person_id, `Sent campaign email: ${campaign.title}`).run()

  return c.json({ success: true })
})

export default app
