import apiRequest from "./api";

export const login = async (email, password) => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (data?.data?.token) {
    localStorage.setItem("token", data.data.token);
  }

  if (data?.data?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.data.user)
    );
  }

  return data;
};

export const registerStudent = async (
  name,
  email,
  password
) => {
  return apiRequest("/auth/register/student", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export const registerInstructor = async (
  name,
  email,
  password
) => {
  return apiRequest("/auth/register/instructor", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};