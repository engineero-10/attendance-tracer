const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("attendance_token");
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data.message || "Request failed";
    throw new Error(message);
  }
  return data;
}

function dataOf(response) {
  return response?.data ?? response;
}

export async function login(credentials) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  const user = dataOf(response).user;
  localStorage.setItem("attendance_token", user.token);
  localStorage.setItem("attendance_user", JSON.stringify(user));
  return user;
}

export async function signup(credentials) {
  const response = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  const user = dataOf(response).user;
  localStorage.setItem("attendance_token", user.token);
  localStorage.setItem("attendance_user", JSON.stringify(user));
  return user;
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("attendance_user"));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("attendance_token");
  localStorage.removeItem("attendance_user");
}

export async function getTeacherClasses() {
  return dataOf(await request("/classes?limit=100&page=1"));
}

export async function getAvailableClasses() {
  return dataOf(await request("/students/classes?limit=100&page=1"));
}

export async function getMyEnrollments() {
  return dataOf(await request("/students?limit=100&page=1"));
}

export async function enrollInClass(code) {
  return dataOf(
    await request(`/students/${encodeURIComponent(code)}`, { method: "POST" }),
  );
}

export async function createClass(payload) {
  return dataOf(
    await request("/classes/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateClass(code, payload) {
  return dataOf(
    await request(`/classes/edit/${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteClass(code) {
  return dataOf(
    await request(`/classes/delete/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),
  );
}

export async function getDailySummary(classCode, date) {
  return dataOf(
    await request(
      `/teachers/${encodeURIComponent(classCode)}/daily?date=${date}`,
    ),
  );
}

export async function markAttendance(payload) {
  return dataOf(
    await request("/teachers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAttendance(classCode, studentId, payload) {
  return dataOf(
    await request(
      `/teachers/${encodeURIComponent(classCode)}/attendance/${studentId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),
  );
}

export async function getAttendanceHistory() {
  return dataOf(await request("/students/my_history?limit=100&page=1"));
}

export async function exportAttendance(classCode, date, format = "csv") {
  const token = localStorage.getItem("attendance_token");
  const response = await fetch(
    `${API_BASE}/teachers/export/${encodeURIComponent(classCode)}?date=${date}&format=${format}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!response.ok) throw new Error("Could not export attendance");
  return response.blob();
}
