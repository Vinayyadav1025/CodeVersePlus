import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from '../Editor/Editor'; 
import { useNavigate } from 'react-router-dom';
import CompileWindow from '../CompileWindow/CompileWindow'; 
import "./QuestionDetail.css";


const QuestionDetail = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [leftWidth, setLeftWidth] = useState(50); // Initial width of left section (centered)
  const [isCompileWindowVisible, setCompileWindowVisible] = useState(false);
  const [compileOutput, setCompileOutput] = useState('');
  const [compileError, setCompileError] = useState('');
  let isDragging = false; // Variable to track drag state
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5002/api/questions/${questionId}`)
      .then((response) => response.json())
      .then((data) => {
        setQuestion(data.question); // Update question state
      })
      .catch((error) => console.error("Error fetching question:", error));
  }, [questionId]);

  const handleDragStart = (e) => {
    isDragging = true;
    document.body.style.cursor = 'ew-resize'; // Change cursor on drag start
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const containerWidth = e.target.parentNode.offsetWidth;
    let newLeftWidth = (e.clientX / containerWidth) * 100;

    // Restrict the leftWidth between 30% and 70% (20% left and right from center)
    if (newLeftWidth < 30) newLeftWidth = 30;
    if (newLeftWidth > 70) newLeftWidth = 70;

    setLeftWidth(newLeftWidth); // Update width if within range
  };

  const handleDragEnd = () => {
    isDragging = false;
    document.body.style.cursor = ''; // Reset cursor after drag
  };

  if (!question) {
    return navigate('/signin');
  }

  return (
    <div className="resizable-container">
      {/* Left Section */}
      <div className="left-section" style={{ width: `${leftWidth}%` }}>
        <h3>{question?.shortHeading || "Question Title"}</h3>
        <div className="tags">
          {question?.topicTag && Array.isArray(question.topicTag) && question.topicTag.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <p>{question?.detailedDescription || "Detailed description goes here."}</p>
        <h4>Examples:</h4>
        {question?.examples?.length > 0 ? (
          question.examples.map((example, index) => (
            <div key={index} className="example">
              <p><strong>Input:</strong> {example.input}</p>
              <p><strong>Output:</strong> {example.output}</p>
            </div>
          ))
        ) : (
          <p>No examples available.</p>
        )}
        <p><strong>Constraints:</strong> {question?.constraints || "None"}</p>
      </div>

      {/* Divider */}
      <div
        className="divider"
        onMouseDown={(e) => {
          handleDragStart(e);
          document.addEventListener('mousemove', handleDragMove);
          document.addEventListener('mouseup', handleDragEnd);
        }}
      ></div>

      {/* Right Section */}
      <div className="right-section" style={{ width: `${100 - leftWidth}%` }}>
        <Editor question={question} leftWidth={leftWidth} />
      </div>

      {/* Compile Window */}
      {/* <CompileWindow
        isVisible={isCompileWindowVisible}
        onClose={() => setCompileWindowVisible(false)}
        output={compileOutput}
        error={compileError}
        leftWidth={leftWidth}
      /> */}
    </div>
  );
};

export default QuestionDetail;