exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const { input } = JSON.parse(event.body || '{}')
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ suggestions: [] }) }

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'suggestions.placePrediction.placeId',
        'suggestions.placePrediction.structuredFormat',
        'suggestions.placePrediction.text',
      ].join(','),
    },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ['university', 'educational_institution', 'corporate_office', 'research_institute', 'coworking_space'],
    }),
  })

  const data = res.ok ? await res.json() : { suggestions: [] }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
