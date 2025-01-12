import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Problems from './components/Problems/Problems';
import DetailedQuestion from './components/Problems/detailedQuestion';
import UserSignIn from './components/LoginDetail/UserSignIn';
import UserProfile from './components/UserProfile/userProfile';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/contact" element={<div className="page">Contact Us</div>} />
          <Route path="/about" element={<div className="page">About Us</div>} />
          <Route path="/questions/:questionId" element={<DetailedQuestion />} />
          <Route path="/signin" element={<UserSignIn/>} />
          <Route path="/userProfile" element={<UserProfile/>} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
