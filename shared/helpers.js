export function validateGenericBody(body, requiredFields) {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing ${field}.`;
    }
  }
  return null; // valid
}

export function returnResponse(statusCode, errorMessage) {
  return {
    statusCode,
    body: JSON.stringify({ ok: false, error: errorMessage })
  };
}

export function returnSuccessResponse(statusCode) {
  return {
    statusCode,
    body: JSON.stringify({ ok: true })
  };
}

