const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://internarea-a04s.onrender.com";

const mock = {
  totalApplications: 2345,
  activeJobs: 45,
  activeInternships: 89,
  conversionRate: 5.25,
};

async function getAdminDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    // Backend might not exist yet; fall back to mock JSON.
    return mock;
  }
}

export default { getAdminDashboard };
