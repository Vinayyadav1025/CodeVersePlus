import React, { useState } from "react";
import "./UserSignIn.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";


export default function UserSignIn() {
  const [type, setType] = useState("signUp");
  const handleOnClick = (text) => {
    if (text !== type) {
      setType(text);
      return;
    }
  };
  const containerClass =
    "container " + (type === "signUp"  ? "right-panel-active" : "");
  return (
    <div className="App">
      <div className={containerClass} id="container">
        <SignUpForm />
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="welcome-heading">Welcome Back!</div>
              <div className="welcome-text">
                To keep connected with us please login with your personal info
              </div>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="greeting-heading">Hello, Friend!</div>
              <div className="greeting-text">
                Enter your personal details and start your journey with us
              </div>
              <button
                className="ghost"
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
