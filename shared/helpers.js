export function returnResponse(statusCode, errorMessage) {
  return {
    statusCode,
    body: JSON.stringify({ error: errorMessage })
  }
}
