export async function loadJSON(path) {
  const res = await fetch(path);
  return await res.json();
}
