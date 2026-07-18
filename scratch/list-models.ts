import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key!] = value;
        }
    });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY not set.");

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    console.log("Listing available models from Gemini API...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models returned:", data);
        }
    } catch (err: any) {
        console.error("Error listing models:", err.message);
    }
}

run();
