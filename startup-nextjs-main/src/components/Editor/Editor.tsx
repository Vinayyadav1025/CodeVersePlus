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

  const handleCompile = async (): Promise<void> => {
    setIsLoading(true); // Show loader

    const actualCode = question.customCode.replace(
      '//Write your code here',
      question.functionCode
    );

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

      if (response.ok) {
        setCompileOutput(data.codeResponse.stdout);
        setCompileError(data.codeResponse.stderr);
        setCompileExpectedOutput(data.actualCodeResponse.stdout);
        setCompileExpectedError(data.actualCodeResponse.stderr);
      } else {
        setCompileError(data.error || 'Compilation failed. Please check the code and try again.');
        setCompileOutput('');
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
      />
      <SubmitWindow
        isVisible={isSubmitWindowVisible}
        onClose={handleCloseSubmitWindow}
        status={status}
        passedTestCases={passedTestCases}
        passed={passed}
        totalTestCases={totalTestCases}
      />
    </div>
  );
};

export default Editor;
