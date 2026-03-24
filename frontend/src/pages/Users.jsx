import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/api";
import { toast } from "react-toastify";

function Users() {
  const [users, setUsers] = useState([]);

  const userData = localStorage.getItem("user");
  const loggedInUser = userData ? JSON.parse(userData) : null;

  const canManageUsers = loggedInUser?.role === "ADMIN";

  const loadUsers = () => {
    getUsers()
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        console.error("Users error:", err.response?.data || err.message)
      );
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (id) => {
    if (!canManageUsers) {
      toast.error("Only Admin can delete users");
      return;
    }

    if (loggedInUser?.id === id) {
      toast.error("You cannot delete your own account");
      return;
    }

    deleteUser(id)
      .then(() => {
        loadUsers();
        toast.success("User deleted successfully");
      })
      .catch((err) => {
        console.error("Delete user error:", err.response?.data || err.message);
        toast.error("Failed to delete user");
      });
  };

  return (
    <div className="app-bg">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Admin user management panel</p>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">All Users</h3>

          {users.length === 0 ? (
            <p className="item-text">No users available.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="list-item">
                <h4 className="item-title">{user.name || "No Name"}</h4>
                <p className="item-text">Email: {user.email}</p>
                <p className="item-text">Role: {user.role}</p>

                {canManageUsers && loggedInUser?.id !== user.id && (
                  <button
                    className="secondary-btn"
                    onClick={() => handleDelete(user.id)}
                    style={{ marginTop: "10px", background: "#dc2626" }}
                  >
                    Delete User
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;