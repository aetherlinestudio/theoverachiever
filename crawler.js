const { GoogleGenAI } = require("@google/genai"); 
const fs = require("fs");

// Pass the API key explicitly inside an options object
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

async function discoverOpportunities() {
    console.log("AI is surfing the web for opportunities and inspiring chronicles...");

    const prompt = `
        Perform a live Google Search to achieve two goals:
        1. Find active 2026 international/regional competitions, challenges, or conferences for secondary school students.
        2. Scout the internet for a true, highly inspiring story of an ambitious student (e.g., how someone got into an Ivy League like MIT/Columbia at a young age, won an international Olympiad, or launched a successful tech startup as a teen).

        CRITICAL: Return your final response ONLY as a clean JSON object matching the template below. 
        Do NOT wrap it in markdown code blocks (no \`\`\`json tags). Start with { and end with }.

        Template Structure:
        {
          "competitions": [
            {
              "id": "unique-string-id",
              "type": "competition",
              "title": "Official Name",
              "shortDesc": "One sentence summary.",
              "fullDetails": "Comprehensive paragraphs detailing specs.",
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
          ],
          "dailyInspiration": {
            "title": "Short compelling story title",
            "story": "A deeply inspiring, highly detailed 3-4 sentence paragraph recounting their true journey, strategy, and triumph.",
            "takeaway": "One short elite quote or advice sentence derived from their story."
          }
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }] // Removed responseMimeType to fix the API conflict
            }
        });

        let freshData = response.text.trim();
        
        // Safety check: if the model wrapped it in a markdown block anyway, strip it out
        if (freshData.startsWith("```")) {
            freshData = freshData.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        fs.writeFileSync("data.json", freshData, "utf8");
        console.log("Live AI data feed and notepad successfully updated!");

    } catch (error) {
        console.error("The AI ran into an issue surfing the web:", error);
        process.exit(1);
    }
}

discoverOpportunities();
