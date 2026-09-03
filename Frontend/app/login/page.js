"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Set NEXT_PUBLIC_API_URL in Vercel to the public Railway service URL.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
// Deploy the admin panel separately and set this in Vercel. When it is not
// configured, administrators stay in the main app instead of being sent to a
// route that does not exist in this frontend deployment.
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL;

// ===============================
// Department Dropdown
// ===============================
const departments = [
  "Engineering",
  "HR",
  "Sales",
  "Delivery",
  "Operations",
];

// ===============================
// Designation Dropdown
// ===============================
const designations = [
  "Software Engineer",
  "Senior Software Engineer",
  "DevOps Lead",
  "Solutions Architect",
  "Engineering Lead",
  "Sales Executive",
  "Business Development Manager",
  "Account Manager",
  "Sales Enablement Lead",
  "Delivery Manager",
  "PMO Lead",
  "Operations Lead",
  "HR Associate",
  "HR Operations Lead",
  "Senior Manager",
];

export default function AuthPage() {
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("Software Engineer");
  const [role, setRole] = useState("Employee");
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({
      type: "",
      text: "",
    });

    let endpoint = "";

    if (view === "login") {
      endpoint = `${API_URL}/api/auth/login`;
    } else if (view === "register") {
      endpoint = `${API_URL}/api/auth/register`;
    } else {
      setMessage({
        type: "error",
        text: "Forgot password is not available yet.",
      });
      setLoading(false);
      return;
    }

    const payload =
      view === "login"
        ? {
            email: email.trim(),
            password: password,
            role: role,
          }
        : {
            name: name.trim(),
            email: email.trim(),
            password: password,
            role: role,
            department: department,
            designation: designation,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const contentType =
        res.headers.get("content-type") || "";

      let data;

      if (
        contentType.includes("application/json")
      ) {
        data = await res.json();
      } else {
        const text = await res.text();

        throw new Error(
          `Server returned an invalid response (${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Request failed with status ${res.status}`
        );
      }

      // ==================================================
      // LOGIN SUCCESS
      // ==================================================

      if (view === "login") {

        // Save logged-in user information
        localStorage.setItem(
          "userName",
          data.name || ""
        );

        localStorage.setItem(
          "userRole",
          data.role || role
        );

        localStorage.setItem(
          "userEmail",
          data.email || email
        );

        // Also save these keys for compatibility
        localStorage.setItem(
          "name",
          data.name || ""
        );

        localStorage.setItem(
          "role",
          data.role || role
        );

        localStorage.setItem(
          "email",
          data.email || email
        );

        // Save token if backend provides one
        if (data.token) {
          localStorage.setItem(
            "token",
            data.token
          );
        }

// ==================================================
// LOGIN SUCCESS
// ==================================================
if (view === "login") {


  // Save user information
  localStorage.setItem("userId", String(data.id));
  localStorage.setItem("userName", data.name || "");
  localStorage.setItem("userRole", data.role || role);
  localStorage.setItem("userEmail", data.email || email);
  localStorage.setItem("department", data.department || "");
  localStorage.setItem("designation", data.designation || "");
  

  // Compatibility keys
  localStorage.setItem("name", data.name || "");
  localStorage.setItem("role", data.role || role);
  localStorage.setItem("email", data.email || email);

  // Save token if available
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  const userRole = (data.role || role).trim().toLowerCase();
  const isAdmin = ["admin", "administrator"].includes(userRole);

  if (isAdmin && ADMIN_URL) {
    window.location.assign(ADMIN_URL);
  } else {
    router.push("/dashboard");
  }


} else {

  // ==================================================
  // REGISTER SUCCESS
  // ==================================================

  setMessage({
    type: "success",
    text: "Registration successful! Please Sign In.",
  });

  setName("");
  setEmail("");
  setPassword("");
  setRole("Employee");

  setView("login");
}

      } else {

        // ==================================================
        // REGISTER SUCCESS
        // ==================================================

        setMessage({
          type: "success",
          text: "Registration successful! Please Sign In.",
        });

        setName("");
        setEmail("");
        setPassword("");
        setRole("Employee");
        setDepartment("Engineering");
        setDesignation("Software Engineer");

        setView("login");
      }

    } catch (err) {

      console.error(
        "API Error:",
        err
      );

      setMessage({
        type: "error",
        text:
          err.message ||
          "Unable to connect to server.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#070b19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily:
          "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#0d1527",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          padding: "32px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >

        {/* ==================================================
            LOGIN / REGISTER TOGGLE
        ================================================== */}

          <div
            style={{
              display: "flex",
              backgroundColor: "#070b19",
              padding: "4px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #1e293b",
            }}
          >

            <button
              type="button"
              onClick={() => {
                setView("login");

                setMessage({
                  type: "",
                  text: "",
                });
              }}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",

                backgroundColor:
                  view === "login"
                    ? "#2563eb"
                    : "transparent",

                color:
                  view === "login"
                    ? "#ffffff"
                    : "#94a3b8",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setView("register");

                setMessage({
                  type: "",
                  text: "",
                });
              }}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",

                backgroundColor:
                  view === "register"
                    ? "#2563eb"
                    : "transparent",

                color:
                  view === "register"
                    ? "#ffffff"
                    : "#94a3b8",
              }}
            >
              Register
            </button>

          </div>

        {/* ==================================================
            HEADER
        ================================================== */}

          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#ffffff",
              margin: "0 0 8px 0",
            }}
          >
            {view === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h2>

          <p
            style={{
              fontSize: "14px",
              textAlign: "center",
              color: "#94a3b8",
              margin: "0 0 24px 0",
            }}
          >
            {view === "login"
              ? "Sign in to access your dashboard"
              : "Register to get started"}
          </p>

        {/* ==================================================
            MESSAGE
        ================================================== */}

          {message.text && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",

                backgroundColor:
                  message.type === "success"
                    ? "#064e3b"
                    : "#7f1d1d",

                color:
                  message.type === "success"
                    ? "#6ee7b7"
                    : "#fca5a5",

                border:
                  message.type === "success"
                    ? "1px solid #059669"
                    : "1px solid #dc2626",
              }}
            >
              {message.text}
            </div>
          )}

        {/* ==================================================
            FORM
        ================================================== */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >

            {/* NAME */}
            {view === "register" && (
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#070b19",
                  border:
                    "1px solid #1e293b",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            )}

            {/* EMAIL */}
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#070b19",
                border:
                  "1px solid #1e293b",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {/* PASSWORD */}
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#070b19",
                border:
                  "1px solid #1e293b",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {/* ROLE */}
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#070b19",
                border:
                  "1px solid #1e293b",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                cursor: "pointer",
              }}
            >

              <option
                value="Employee"
                style={{
                  backgroundColor: "#0d1527",
                  color: "#ffffff",
                }}
              >
                Employee
              </option>

              <option
                value="Admin"
                style={{
                  backgroundColor: "#0d1527",
                  color: "#ffffff",
                }}
              >
                Admin
              </option>

            </select>

            {/* DEPARTMENT */}
            {view === "register" && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#070b19",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            {/* DESIGNATION */}
            {view === "register" && (
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#070b19",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {designations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

            {/* FORGOT PASSWORD */}
            {view === "login" && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMessage({
                      type: "error",
                      text:
                        "Forgot password is not available yet.",
                    });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",

                cursor: loading
                  ? "not-allowed"
                  : "pointer",

                opacity: loading ? 0.6 : 1,
                marginTop: "8px",
              }}
            >
              {loading
                ? "Processing..."
                : view === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
      </div>
    </div>
  );
}
