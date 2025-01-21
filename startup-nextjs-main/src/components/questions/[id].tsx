"use client";
// pages/questions/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const QuestionDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the dynamic ID from the URL
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5002/api/questions/${id}`)
        .then((response) => response.json())
        .then((data) => setQuestion(data.question))
        .catch((error) => console.error('Error fetching question:', error));
    }
  }, [id]);

  if (!question) return <p>Loading...</p>;

  return (
    <div>
      <h1>{question.shortHeading}</h1>
      <p>{question.shortDescription}</p>
      <ul>
        {question.topicTag.map((tag, idx) => (
          <li key={idx}>{tag}</li>
        ))}
      </ul>
      <p>Complexity: {question.complexity}</p>
    </div>
  );
};

export default QuestionDetail;
