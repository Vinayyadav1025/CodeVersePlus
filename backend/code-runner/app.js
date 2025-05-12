const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");
const { request } = require("http");
const { log } = require("console");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);

app.use(express.json()); // Parse incoming JSON data

const tempFiles = {
  python: "temp_script.py",
  javascript: "temp_script.js",
  c: "temp_script.c",
  cpp: "temp_script.cpp",
  java: "Main.java",
};

const commands = { 
  python: `python3 ${tempFiles.python}`,
  javascript: `node ${tempFiles.javascript}`,
  c: `gcc ${tempFiles.c} -o temp_executable && ./temp_executable`,
  cpp: `g++ ${tempFiles.cpp} -o temp_executable && ./temp_executable`,
  java: `javac ${tempFiles.java} && java Main`,
};


const executeCode = async (codeToExecute, language, inputData) => {
  const tempFile = tempFiles[language];
  return new Promise((resolve, reject) => {
    try {
      // Write code to temp file
      fs.writeFileSync(tempFile, codeToExecute);

      // Verify the temp file
      if (!fs.existsSync(tempFile)) {
        return reject({ errorType: "FileCreationError", message: "Failed to create temporary file" });
      }

      // Execute the code
      const process = exec(commands[language], { encoding: "utf8" });

      let output = "";
      let errorOutput = "";

      process.stdin.write(inputData + "\n");
      process.stdin.end();

      process.stdout.on("data", (data) => {
        output += data;
      });

      process.stderr.on("data", (data) => {
        errorOutput += data;
      });

      process.on("exit", (code) => {
        cleanUpTempFiles(language);
        if (code === 0) {
          resolve({ stdout: output.trim(), stderr: errorOutput.trim() });
        } else {
          const errorType = identifyErrorType(language, errorOutput);
          reject({ stdout: output.trim(), stderr: errorOutput.trim(), errorType });
        }
      });

      const timeout = setTimeout(() => {
        process.kill();
        reject({ stdout: output.trim(), stderr: errorOutput.trim(), errorType: "TimeoutError" });
      }, 5000);

      process.on("close", () => clearTimeout(timeout));
    } catch (err) {
      cleanUpTempFiles(language);
      reject({ stdout: "", stderr: "Unexpected error during execution", errorType: "UnknownError" });
    }
  });
};

const cleanUpTempFiles = (language) => {
  try {
    fs.unlinkSync(tempFiles[language]);
    if (["c", "cpp"].includes(language)) {
      if (fs.existsSync("temp_executable")) fs.unlinkSync("temp_executable");
    } else if (language === "java") {
      if (fs.existsSync("Main.class")) fs.unlinkSync("Main.class");
    }
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
};

const identifyErrorType = (language, errorOutput) => {
  if (errorOutput.includes("syntax")) return "SyntaxError";
  if (errorOutput.includes("compilation")) return "CompilationError";
  if (errorOutput.includes("runtime")) return "RuntimeError";
  return "UnknownError";
};

app.post("/execute", async (req, res) => {
  try {
    const { language, code, actualCode, input_data } = req.body;

    const responses = {};

    try {
      responses.codeResponse = await executeCode(code, language, input_data);
    } catch (err) {      
      responses.codeResponse = {stdout:err.stdout, stderr:err.stderr};
    }

    if (actualCode) {
      try {
        responses.actualCodeResponse = await executeCode(actualCode, 'cpp', input_data);
      } catch (err) {
        responses.actualCodeResponse = { errorType: err.errorType || "UnknownError", message: err.stderr || "Execution failed" };
      }
    }
    console.log("Response id here",responses);

    res.status(200).json(responses);
  } catch (e) {
    console.error("Error processing the request:", e);
    res.status(500).json({ errorType: "ServerError", message: "Internal Server Error" });
  }
});

app.post("/submit",async (req,res)=>{ 
  try {
    let passedTestCases = 0;
    const { language, code, testCases } = req.body;
    const responses = [];
    for (let i = 0; i < testCases.length; i++) {
      const { input, output } = testCases[i];
      try {
        const response = await executeCode(code, language, input);
        
        if(response.stdout.trim() === output.trim()){
          passedTestCases++;
        }
        else{
          
          responses.push({ status:{input,output, response}});
          break;
        }
      } catch (err) {
        //If code get error while execution
        responses.push({status:err.stderr});
        break;
      }
    }
    if(responses.length === 0){
      responses.push({status:"All testcases passed"},{passedTestCases},{passed:true});
    }
    else{ 
      responses.push({passedTestCases},{passed:false});
    }
    //console.log(responses);
    
    res.status(200).json(responses);
  }
  catch (e) {
    //console.error("Error processing the request:", e);
    res.status(500).json({ errorType: "ServerError", message: "Internal Server Error" });
  }
})



// Start server on port 5000
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
