"use client";
import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { ClipLoader, PulseLoader } from "react-spinners";
import CompileWindow from '../../app/CompileWindow/CompileWindow';
import SubmitWindow from '../../app/SubmitWindow/SubmitWindow';

interface Question {
  customCode: string;
  functionCode: string;
  examples: { input: string }[];
  testCases: unknown[]; // Replace `unknown` with the exact type of test cases if known
}

interface EditorProps {
  question: {
    shortHeading: string;
    topicTag?: string[];
    detailedDescription?: string;
    examples?: { input: string; output: string }[];
    constraints?: string;
    customCode?: string;
    functionCode?: string;
    testCases?: string[];
  };
}


const Editor: React.FC<EditorProps> = ({ question }) => {
  const [language, setLanguage] = useState<string>('cpp');
  const [theme, setTheme] = useState<string>('vs-dark');
  const [code, setCode] = useState<string>(''); 
  const [inputData, setInputData] = useState<string>(question.examples[1]?.input || '');
  const [isCompileWindowVisible, setCompileWindowVisible] = useState<boolean>(false);
  const [compileOutput, setCompileOutput] = useState<string>('');
  const [compileError, setCompileError] = useState<string>('');
  const [compileExpectedOutput, setCompileExpectedOutput] = useState<string>('');
  const [compileExpectedError, setCompileExpectedError] = useState<string>('');
  const [isCustomInputVisible, setCustomInputVisible] = useState<boolean>(true);
  const [isSubmitWindowVisible, setSubmitWindowVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('failed');
  const [passedTestCases, setPassedTestCases] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [totalTestCases, setTotalTestCases] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loader state
  const [isHintWindowVisible, setHintWindowVisible] = useState<boolean>(false);
  const [hintContent, setHintContent] = useState<string>('');
  const [isHintLoading, setHintLoading] = useState<boolean>(false);
  const [aiSuggestionAnalysis, setaiSuggestionAnalysis] = useState<string>('');
  const [submissionFeedback, setSubmissionFeedback] = useState<{
  time_complexity?: string;
  space_complexity?: string;
  algorithm_used?: string;
  feedback?: string;
  comparison?: string;
} | null>(null);



  


  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setCode(getDefaultCode(selectedLanguage));
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setTheme(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputData(event.target.value);
  };

  const handleCodeChange = (newCode: string | undefined): void => {
    if (newCode !== undefined) {
      setCode(newCode);
    }
  };

  const getDefaultCode = (language: string): string => {
    switch (language) {
      case 'cpp':
        return question.customCode;
      case 'java':
        return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`;
      case 'python':
        return `print("Hello, Python!")`;
      case 'javascript':
        return `console.log("Hello, JS!");`;
      default:
        return '// Write your code here...';
    }
  };

  const handleFetchHint = async (): Promise<void> => {
    setHintLoading(true);
    try {
      // Get the problem statement from the question
      const problemStatement = question.detailedDescription || question.shortHeading;
      
      const response = await fetch('http://localhost:5004/generate-hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemStatement: problemStatement, // Send the actual problem statement
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setHintContent(data.hint || 'No hint available for this problem.');
      } else {
        setHintContent('Failed to load hint. Please try again.');
      }
    } catch (error) {
      setHintContent('Error loading hint. Please check your connection.');
    } finally {
      setHintLoading(false);
      setHintWindowVisible(true);
    }
  };


const handleCloseHintWindow = (): void => {
  setHintWindowVisible(false);
};

  const handleCompile = async (): Promise<void> => {
    setIsLoading(true); // Show loader

    const actualCode = question.customCode.replace(
      '//Write your code here',
      question.functionCode
    );

    console.log("Code is ",code);
    

    try {
      const response = await fetch('http://localhost:5003/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          actualCode,
          input_data: inputData || '',
        }),
      });

      const data = await response.json();
      console.log("Data is ",data);

      if (response.ok) {
        setCompileOutput(data.codeResponse.stdout);
        setCompileError(data.codeResponse.stderr);
        setCompileExpectedOutput(data.actualCodeResponse.stdout);
        setCompileExpectedError(data.actualCodeResponse.stderr);
      } else {
        setCompileError(data.error || 'Compilation failed. Please check the code and try again.');
        setCompileOutput('');
      }

      if(data?.error || data?.codeResponse?.stderr) {
        // call AI API to get the error message
        const errorResponse = await fetch('http://localhost:5004/error-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            error: data.error || data.codeResponse.stderr,
          }),
        });
        const errorData = await errorResponse.json();
        console.log("Error data is : ", errorData.error_analysis)
        setaiSuggestionAnalysis(errorData.error_analysis || '');
      } else {
        console.log("Code is correct");
        
        // Call the code analysis API for optimization suggestions
        try {
          const analysisResponse = await fetch('http://localhost:5004/analyze-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              problemStatement: question.detailedDescription || question.shortHeading,
            }),
          });
          
          const analysisData = await analysisResponse.json();
          console.log("Code analysis:", analysisData);
          
          if (analysisData.ai_suggestions) {
            setaiSuggestionAnalysis(
              `Your code compiled successfully! Here are some optimization suggestions:\n\n${analysisData.ai_suggestions}`
            );
          } else {
            setaiSuggestionAnalysis('');
          }
        } catch (error) {
          console.error("Failed to get code analysis:", error);
          setaiSuggestionAnalysis('');
        }
      }
      
      setCompileWindowVisible(true);
    } catch (error) {
      setCompileError('Compilation failed. Please check the code and try again.');
      setCompileOutput('');
      setCompileWindowVisible(true);
    }
    finally {
      setIsLoading(false); // Hide loader
    }

  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true); // Show loader

    try {
      setTotalTestCases(question.testCases.length);
      const response = await fetch('http://localhost:5003/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          testCases: question.testCases,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data[0].status);
        setPassedTestCases(data[1].passedTestCases);
        setPassed(data[2].passed);
        
        // If the code passed tests, get AI feedback on the solution
        if (data[2].passed) {
          try {
            const feedbackResponse = await fetch('http://localhost:5004/submission-feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code,
                problemStatement: question.detailedDescription || question.shortHeading,
              }),
            });
            
            const feedbackData = await feedbackResponse.json();
            console.log("Submission feedback:", feedbackData);
            setSubmissionFeedback(feedbackData);
          } catch (feedbackError) {
            console.error('Failed to get submission feedback:', feedbackError);
            setSubmissionFeedback(null);
          }
        }
        
        setSubmitWindowVisible(true);
      } else {
        console.error(data.error || 'Submission failed. Please check the code and try again.');
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setIsLoading(false); // Hide loader
    }
  };

  const handleCloseCompileWindow = (): void => {
    setCompileWindowVisible(false);
  };

  const handleCloseSubmitWindow = (): void => {
    setSubmitWindowVisible(false);
  };

  useEffect(() => {
    setCode(getDefaultCode(language));
  }, [language]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <PulseLoader color="#424fbe"  />
        </div>
      )}

      <div className="flex justify-between items-center p-1 bg-gray-800 text-white flex-wrap">
        <div className="flex items-center">
          <label htmlFor="language-select" className="mr-2 text-lg">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="p-1 text-white bg-gray-800 border border-gray-300 rounded"
          >
            <option value="cpp">CPP</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div className="flex items-center">
          <label htmlFor="theme-select" className="mr-1 text-lg">Theme:</label>
          <select
            id="theme-select"
            value={theme}
            onChange={handleThemeChange}
            className="p-1 text-white bg-gray-800 border border-gray-300 rounded"
          >
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" >
        <MonacoEditor
          language={language}
          theme={theme}
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          height={'100%'}
        />
      </div>

      <div className="flex justify-around items-center p-1 bg-gray-800 text-white flex-wrap">
        <button
          onClick={handleFetchHint}
          className="px-2 py-1 bg-purple-600 rounded hover:bg-purple-500 flex items-center"
          title="Get a hint"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1.055A6.002 6.002 0 006 10c0 1.306.418 2.508 1.126 3.5H7a1 1 0 000 2h6a1 1 0 000-2h-.126A5.978 5.978 0 0014 10a6.002 6.002 0 00-3-5.195V3zm-1 14a1 1 0 100 2 1 1 0 000-2z"/>
          </svg>
        </button>

        <button
          onClick={() => setCompileWindowVisible(true)}
          className="px-4 py-1 bg-blue-800 rounded hover:bg-blue-700"
        >
          Custom Input
        </button>
        <button
          onClick={handleCompile}
          className="px-4 py-1 bg-green-500 rounded hover:bg-green-400"
        >
          Compile & Run
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1 bg-yellow rounded hover:bg-yellow-400"
        >
          Submit
        </button>
        
      </div>

      <CompileWindow
        isVisible={isCompileWindowVisible}
        onClose={handleCloseCompileWindow}
        output1={compileOutput}
        error1={compileError}
        output2={compileExpectedOutput}
        error2={compileExpectedError}
        inputData={inputData}
        onInputChange={handleInputChange}
        isCustomInputVisible={isCustomInputVisible}
        onRun={handleCompile}
        aiSuggestionAnalysis={aiSuggestionAnalysis}
      />
      <SubmitWindow
        isVisible={isSubmitWindowVisible}
        onClose={handleCloseSubmitWindow}
        status={status}
        passedTestCases={passedTestCases}
        passed={passed}
        totalTestCases={totalTestCases}
        submissionFeedback={submissionFeedback}
      />

      {isHintWindowVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`relative w-full max-w-md mx-4 p-6 rounded-lg shadow-lg ${
            theme === 'vs-dark' || theme === 'hc-black' 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-800'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Hint</h2>
              <button 
                onClick={handleCloseHintWindow}
                className="hover:bg-gray-700 p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Hint Content */}
            <div className="overflow-auto max-h-80">
              {isHintLoading ? (
                <div className="flex justify-center items-center py-10">
                  <PulseLoader color="#424fbe" size={10} />
                </div>
              ) : (
                <div className={`whitespace-pre-wrap p-4 rounded ${
                  theme === 'vs-dark' || theme === 'hc-black' 
                    ? 'bg-gray-700' 
                    : 'bg-gray-100'
                }`}>
                  {hintContent}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
