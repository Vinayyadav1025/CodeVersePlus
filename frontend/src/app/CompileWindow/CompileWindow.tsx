import React from 'react';

interface CompileWindowProps {
  isVisible: boolean;
  onClose: () => void;
  output1: string;
  error1: string;
  output2: string;
  error2: string;
  inputData: string;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isCustomInputVisible: boolean;
  onRun: () => void;
  aiSuggestionAnalysis?: string;
}

const CompileWindow: React.FC<CompileWindowProps> = ({
  isVisible,
  onClose,
  output1,
  error1,
  output2,
  error2,
  inputData,
  onInputChange,
  isCustomInputVisible,
  onRun,
  aiSuggestionAnalysis
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="mt-20px bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-4xl h-4/5 max-h-[100vh] flex flex-col relative">
        <div className="flex justify-between items-center border-b pb-2 p-5">
          <span className="text-white text-lg font-bold">Compilation Output</span>
          <button
            className="bg-transparent border-none text-gray-400 text-lg cursor-pointer hover:text-white"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 pb-20">
          {/* Custom Input Section */}
          {isCustomInputVisible && (
            <div className="flex flex-col gap-2 mb-4">
              <h4 className="text-white">Custom Input:</h4>
              <textarea
                value={inputData}
                onChange={onInputChange}
                placeholder="Enter your custom input here..."
                className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm font-mono"
              />
            </div>
          )}

          {/* Your Output Section */}
          {!error1 ? (
            <div className="mb-4">
              <h4 className="text-white">Your Output:</h4>
              <pre className="bg-gray-1500 p-2 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                {output1 || 'Error'}
              </pre>
            </div>
          ) : (
            <div className="text-red-500 mb-4">
              <h4 className="text-white">Error:</h4>
              <pre>{error1}</pre>
            </div>
          )}

          {/* Expected Output Section */}
          <div className="mb-4">
            <h4 className="text-white">Expected Output:</h4>
            <pre className="bg-gray-1500 p-2 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {output2 || 'Please provide correct input or compile the code'}
            </pre>
          </div>

          {/* Error Section */}
          {error2 && (
            <div className="text-red-500 mb-4">
              <h4 className="text-white">Error:</h4>
              <pre>{error2}</pre>
            </div>
          )}

          {/* AI Error Analysis Section */}
          {aiSuggestionAnalysis && (
            <div className="border border-purple-500 rounded-md p-3 mb-4">
              <h4 className="text-white flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                AI Suggestion:
              </h4>
              <div className="max-h-60 overflow-y-auto bg-gray-900 p-3 rounded-md">
                <pre className="text-sm font-mono text-purple-200 whitespace-pre-wrap break-words">{aiSuggestionAnalysis}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Buttons - Fixed position at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={onRun}
            className="w-full py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-400"
          >
            Compile & Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompileWindow;