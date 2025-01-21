"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Editor from "@/components/Editor/Editor";

interface Question {
  shortHeading: string;
  topicTag?: string[];
  detailedDescription?: string;
  examples?: { input: string; output: string }[];
  constraints?: string;
  customCode?: string;      // Add customCode
  functionCode?: string;    // Add functionCode
  testCases?: string[];     // Add testCases
}


interface QuestionDetailProps {
  id: string;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ id }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [leftWidth, setLeftWidth] = useState<number>(40); // Initial width of the left section
  const [error, setError] = useState<string | null>(null);
  const [isLeftSectionScrolled, setIsLeftSectionScrolled] = useState(false);

  const leftSectionRef = useRef<HTMLDivElement | null>(null);
  const rightSectionRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null); // Ref for the divider
  const isDragging = useRef<boolean>(false); // Track if the mouse is dragging

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    fetch(`http://localhost:5002/api/questions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch question. Please try again later.");
        }
        return response.json();
      })
      .then((data) => {
        setQuestion(data.question);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching question:", error);
        setError(error.message);
      });
  }, [id]);

  // Mouse move handler for resizing
  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging.current) {
      const newLeftWidth = (event.clientX / window.innerWidth) * 100; // Calculate percentage of the mouse position
      if (newLeftWidth >= 15 && newLeftWidth <= 60) { // Restrict resizing to a range of 15% to 60%
        setLeftWidth(newLeftWidth);
      }
    }
  };

  // Mouse up handler to stop resizing
  const handleMouseUp = () => {
    isDragging.current = false; // Stop dragging
    window.removeEventListener("mousemove", handleMouseMove); // Remove the mouse move event listener
    window.removeEventListener("mouseup", handleMouseUp); // Remove the mouse up event listener
  };

  // Mouse down handler to start resizing
  const handleMouseDown = (event: React.MouseEvent) => {
    isDragging.current = true; // Start dragging
    window.addEventListener("mousemove", handleMouseMove); // Add mouse move event listener
    window.addEventListener("mouseup", handleMouseUp); // Add mouse up event listener
  };

  // Handle scroll in the left section to sync both sections
  const handleLeftScroll = () => {
    if (leftSectionRef.current && rightSectionRef.current) {
      const leftScrollHeight = leftSectionRef.current.scrollHeight;
      const leftScrollTop = leftSectionRef.current.scrollTop;
      const isLeftScrolledToBottom = leftScrollTop + leftSectionRef.current.clientHeight === leftScrollHeight;

      setIsLeftSectionScrolled(isLeftScrolledToBottom);
      // If left content is fully scrolled, sync right section scroll
      if (isLeftScrolledToBottom) {
        rightSectionRef.current.scrollTop = leftScrollTop;
      }
    }
  };

  // Sync scroll when right section is scrolled
  const handleRightScroll = () => {
    if (leftSectionRef.current && rightSectionRef.current) {
      leftSectionRef.current.scrollTop = rightSectionRef.current.scrollTop;
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!question) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="flex w-full h-[87vh]">
      {/* Left Section */}
      <div
        ref={leftSectionRef}
        className="p-5 overflow-y-auto "
        style={{ width: `${leftWidth}%`, height: '100%' }}
        onScroll={handleLeftScroll}
      >
        <h3 className="text-xl font-bold">{question.shortHeading || "Question Title"}</h3>
        <div className="flex flex-wrap space-x-2 mt-2">
          {question.topicTag?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4">{question.detailedDescription || "Detailed description goes here."}</p>
        <h4 className="mt-4 text-lg font-semibold">Examples:</h4>
        {question.examples?.length ? (
          question.examples.map((example, index) => (
            <div key={index} className="mt-4">
              <p className="font-medium">Input:</p>
              <pre className="p-2">{example.input}</pre>
              <p className="font-medium mt-2">Output:</p>
              <pre className="p-2">{example.output}</pre>
            </div>
          ))
        ) : (
          <p>No examples available.</p>
        )}
        <p className="mt-4">
          <strong>Constraints:</strong> {question.constraints || "None"}
        </p>
      </div>

      {/* Divider */}
      <div
        ref={dividerRef}
        className="w-1 bg-black cursor-col-resize hidden md:block"
        onMouseDown={handleMouseDown}
      ></div>

      {/* Right Section (Code Editor) */}
      <div
        ref={rightSectionRef}
        className="overflow-auto transition-all duration-200 ease-in-out"
        style={{ width: `${100 - leftWidth}%`, height: '100%' }}
        onScroll={handleRightScroll}
      >
        <Editor question={question} />
      </div>
    </div>
  );
};

export default QuestionDetail;
