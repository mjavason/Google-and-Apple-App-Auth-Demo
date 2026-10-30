export async function testNetwork(apiUrl: string) {
  console.log('api url', apiUrl);

  const response = await fetch(`${apiUrl}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  console.log(result);
}
