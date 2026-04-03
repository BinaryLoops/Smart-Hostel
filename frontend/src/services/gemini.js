/**
 * Summarizes mess feedback using Gemini when VITE_GEMINI_API_KEY is set.
 * Falls back to a simple heuristic summary for demos.
 */
export async function summarizeMessFeedback(feedbackItems) {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  const textBlob = feedbackItems
    .map((f) => `${f.meal || ''}: ${f.rating}/5 — ${f.comment || '(no comment)'}`)
    .join('\n')

  if (!key || !textBlob.trim()) {
    return heuristicSummary(feedbackItems)
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`
  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are summarizing student mess feedback for hostel admins. Be concise (3-5 bullet points). Note trends and actionable items.\n\nFeedback:\n${textBlob}`,
          },
        ],
      },
    ],
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Gemini request failed')
    const data = await res.json()
    const out =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n')?.trim()
    return out || heuristicSummary(feedbackItems)
  } catch {
    return heuristicSummary(feedbackItems)
  }
}

function heuristicSummary(items) {
  if (!items.length) return 'No feedback yet. Encourage students to rate meals after dining hours.'
  const ratings = items.map((i) => Number(i.rating) || 0).filter(Boolean)
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—'
  const low = items.filter((i) => Number(i.rating) <= 2).length
  return `Demo insight (no AI key): Average rating ${avg}/5 across ${ratings.length} responses. ${low} low ratings — review those meals and portions. Trends: check comments for repeated keywords (spice, hygiene, timing).`
}
