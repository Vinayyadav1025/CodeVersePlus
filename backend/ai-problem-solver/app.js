require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ESLint } = require("eslint");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5004;

// API Keys
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// OpenRouter configuration
const OPENROUTER_HEADERS = {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "AI Problem Solver",
};



app.use(cors());
app.use(bodyParser.json());


// Gemini configuration 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to make AI API requests with fallback and retry logic
async function makeAIRequest(prompt, maxTokens = 500, temperature = 0.7, responseFormat = null) {
    // Try Gemini first with the newer and working model
    try {
        console.log("Trying with Gemini API (gemini-2.0-flash)");
        
        // Use gemini-2.0-flash which worked in your curl test
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens,
                topK: 40,
                topP: 0.95,
            }
        });
        
        // Create the content structure that matches the working curl request
        const result = await model.generateContent({
            contents: [{
                parts: [{ text: prompt }]
            }]
        });
        
        if (!result.response) {
            throw new Error("Empty response from Gemini API");
        }
        
        const text = result.response.text();
        console.log("Gemini response successful");
        
        // For JSON responses, try to extract and format properly
        if (responseFormat && responseFormat.type === "json_object") {
            try {
                // Extract JSON if embedded in text
                const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                                text.match(/{[\s\S]*}/);
                
                if (jsonMatch) {
                    const jsonContent = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0].trim();
                    // Validate JSON by parsing it
                    JSON.parse(jsonContent);
                    return {
                        content: jsonContent,
                        source: "gemini"
                    };
                }
                
                // If we can't extract JSON, return a structured fallback
                console.log("Could not extract proper JSON from Gemini response");
                return {
                    content: JSON.stringify({
                        time_complexity: "Analysis unavailable",
                        space_complexity: "Analysis unavailable",
                        algorithm_used: "Analysis unavailable",
                        feedback: text.substring(0, 200) + "...",
                        comparison: "Analysis unavailable"
                    }),
                    source: "gemini_structured"
                };
            } catch (jsonError) {
                console.error("Error parsing Gemini JSON:", jsonError);
                return {
                    content: text,
                    source: "gemini" 
                };
            }
        }
        
        return {
            content: text,
            source: "gemini"
        };
    } catch (geminiError) {
        console.error("Gemini API error:", geminiError.message || geminiError);
        
        // If Gemini fails, try OpenRouter as fallback
        try {
            console.log("Switching to OpenRouter API");
            const requestBody = { 
                model: "openai/gpt-3.5-turbo", 
                messages: [{ role: "user", content: prompt }],
                max_tokens: maxTokens,
                temperature: temperature
            };
            
            // Add response format if specified
            if (responseFormat && responseFormat.type === "json_object") {
                requestBody.response_format = responseFormat;
            }
            
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                requestBody,
                { headers: OPENROUTER_HEADERS }
            );
            
            // Verify we got a valid response
            if (!response.data?.choices?.[0]?.message?.content) {
                console.warn("OpenRouter returned invalid response structure");
                throw new Error("Invalid response from OpenRouter");
            }
            
            const content = response.data.choices[0].message.content.trim();
            
            // For JSON responses, validate if it's proper JSON
            if (responseFormat && responseFormat.type === "json_object") {
                try {
                    // Try parsing the JSON to validate it
                    JSON.parse(content);
                } catch (jsonError) {
                    console.warn("OpenRouter returned invalid JSON:", content);
                    throw new Error("Invalid JSON from OpenRouter");
                }
            }
            
            return {
                content: content,
                source: "openrouter"
            };
        } catch (openRouterError) {
            console.error("OpenRouter API error:", openRouterError.message);
            
            // Return a fallback response rather than throwing an error
            if (responseFormat && responseFormat.type === "json_object") {
                return {
                    content: JSON.stringify({
                        time_complexity: "Service unavailable",
                        space_complexity: "Service unavailable",
                        algorithm_used: "Service unavailable",
                        feedback: "Unable to process this request at the moment. Please try again later.",
                        comparison: "Service unavailable"
                    }),
                    source: "fallback"
                };
            } else {
                return {
                    content: "Unable to process this request at the moment. Please try again later.",
                    source: "fallback"
                };
            }
        }
    }
}
/**
 * 🔹 1. Generate Hint for a Competitive Programming Problem
 */
app.post("/generate-hint", async (req, res) => {
    try {
        const { problemStatement } = req.body;
        const prompt = `Explain the optimal approach to solve the following problem in under 50 words, including key steps, logic, and any suitable algorithm or data structure but not write code in any condition so that a solution can be implemented: "${problemStatement}"`;

        const response = await makeAIRequest(prompt, 150);
        res.json({ hint: response.content });
    } catch (error) {
        console.error("Generate hint error:", error);
        res.status(500).json({ error: "Failed to generate hint" });
    }
});

/**
 * 🔹 2. AI-Powered Code Review and Suggestions
 */
app.post("/analyze-code", async (req, res) => {
    try {
        const { code, problemStatement } = req.body;
        
        const prompt = `You are helping with code review for a competitive programming platform. Analyze the code regardless of language. Based on the provided problem statement, suggest optimization or improvement ideas in at most two concise paragraphs (maximum 100 words each).\n\nCode:\n${code}\n\nProblem Statement:\n${problemStatement}`;
        
        const aiResponse = await makeAIRequest(prompt, 500, 0.7);
        let aiSuggestion = aiResponse.content;
        aiSuggestion = aiSuggestion.split("\n\n").slice(0, 2).join("\n\n");
        
        res.json({ 
            ai_suggestions: aiSuggestion,
            source: aiResponse.source 
        });
    } catch (error) {
        console.error("Error analyzing code:", error);
        res.status(500).json({ error: "Failed to analyze code" });
    }
});

/**
 * 🔹 3. Code Optimization Suggestions
 */
app.post("/optimized-code", async (req, res) => {
    try {
        const { code } = req.body;
        const prompt = `Optimize the following code and improve its efficiency:\n${code}. But write only code`;
        
        const response = await makeAIRequest(prompt, 500, 0.7);
        res.json({ 
            optimized_code: response.content,
            source: response.source
        });
    } catch (error) {
        console.error("Optimization error:", error);
        res.status(500).json({ error: "Failed to optimize code" });
    }
});

/**
 * 🔹 4. Bug Detector
 */
app.post("/detect-bugs", async (req, res) => {
    try {
        const { code } = req.body;
        const prompt = `Find bugs in this code and provide fixes:\n${code}`;

        const response = await makeAIRequest(prompt, 500);
        res.json({ 
            bug_report: response.content,
            source: response.source 
        });
    } catch (error) {
        console.error("Bug detection error:", error);
        res.status(500).json({ error: "Failed to detect bugs" });
    }
});

/**
 * 🔹 5. Submission Feedback
 */
app.post("/submission-feedback", async (req, res) => {
    try {
        const { code, problemStatement } = req.body;
        
        // Extract function part to reduce token usage
        const functionPattern = /(?:function|def|class|void)\s+\w+\s*\([^)]*\)\s*(?:{|\:)[\s\S]*?(?:}|return)/;
        const functionMatch = code.match(functionPattern);
        const solutionCode = functionMatch ? functionMatch[0] : code.slice(0, 500);
        
        const prompt = `
        Analyze this solution code for a programming problem, focusing ONLY on the algorithmic part:
        
        Problem: ${problemStatement ? problemStatement.slice(0, 300) : "Not provided"}
        
        Code:
        ${solutionCode}
        
        Please provide the following analysis:
        1. Time Complexity: Estimate the time complexity of the algorithm and explain briefly.
        2. Space Complexity: Estimate the space complexity of the algorithm.
        3. Algorithm Analysis: Identify which algorithm or data structure is being used.
        4. Submission Feedback: Note one strength and one area for improvement.
        5. Comparison: Brief comparison with the optimal approach.
        
        Format your response as JSON with the following structure:
        {
          "time_complexity": "Your analysis",
          "space_complexity": "Your analysis",
          "algorithm_used": "Your analysis",
          "feedback": "Your analysis",
          "comparison": "Your analysis"
        }
        `;
        
        const aiResponse = await makeAIRequest(prompt, 500, 0.7, { type: "json_object" });
        
        let analysis;
        try {
            analysis = JSON.parse(aiResponse.content);
            
            // Process feedback if it's an object
            if (analysis.feedback && typeof analysis.feedback === 'object') {
                if (analysis.feedback.strength && analysis.feedback.area_for_improvement) {
                    analysis.feedback = `Strength: ${analysis.feedback.strength}. Area for improvement: ${analysis.feedback.area_for_improvement}`;
                } else {
                    analysis.feedback = JSON.stringify(analysis.feedback);
                }
            }
            
            // Ensure all fields are strings
            Object.keys(analysis).forEach(key => {
                if (typeof analysis[key] === 'object' && analysis[key] !== null) {
                    analysis[key] = JSON.stringify(analysis[key]);
                }
            });
            
            // Add source information
            analysis.source = aiResponse.source;
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            analysis = {
                time_complexity: "Parsing error",
                space_complexity: "Could not analyze",
                algorithm_used: "Could not identify",
                feedback: "Analysis failed",
                comparison: "Could not compare",
                source: aiResponse.source
            };
        }

        res.json(analysis);
    } catch (error) {
        console.error("Submission feedback error:", error);
        res.status(500).json({ 
            time_complexity: "Analysis failed",
            space_complexity: "Analysis failed",
            algorithm_used: "Analysis failed",
            feedback: "Service unavailable",
            comparison: "Analysis failed"
        });
    }
});

/**
 * 🔹 6. Algorithm Suggestion
 */
app.post("/suggest-algorithm", async (req, res) => {
    try {
        const { problemStatement } = req.body;
        const prompt = `Suggest the best algorithm to solve this problem:\n${problemStatement}`;

        const response = await makeAIRequest(prompt, 500);
        res.json({ 
            suggested_algorithm: response.content,
            source: response.source
        });
    } catch (error) {
        console.error("Algorithm suggestion error:", error);
        res.status(500).json({ error: "Failed to suggest algorithm" });
    }
});

/**
 * 🔹 7. Error Analysis
 */
app.post("/error-analysis", async (req, res) => {
    try {
      const { code = "", error = ""} = req.body;
      const safeCode = code.slice(0, 2000);
      const safeError = JSON.stringify(error).slice(0, 500);
      
      const prompt = `Analyze the following code and error message.  
      Explain why this error occurred and suggest how to resolve it, but do **not** provide code—only high-level suggestions.
      
      Code:
      ${safeCode}
      
      Error:
      ${safeError}
      `;
      
      const response = await makeAIRequest(prompt, 500);
      res.json({ 
          error_analysis: response.content,
          source: response.source
      });
    } catch (err) {
      console.error("Error analysis failed:", err);
      res.status(500).json({ error: "Failed to analyze error" });
    }
});

/**
 * 🔹 Start Server
 */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));