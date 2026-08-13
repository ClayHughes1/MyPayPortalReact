import { Link } from "react-router-dom";
import React, { useState } from 'react';
import '../assets/styles/index.css';
import { login } from '../services/authServices';
import { useNavigate } from "react-router-dom";

export default function Login(){
    const placeholderText = "Enter user name";
    const [error,setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      username: '',
      password: ''
    });

    // Check if current text exactly matches placeholder text
    const isPlaceholderValue =
    formData.username.trim() === placeholderText;
 
  // Update state on input change
  const handleChange = (e) => {
    console.log("handle change");
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    console.log("handle submit");

      e.preventDefault();

      setLoading(true);
      setError("");

      try {

          const result = await login(
              formData.username,
              formData.password
          );
          console.log(result);
          localStorage.setItem("token", result.token);

          localStorage.setItem(
              "user",
              JSON.stringify(result.user)
          );

          if(localStorage.getItem("token"))
          {
            localStorage.setItem("isLoggedIn",true);
          }
          navigate("/payments");

      }
      catch(err){

          console.error("Login failed:", err);

          setError(
              "Login failed. Please try again."
          );

      }
      finally{

          setLoading(false);

      }

  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>

      {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
          <label htmlFor="username" className="form-label">
              Username
          </label>          
            <input
              type="text"
              id="username"
              name="username"
              placeholder={placeholderText}
              value={formData.username}
              onChange={handleChange}
              className={`form-control ${
                  isPlaceholderValue ? "is-invalid invalid-placeholder" : ""
              }`}
              required
          />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>

              {loading ? "Signing In..." : "Sign In"}

          </button>
        </form>
      </div>
    </div>
  );
}
