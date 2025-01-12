import React, { useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate, useLocation } from 'react-router-dom';

function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const handleChange = (evt) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value,
    });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();

    const { email, password } = state;
    const data = { email, password };

    fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          console.log("SignIn Success:", data);

          // Store tokens in localStorage after successful login
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // Redirect the user to the original page or dashboard/home page
          const redirectTo = location.state?.from || "/";
          navigate(redirectTo);

          // Trigger the navbar state change (so it knows the user is logged in)
          window.location.reload(); // Forces a re-render of the Navbar
        } else {
          console.log("SignIn failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("SignIn Error:", error);
      });

    // Clear form fields after submission
    setState({ email: "", password: "" });
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit} className="sign-in-form">
        <h1 className="welcome-heading">Sign in</h1>
        <div className="social-container">
          <a href="#" className="fab fa-facebook-f social facebook" />
          <a href="#" className="fab fa-google-plus-g social google" />
          <a href="#" className="fab fa-linkedin-in social linkedin" />
        </div>
        <span className="welcome-text">or use your account</span>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          className="email-input sign-in-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
          className="password-input sign-in-input"
        />
        <a href="#" className="forgot-password">
          Forgot your password?
        </a>
        <button className="sign-in-button">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
