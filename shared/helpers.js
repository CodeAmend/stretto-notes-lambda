export function returnResponse(statusCode, body) {
  const resposeBody = typeof body === 'string'
    ? body
    : JSON.stringify(body);

  return {
    statusCode,
    body: resposeBody
  };
}

