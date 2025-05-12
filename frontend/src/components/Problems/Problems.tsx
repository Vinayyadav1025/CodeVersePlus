"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  _id: string;
  shortHeading: string;
  shortDescription: string;
  topicTag: string[];
  complexity: string;
}

const Problems: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);

  const topics = ["Array", "String", "Sorting", "Searching", "Linked List", "Stack","Queue", "Tree","Graph", "Dynamic Programming", "Greedy", "Backtracking", "Bit Manipulation", "Mathematics", "Recursion", "Hashing"];
  const complexities = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    fetch(`http://localhost:5002/api/questions`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setFilteredQuestions(data.questions);
        } else {
          console.error("Fetched data is not an array:", data);
        }
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  useEffect(() => {
    if (selectedTopics.length === 0 && selectedComplexities.length === 0) {
      setFilteredQuestions(questions);
    } else {
      let filtered = [...questions];

      if (selectedTopics.length > 0) {
        filtered = filtered.filter((question) =>
          selectedTopics.some((topic) => question.topicTag.includes(topic))
        );
      }

      if (selectedComplexities.length > 0) {
        filtered = filtered.filter((question) =>
          selectedComplexities.includes(question.complexity)
        );
      }

      setFilteredQuestions(filtered);
    }
  }, [selectedTopics, selectedComplexities, questions]);

  const handleTopicChange = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleComplexityChange = (complexity: string) => {
    setSelectedComplexities((prev) =>
      prev.includes(complexity)
        ? prev.filter((c) => c !== complexity)
        : [...prev, complexity]
    );
  };

  return (
    <div className="flex flex-wrap h-full">
      <div className="w-full md:w-1/4 p-4">
        <h3 className="font-bold text-lg mb-4">Topics</h3>
        {topics.map((topic) => (
          <div key={topic} className="flex items-center justify-between mb-2">
            <label htmlFor={`topic-${topic}`} >
              {topic}
            </label>
            <input
              type="checkbox"
              id={`topic-${topic}`}
              onChange={() => handleTopicChange(topic)}
              className="form-checkbox text-indigo-600"
            />
          </div>
        ))}
        <h3 className="font-bold text-lg mt-6 mb-4">Complexity</h3>
        {complexities.map((complexity) => (
          <div
            key={complexity}
            className="flex items-center justify-between mb-2"
          >
            <label htmlFor={`complexity-${complexity}`} >
              {complexity}
            </label>
            <input
              type="checkbox"
              id={`complexity-${complexity}`}
              onChange={() => handleComplexityChange(complexity)}
              className="form-checkbox text-indigo-600"
            />
          </div>
        ))}
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div
              key={question._id}
              className="border-b border-gray-300 pb-4 mb-4"
            >
              <Link
                href={{
                  pathname: "/detailed-question",
                  query: { id: question._id },
                }}
                className="block"
              >
                <h4 className="font-bold text-lg ">
                  {question.shortHeading}
                </h4>
                <p className="text-sm ">
                  {question.shortDescription}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions match the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default Problems;
