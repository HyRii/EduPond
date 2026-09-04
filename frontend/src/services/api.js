const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || "Something went wrong"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default apiRequest;