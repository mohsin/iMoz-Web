exports.handler = async (event) => {
  const { placeId } = event.queryStringParameters || {}
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey || !placeId) return { statusCode: 200, body: JSON.stringify({}) }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,addressComponents',
    },
  })

  const data = res.ok ? await res.json() : {}
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
