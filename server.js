require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

app.post('/api/generate-strategy', async (req, res) => {
    try {
        const { crisisName } = req.body;
        
        // Create the exact prompt format used in training
        const prompt = `Analyze the provided crisis name, referencing the crisiscommunicationstrategys document as your knowledge base. Emulate the structure, style, and terminology found within the training data.
Input: Crisis Name: ${crisisName}
Output:
Analysis: Provide a detailed analysis of the crisis, mirroring the style and depth presented in the crisiscommunicationstrategys examples. This should include:

Key aspects of the crisis and its development.

Specific details about the company's initial response strategy and which response strategy is used.

Explain why the initial response was effective or ineffective.

Classification: Categorize the crisis type and the initial response strategy using terminology explicitly present in the crisiscommunicationstrategys dataset. Be precise and avoid generalizations. For example, instead of "product recall," use the specific category from the training data like "Product Defect Crisis - Type A" if that's how it was categorized in your training data. Similarly, categorize the response strategy using specific terms like "Denial Response" or "Accommodation Response" as they appear in crisiscommunicationstrategys.

Suggested Action Plan:
Strongly Suggested: Provide a numerically ordered list of actionable steps, drawing direct parallels to successful strategies within the crisiscommunicationstrategys document. Use the specific language and framing from the training data whenever possible.

Least Suggested: Provide a numerically ordered list of actions to avoid, based on the less effective strategies outlined in the crisiscommunicationstrategys document. Again, use the specific language and examples from the training data.`;

        // Call Google AI Studio API with your fine-tuned model
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${process.env.GOOGLE_AI_STUDIO_API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                model: process.env.MODEL_ID,
                generationConfig: {
                    temperature: 0.2,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        // Extract the generated text from the response
        const generatedText = data.candidates[0].content.parts[0].text;

        res.json({ response: generatedText });
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate strategy',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 