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
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
      <div className="mt-20px bg-gray-800 rounded-lg p-5 shadow-xl w-11/12 max-w-4xl h-4/5 max-h-[100vh] overflow-auto relative">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
          <span className="text-white text-lg font-bold">Compilation Output</span>
          <button
            className="bg-transparent border-none text-gray-400 text-lg cursor-pointer hover:text-white"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="flex flex-col gap-4  h-[calc(100%-77px)]">
          {/* Custom Input Section */}
          {isCustomInputVisible && (
            <div className="flex flex-col gap-2">
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
            <div>
              <h4 className="text-white">Your Output:</h4>
              <pre className="bg-gray-1500 p-2 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                {output1 || 'Error'}
              </pre>
            </div>
          ) : (
            <div className="text-red-500">
              <h4 className="text-white">Error:</h4>
              <pre>{error1}</pre>
            </div>
          )}

          {/* Expected Output Section */}
          <div>
            <h4 className="text-white">Expected Output:</h4>
            <pre className="bg-gray-1500 p-2 rounded-md text-sm font-mono overflow-x-auto whitespace-pre-wrap">
              {output2 || 'Please provide correct input or compile the code'}
            </pre>
          </div>

          {/* Error Section */}
          {error2 && (
            <div className="text-red-500">
              <h4 className="text-white">Error:</h4>
              <pre>{error2}</pre>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={onRun}
            className="flex-1 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-400"
          >
            Compile & Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompileWindow;
