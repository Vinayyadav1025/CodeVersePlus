import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import OtpInput from "react-otp-input";
import { ThreeDots } from "react-loader-spinner";

function SignUpForm() {
  const [isOtpSent, setIsOtpSent] = useState(false); // Tracks OTP sent status
  const [otp, setOtp] = useState("");
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otpEmail, setOtpEmail] = useState(""); // Stores email for OTP verification
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    setIsLoading(true); // Show loader

    const { name, email, password } = state;

    const data = {
      email,
      username: email.split("@")[0],
      fullName: name,
      collegeName: "",
      course: "",
      password,
    };

    // Signup API call
    fetch("http://localhost:5001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false); // Hide loader
        if (!data.error) {
          console.log("SignUp Success:", data);
          setIsOtpSent(true); // Show OTP form
          setOtpEmail(email); // Save email for OTP verification
        } else {
          setErrorMessage(data.message || "SignUp failed. Please try again.");
        }
      })
      .catch((error) => {
        setIsLoading(false); // Hide loader
        console.error("SignUp Error:", error);
        setErrorMessage("An error occurred during SignUp. Please try again.");
      });

    setState({ name: "", email: "", password: "" }); // Reset form
  };

  const handleOtpSubmit = (evt) => {
    evt.preventDefault();
    setIsLoading(true); // Show loader

    // OTP verification API call
    fetch("http://localhost:5001/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: otpEmail, otp }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false); // Hide loader
        if (!data.error) {
          console.log("OTP verified successfully:", data);
          alert("Account created successfully!");
          setIsOtpSent(false); // Reset to SignUp form
          setOtpEmail(""); // Clear email
          setOtp(""); // Clear OTP
        } else {
          setErrorMessage(data.message || "OTP verification failed. Please try again.");
        }
      })
      .catch((error) => {
        setIsLoading(false); // Hide loader
        console.error("OTP Verification Error:", error);
        setErrorMessage("An error occurred during OTP verification. Please try again.");
      });
  };

  return (
    <div className="form-container sign-up-container">
      {isLoading && (
        <div className="loader-overlay">
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {!isOtpSent ? (
        // Render Signup Form
        <form onSubmit={handleOnSubmit} className="sign-up-form">
          <h1>Create Account</h1>
          <div className="social-container">
            <a href="#" className="social">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="#" className="social">
              <i className="fab fa-google-plus-g" />
            </a>
            <a href="#" className="social">
              <i className="fab fa-linkedin-in" />
            </a>
          </div>
          <span>or use your email for registration</span>
          <input
            type="text"
            name="name"
            value={state.name}
            onChange={handleChange}
            placeholder="Name"
            className="name-input sign-up-input"
            required
          />
          <input
            type="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            placeholder="Email"
            className="email-input sign-up-input"
            required
          />
          <input
            type="password"
            name="password"
            value={state.password}
            onChange={handleChange}
            placeholder="Password"
            className="password-input sign-up-input"
            required
          />
          <button type="submit" className="sign-up-button">
            Sign Up
          </button>
        </form>
      ) : (
        // Render OTP Verification Form
        <form onSubmit={handleOtpSubmit} className="otp-form">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
          />
          <button type="submit" className="verify-otp-button">
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
}

export default SignUpForm;
