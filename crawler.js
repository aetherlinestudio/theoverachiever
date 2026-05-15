const { GoogleGenAI } = require("@google/genai"); // Official Google AI SDK
const fs = require("fs");

// Initialize the API with your free key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function discoverOpportunities() {
    console.log("AI is surfing the web for new opportunities...");

    const prompt = `
        Perform a live Google Search to find active 2026 international or regional competitions, 
        academic challenges, conferences, youth forums, and volunteer initiatives eligible for secondary school students.
        
        Focus on categories like academic, sports, conferences, and volunteer projects.
        Focus on interest sectors like languages, logic & coding, and business.

        Return the results STRICTLY as a valid JSON array matching this exact schema template structure. Do not wrap it in markdown code blocks:
        [
          {
            "id": "unique-string-id",
            "type": "competition" or "opportunity",
            "title": "Official Name",
            "shortDesc": "One sentence summary.",
            "fullDetails": "Comprehensive paragraphs detailing what it is.",
            "category": "academic", "sports", "conferences", or "volunteer",
            "interest": "languages", "logic & coding", or "business",
            "minAge": 13,
            "maxAge": 18,
            "deadline": "YYYY-MM-DD",
            "eventDate": "Clear date string",
            "location": "Venue or Online status",
            "prizes": "Awards, certificates, or perks",
            "rounds": "Number of stages (for competitions only)",
            "fee": "Free Entry or specific cost",
            "link": "Direct registration URL"
          }
        ]
    `;

    try {
        // Calling Gemini 1.5 Flash with live search tracking enabled
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                // This property forces Gemini to use live Google Search results
                tools: [{ googleSearch: {} }], 
                responseMimeType: "application/json"
            }
        });

        const freshData = response.text;
        
        // Overwrite your data.json file with the AI's discoveries
        fs.writeFileSync("data.json", freshData, "utf8");
        console.log("Live AI data feed successfully updated!");

    } catch (error) {
        console.error("The AI ran into an issue surfing the web:", error);
    }
}

discoverOpportunities();