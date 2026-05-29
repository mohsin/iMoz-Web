export default defineEventHandler(async (event) => {
  const { input } = await readBody(event)
  const { googleMapsApiKey } = useRuntimeConfig()

  if (!googleMapsApiKey) {
    return { suggestions: [] }
  }

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleMapsApiKey,
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

  if (!res.ok) return { suggestions: [] }
  return res.json()
})
