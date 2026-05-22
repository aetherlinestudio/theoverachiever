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
        let response;
        let attempts = 0;
        const maxAttempts = 3;
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        while (attempts < maxAttempts) {
            try {
                attempts++;
                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash", 
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }] 
                    }
                });
                break; // 🌟 Success! Break out of the retry loop.
            } catch (aiError) {
                // If it's a 503 server error and we have attempts left, wait and retry
                if (aiError.status === 503 && attempts < maxAttempts) {
                    console.log(`Model is busy (503). Retrying attempt ${attempts}/${maxAttempts} in 5 seconds...`);
                    await delay(5000);
                } else {
                    throw aiError; // Rethrow if it's a different error or we ran out of attempts
                }
            }
        }

        let freshDataText = response.text.trim();
        
        // Safety check: strip markdown code wrappers if the model ignores instructions
        if (freshDataText.startsWith("```")) {
            freshDataText = freshDataText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        // Parse the newly scraped data from Gemini
        const newScrapedPayload = JSON.parse(freshDataText);

        // 1. Read the existing historical database sitting in your repo
        let existingDatabase = { competitions: [], dailyInspiration: {} };
        try {
            if (fs.existsSync("data.json")) {
                existingDatabase = JSON.parse(fs.readFileSync("data.json", "utf8"));
            }
        } catch (e) {
            console.log("No existing database found or file was empty. Starting clean archive.");
        }

        // Get today's live date (YYYY-MM-DD) to compare deadlines
        const todayStr = new Date().toISOString().split("T")[0];

        let updatedCompetitions = [];
        let seenIds = new Set();

        // 2. Process existing archive: Keep old items ONLY if their deadline hasn't passed
        if (existingDatabase.competitions && Array.isArray(existingDatabase.competitions)) {
            existingDatabase.competitions.forEach(comp => {
                const deadline = comp.deadline || "";
                
                // If it's a standard format deadline and it's older than today, skip it!
                if (deadline && deadline.length === 10 && deadline < todayStr) {
                    console.log(`Evicting expired listing: ${comp.title} (Deadline was ${deadline})`);
                    return; 
                }
                
                updatedCompetitions.push(comp);
                seenIds.add(comp.id);
            });
        }

        // 3. Process new data: Append items ONLY if they are completely unique
        if (newScrapedPayload.competitions && Array.isArray(newScrapedPayload.competitions)) {
            newScrapedPayload.competitions.forEach(newComp => {
                if (!seenIds.has(newComp.id)) {
                    updatedCompetitions.push(newComp);
                    seenIds.add(newComp.id);
                    console.log(`Adding unique new discovery: ${newComp.title}`);
                } else {
                    console.log(`Duplicate detected and blocked for: ${newComp.title}`);
                }
            });
        }

        // 4. Assemble the final cumulative payload
        const finalPayload = {
            competitions: updatedCompetitions,
            dailyInspiration: newScrapedPayload.dailyInspiration || existingDatabase.dailyInspiration
        };

        // 5. Overwrite data.json cleanly formatted
        fs.writeFileSync("data.json", JSON.stringify(finalPayload, null, 2), "utf8");
        console.log("Continuous self-cleaning database successfully updated!");

    } catch (error) {
        console.error("The AI ran into an issue surfing the web:", error);
        process.exit(1);
    }

discoverOpportunities();
