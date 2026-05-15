const { GoogleGenAI } = require("@google/genai"); 
const fs = require("fs");

// Initialize the client. It automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

async function discoverOpportunities() {
    console.log("AI is surfing the web for new opportunities...");

    const prompt = `
        Perform a live Google Search to find active 2026 international or regional competitions, 
        academic challenges, conferences, youth forums, and volunteer initiatives eligible for secondary school students.
        
        Focus on categories like academic, sports, conferences, and volunteer projects.
        Focus on interest sectors like languages, logic & coding, and business.

        Return the results STRICTLY as a valid JSON array matching this exact template structure. Do not wrap it in markdown markdown ticks:
        [
          {
            "id": "unique-string-id",
            "type": "competition",
            "title": "Official Name",
            "shortDesc": "One sentence summary.",
            "fullDetails": "Comprehensive paragraphs detailing what it is.",
            "category": "academic",
            "interest": "logic & coding",
            "minAge": 13,
            "maxAge": 18,
            "deadline": "2026-12-31",
            "eventDate": "Clear date string",
            "location": "Venue or Online status",
            "prizes": "Awards, certificates, or perks",
            "rounds": "Number of stages",
            "fee": "Free Entry or specific cost",
            "link": "Direct registration URL"
          }
        ]
    `;

    try {
        // Correct syntax configuration for the official @google/genai SDK
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Enables live web search tracking
                responseMimeType: "application/json" // Forces output to be flawless JSON
            }
        });

        const freshData = response.text;
        
        // Save the file straight into your root directory
        fs.writeFileSync("data.json", freshData, "utf8");
        console.log("Live AI data feed successfully updated!");

    } catch (error) {
        console.error("The AI ran into an issue surfing the web:", error);
        process.exit(1); // Tells GitHub Actions that the script failed
    }
}

discoverOpportunities();
