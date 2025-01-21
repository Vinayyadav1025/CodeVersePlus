import React from 'react';

const SubmitWindow = ({
  isVisible,
  onClose,
  status,
  passedTestCases,
  passed,
  totalTestCases,
}) => {
  if (!isVisible) return null;

  const { input, output, response } = status || {};
  const { stdout, stderr } = response || {};

  return (
    <div className="mt-16 fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-gray-800 rounded-lg shadow-lg p-4 max-w-4xl w-full max-h-[100%] overflow-y-auto transform transition-all ${
          passed ? ' border-2 border-green-500' : ''
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Submission Result</h3>
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
              <h4 className="text-white-700">Test Cases Passed:</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-green-700">
                {passedTestCases}/{totalTestCases}
              </pre>

            </>
          ) : (
            <>
              {input || output || stdout || stderr ? (
                <>
                  <h4 className="text-red-600 font-bold">Submission Failed:</h4>
                  <h4 className="mt-4 text-gray-100">Input:</h4>
                  <pre className="border-2  p-4 rounded-md">{input || 'N/A'}</pre>
                  <h4 className="mt-4">Your Output:</h4>
                  <pre className="border-2 p-4 rounded-md">
                    {stdout || stderr || 'N/A'}
                  </pre>
                  <h4 className="mt-4">Expected Output:</h4>
                  <pre className="border-2 p-4 rounded-md">{output || 'N/A'}</pre>
                  <h4 className="mt-4 ">Passed Testcases:</h4>
                  <pre
                    className={`p-4 rounded-md ${
                      passedTestCases > 0
                        ? 'border-2 text-yellow'
                        : 'border-2 text-red-800'
                    }`}
                  >
                    {passedTestCases || 0}/{totalTestCases}
                  </pre>
                </>
              ) : (
                <>
                  <h4 className="border-2 font-bold">Compilation Error:</h4>
                  <pre className="border-2 p-4 rounded-md text-red-700">
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
