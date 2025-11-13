export async function api(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API Error");
  }
  return response.json();
}
