const API_URL = 'https://dsltpiupbfopyvuiqffg.supabase.co/rest/v1/users';
const API_KEY = 'REPLACE_WITH_YOUR_KEY';
const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export async function fetchUsersAPI() {
  const res = await fetch(`${API_URL}?select=id,user,role,last_login`, { headers });
  return res.ok ? await res.json() : [];
}

export async function addUserAPI(user) {
  await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(user),
  });
}

export async function deleteUserAPI(username) {
  await fetch(`${API_URL}?user=eq.${username}`, { method: 'DELETE', headers });
}

export async function editUserAPI(original, data) {
  await fetch(`${API_URL}?user=eq.${original}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
}
