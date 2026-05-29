export default defineEventHandler(async (event) => {
  const { placeId } = getQuery(event) as { placeId: string }
  const { googleMapsApiKey } = useRuntimeConfig()

  if (!googleMapsApiKey || !placeId) return {}

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': googleMapsApiKey,
      'X-Goog-FieldMask': 'displayName,addressComponents',
    },
  })

  if (!res.ok) return {}
  return res.json()
})
