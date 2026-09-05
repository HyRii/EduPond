import apiRequest from "./api";

export const getUsers = async ({
  role = "",
  status = "",
} = {}) => {

  const params = new URLSearchParams();

  if (role) {
    params.set("role", role);
  }

  if (status) {
    params.set("status", status);
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/admin/users?${queryString}`
    : "/admin/users";

  return apiRequest(endpoint);
};

export const updateUserStatus = async (
  userId,
  status
) => {
  return apiRequest(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
};