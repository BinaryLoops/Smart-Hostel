/** Mock menu — swap with Firestore or DB later */
const MENU = {
  breakfast: ['Idli & sambar', 'Boiled eggs', 'Tea & coffee'],
  lunch: ['Rajma chawal', 'Seasonal veg', 'Salad'],
  dinner: ['Paneer curry', 'Roti', 'Dal'],
}

export function getMenu(req, res) {
  res.json({ date: new Date().toISOString().slice(0, 10), meals: MENU })
}

export function addFeedback(req, res) {
  const body = req.body || {}
  res.status(201).json({
    id: `fb-${Date.now()}`,
    received: true,
    meal: body.meal,
    rating: body.rating,
  })
}
