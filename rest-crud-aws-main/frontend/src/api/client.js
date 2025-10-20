export const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:3000'; 


export async function createItem(text) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listItems() {
  const res = await fetch(`${API_BASE}/items`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}



