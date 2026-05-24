const { GoogleGenAI } = require("@google/genai"); 
const fs = require("fs");

// Pass the API key explicitly inside an options object
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

async function discoverOpportunities() {
    console.log("AI is surfing the web for opportunities, elite syllabus material, and inspiring chronicles...");

const prompt = `
        Perform live Google Searches to achieve three explicit goals:
        1. Find active 2026 international/regional competitions, challenges, or conferences for secondary school students.
        2. Find high-quality, free, or open-access academic study resources, official specimen past papers, or curriculum portfolios for secondary school students worldwide. Focus heavily on subjects like Mathematics, Computer Science, and English.
        3. Scout the internet for a true, highly inspiring story of an ambitious student (e.g., getting into an Ivy League like MIT/Columbia at a young age, winning an international Olympiad, or launching a tech startup).

        CRITICAL: Return your final response ONLY as a clean JSON object matching the template below. 
        Do NOT wrap it in markdown code blocks (no \`\`\`json tags). Start with { and end with }.
        Ensure all text entries are formatted cleanly in lowercase to match a minimalist luxury aesthetic style.

        Template Structure:
        {
          "competitions": [
            {
              "id": "unique-string-id",
              "type": "competition",
              "title": "official name",
              "shortDesc": "one sentence summary.",
              "fullDetails": "comprehensive paragraphs detailing specs.",
              "category": "academic",
              "interest": "logic & coding",
              "minAge": 13,
              "maxAge": 18,
              "deadline": "2026-xx-xx",
              "eventDate": "2026-xx-xx",
              "location": "online or physical location",
              "prizes": "medals, certificates, cash yields",
              "rounds": "number of stages",
              "fee": "free or specific cost",
              "link": "https://official-website.com"
            }
          ],
          "studyResources": [
            {
              "id": "syllabus-subject-year-unique",
              "syllabus": "MUST BE EXACTLY ONE OF THESE STRINGS: cambridge, ib, ap, french-bac, german-abitur, spm, gaokao, cbse, vce-hsc, canadian, or national", 
              "subject": "computer science, mathematics, or english",
              "type": "specimen paper, textbook, or revision notes", 
              "title": "official asset name",
              "description": "minimalist summary outlining academic modules covered.",
              "link": "https://link-to-free-resource-or-syllabus-guide"
            }
          ],
          "dailyInspiration": {
            "title": "the chronicle title",
            "story": "the full highly-inspiring background narrative story.",
            "takeaway": "the profound single-sentence conclusion quote."
          }
        }
    `;

    try {
        // Query the live Google Search API framework through Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                // Installs live web-searching tools directly into the generation pipeline
                tools: [{ googleSearch: {} }] 
            }
        });

        const rawText = response.text.trim();
        let newScrapedPayload;
        
        try {
            newScrapedPayload = JSON.parse(rawText);
        } catch (e) {
            console.error("The AI returned imperfect JSON structure. Raw dump:", rawText);
            process.exit(1);
        }

        // --- CONTINUOUS DATABASE MAINTENANCE ENGINE ---
        let existingDatabase = { competitions: [], studyResources: [], dailyInspiration: {} };
        if (fs.existsSync("data.json")) {
            try {
                existingDatabase = JSON.parse(fs.readFileSync("data.json", "utf8"));
            } catch (e) {
                console.log("data.json was empty or unreadable. initializing fresh schema state.");
            }
        }

        // 1. Process & Merge Competitions
        let updatedCompetitions = [];
        let seenCompIds = new Set();
        const currentYear = new Date().getFullYear();

        if (existingDatabase.competitions && Array.isArray(existingDatabase.competitions)) {
            existingDatabase.competitions.forEach(comp => {
                let deadline = String(comp.deadline);
                let containsPastYear = false;
                for (let year = 2020; year < currentYear; year++) {
                    if (deadline.includes(String(year))) containsPastYear = true;
                }
                if (containsPastYear) {
                    console.log(`Self-cleaning loop: removing expired registry: ${comp.title}`);
                    return; 
                }
                updatedCompetitions.push(comp);
                seenCompIds.add(comp.id);
            });
        }

        if (newScrapedPayload.competitions && Array.isArray(newScrapedPayload.competitions)) {
            newScrapedPayload.competitions.forEach(newComp => {
                if (!seenCompIds.has(newComp.id)) {
                    updatedCompetitions.push(newComp);
                    seenCompIds.add(newComp.id);
                    console.log(`Adding unique new discovery: ${newComp.title}`);
                }
            });
        }

// 2. Process & Merge Study Resources (The Global Syllabus Warehouse)
        let updatedStudyResources = [];
        let seenResourceIds = new Set();

        // Load existing materials from disk so we don't wipe out past crawls
        if (existingDatabase.studyResources && Array.isArray(existingDatabase.studyResources)) {
            existingDatabase.studyResources.forEach(res => {
                if (res && res.id) {
                    updatedStudyResources.push(res);
                    seenResourceIds.add(res.id);
                }
            });
        }

        // 🌟 AUTOMATED VARIANT RECOVERY MATCH ENGINE
        // This hunts down 'studyResources', 'study_resources', OR 'studyresources' dynamically
        let rawStudyArray = null;
        if (newScrapedPayload.studyResources) rawStudyArray = newScrapedPayload.studyResources;
        else if (newScrapedPayload.study_resources) rawStudyArray = newScrapedPayload.study_resources;
        else if (newScrapedPayload.studyresources) rawStudyArray = newScrapedPayload.studyresources;

        // Influx new syllabus treasures safely
        if (rawStudyArray && Array.isArray(rawStudyArray)) {
            rawStudyArray.forEach(newRes => {
                if (!newRes) return;
                
                // Fallback generator if the AI skipped making a unique item ID string
                const resourceId = newRes.id || `res-${newRes.syllabus}-${newRes.subject}-${Math.random().toString(36).substr(2, 5)}`;
                
                if (!seenResourceIds.has(resourceId)) {
                    newRes.id = resourceId; // Assign uniform structural key
                    updatedStudyResources.push(newRes);
                    seenResourceIds.add(resourceId);
                    console.log(`Caching new syllabus resource: [${newRes.syllabus}] - ${newRes.title}`);
                } else {
                    console.log(`Syllabus resource duplicate blocked for: ${newRes.title}`);
                }
            });
        } else {
            console.log("Warning: The AI payload did not contain a readable study resources array on this pass.");
        }

        // 3. Assemble final combined structural array
        const finalPayload = {
            competitions: updatedCompetitions,
            studyResources: updatedStudyResources,
            dailyInspiration: newScrapedPayload.dailyInspiration || existingDatabase.dailyInspiration
        };

        // Write cleanly back to data.json
        fs.writeFileSync("data.json", JSON.stringify(finalPayload, null, 2), "utf8");
        console.log("Continuous self-cleaning database successfully updated with active academic materials!");

    } catch (error) {
        console.error("The AI ran into an issue surfing the web:", error);
        process.exit(1);
    }
}

discoverOpportunities();
