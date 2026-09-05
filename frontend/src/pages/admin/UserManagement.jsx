import { useEffect, useState } from "react";

import DataTable from "../../components/common/DataTable";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

import {
  getUsers,
  updateUserStatus,
} from "../../services/user.service";

const UserManagement = () => {

  const [users, setUsers] = useState([]);

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {

      setLoading(true);
      setError("");

      const response = await getUsers({
        role,
        status,
      });

      setUsers(
        response?.data?.users || []
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to load users."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadUsers();
  }, [role, status]);

  const handleStatusChange = async (user) => {

    const newStatus =
      user.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {

      setError("");

      await updateUserStatus(
        user.id,
        newStatus
      );

      await loadUsers();

    } catch (error) {

      setError(
        error.message ||
        "Failed to update user status."
      );

    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <Badge>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user) => (
        <Badge
          variant={
            user.status === "ACTIVE"
              ? "success"
              : "danger"
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <button
          type="button"
          onClick={() =>
            handleStatusChange(user)
          }
        >
          {user.status === "ACTIVE"
            ? "Deactivate"
            : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <section className="admin-page">

      <div className="admin-page-header">

        <div>
          <p className="page-eyebrow">
            ADMIN
          </p>

          <h1>User Management</h1>

          <p className="page-description">
            Manage EduPond users and their account status.
          </p>
        </div>

      </div>

      <div className="admin-filter-bar">

        <div className="admin-filter">

          <label htmlFor="role">
            Role
          </label>

          <select
            id="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
          >
            <option value="">
              All roles
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="INSTRUCTOR">
              Instructor
            </option>

            <option value="STUDENT">
              Student
            </option>

          </select>

        </div>

        <div className="admin-filter">

          <label htmlFor="status">
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>

        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {loading ? (

        <div className="admin-loading">
          Loading users...
        </div>

      ) : users.length === 0 ? (

        <EmptyState
          title="No users found"
          message="Try changing your filters."
        />

      ) : (

        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found."
        />

      )}

    </section>
  );
};

export default UserManagement;