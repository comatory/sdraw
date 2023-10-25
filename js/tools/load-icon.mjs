export async function loadIcon(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load icon: ${response.status}`);
  }

  return response.text();
}
