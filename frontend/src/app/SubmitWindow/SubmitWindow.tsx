import React, {useState} from 'react';
import './SubmitWindow.css';

// Update the interface for the component props
interface SubmitWindowProps {
  isVisible: boolean;
  onClose: () => void;
  status: any;
  passedTestCases: number;
  passed: boolean;
  totalTestCases: number;
  submissionFeedback?: {
    time_complexity?: string;
    space_complexity?: string;
    algorithm_used?: string;
    feedback?: string;
    comparison?: string;
  } | null;
}

const SubmitWindow: React.FC<SubmitWindowProps> = ({
  isVisible,
  onClose,
  status,
  passedTestCases,
  passed,
  totalTestCases,
  submissionFeedback
}) => {
  if (!isVisible) return null;
  const [feedbackLoading, setFeedbackLoading] = useState({
    timeComplexity: false,
    spaceComplexity: false,
    algorithmUsed: false,
    feedback: false,
    comparison: false
  });
  

  const { input, output, response } = status || {};
  const { stdout, stderr } = response || {};

  return (
    <div className="mt-20 fixed inset-0 bg-opacity-50 bg-black flex items-center justify-center z-50">
      <div
        className={`bg-gray-800 rounded-lg shadow-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all ${
          passed ? 'border-2 border-green-500' : ''
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Submission Result</h3>
          <button
            className="text-gray-500 hover:text-white"
            onClick={onClose}
          >
            ✖
          </button>
        </div>
        <div>
          {passed ? (
            <>
              <div className="text-2xl text-green-500 text-center animate-bounce mb-4 ">
                🎉 Accepted! Congratulations! 🎉
              </div>
              <h3 className="text-xl text-green-600 font-bold mb-2">
                All test cases passed
              </h3>
              <h4 className="text-white">Test Cases Passed:</h4>
              <pre className="bg-gray-700 p-4 rounded-md text-green-500 mb-4">
                {passedTestCases}/{totalTestCases}
              </pre>

              {/* AI Feedback Section */}
              {submissionFeedback && (
                <div className="mt-6 border-t border-gray-600 pt-4">
                  <h3 className="text-xl text-blue-400 font-bold mb-3">AI Solution Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time & Space Complexity */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-semibold mb-1">Time Complexity</h4>
                      <div className="h-24 overflow-y-auto bg-gray-900 p-3 rounded text-white text-sm">
                        {submissionFeedback.time_complexity === "Analysis failed" ? 
                          <div className="text-orange-400">Analysis quota exceeded. Try again later.</div> : 
                          submissionFeedback.time_complexity || "Not available"}
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-semibold mb-1">Space Complexity</h4>
                      <div className="h-24 overflow-y-auto bg-gray-900 p-3 rounded text-white text-sm">
                        {submissionFeedback.space_complexity === "Analysis failed" ? 
                          <div className="text-orange-400">Analysis quota exceeded. Try again later.</div> : 
                          submissionFeedback.space_complexity || "Not available"}
                      </div>
                    </div>
                    
                    {/* Algorithm Used */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-semibold mb-1">Algorithm Analysis</h4>
                      <div className="h-24 overflow-y-auto bg-gray-900 p-3 rounded text-white text-sm">
                        {submissionFeedback.algorithm_used === "Analysis failed" ? 
                          <div className="text-orange-400">Analysis quota exceeded. Try again later.</div> : 
                          submissionFeedback.algorithm_used || "Not available"}
                      </div>
                    </div>
                    
                    {/* Comparison with Optimal */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-semibold mb-1">Comparison with Optimal</h4>
                      <div className="h-24 overflow-y-auto bg-gray-900 p-3 rounded text-white text-sm">
                        {submissionFeedback.comparison === "Analysis failed" ? 
                          <div className="text-orange-400">Analysis quota exceeded. Try again later.</div> : 
                          submissionFeedback.comparison || "Not available"}
                      </div>
                    </div>
                    
                    {/* Feedback - Full Width */}
                    <div className="bg-gray-700 rounded-lg p-4 md:col-span-2">
                      <h4 className="text-yellow-400 font-semibold mb-1">Code Feedback</h4>
                      <div className="h-32 overflow-y-auto bg-gray-900 p-3 rounded text-white text-sm">
                        {submissionFeedback.feedback === "Analysis failed" ? 
                          <div className="text-orange-400">Analysis quota exceeded. Try again later.</div> : 
                          submissionFeedback.feedback || "Not available"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {input || output || stdout || stderr ? (
                <>
                  <h4 className="text-red-600 font-bold">Submission Failed:</h4>
                  <h4 className="mt-4 text-gray-100">Input:</h4>
                  <pre className="border-2 border-gray-600 p-4 rounded-md">{input || 'N/A'}</pre>
                  <h4 className="mt-4 text-gray-100">Your Output:</h4>
                  <pre className="border-2 border-gray-600 p-4 rounded-md">
                    {stdout || stderr || 'N/A'}
                  </pre>
                  <h4 className="mt-4 text-gray-100">Expected Output:</h4>
                  <pre className="border-2 border-gray-600 p-4 rounded-md">{output || 'N/A'}</pre>
                  <h4 className="mt-4 text-gray-100">Passed Testcases:</h4>
                  <pre
                    className={`p-4 rounded-md border-2 ${
                      passedTestCases > 0
                        ? 'text-yellow-400 border-yellow-400'
                        : 'text-red-500 border-red-500'
                    }`}
                  >
                    {passedTestCases || 0}/{totalTestCases}
                  </pre>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-red-500">Compilation Error:</h4>
                  <pre className="border-2 border-red-500 p-4 rounded-md text-red-400">
                    {status || 'No details available'}
                  </pre>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitWindow;