import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set.");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * Generic retry wrapper with exponential backoff.
 * Handles Gemini API rate limits (429) gracefully on free tier (15 RPM generative, 1500 RPM embedding).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 4, baseDelay = 3000, label = "API call" } = {}
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.status ?? error?.code ?? error?.httpCode;
      const message = error?.message ?? "";
      const isRateLimit =
        status === 429 ||
        status === "429" ||
        message.includes("429") ||
        message.toLowerCase().includes("resource exhausted") ||
        message.toLowerCase().includes("rate limit");
      const isServerError = status === 503 || status === 500;

      if (attempt === maxRetries || (!isRateLimit && !isServerError)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.warn(
        `⏳ [${label}] ${isRateLimit ? "Rate limited" : "Server error"}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Retry exhausted for ${label}`);
}

export const aiSummariseCommit = async (diff: string) => {
  return withRetry(
    async () => {
      const result = await model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aaf691..bfef6f 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.

Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
- Raised the amount of returned recordings from \`10\` to \`100\` [\`packages/server/recordings_api.ts\`, \`packages/server/constants.ts\`]
- Fixed a typo in the github action name [\`.github/workflows/api-commit-summarizer.yaml\`]
- Moved the \`octokit\` initialization to a separate file [\`src/octokit.ts\`, \`src/index.ts\`]
- Added an OpenAI API for completions [\`packages/utils/apis/openai.ts\`]
- Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names.
Because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.
.
.
Please summarize the following diff file: \n\n${diff}`,
      ]);
      return result.response.text();
    },
    { label: "summarise-commit" }
  );
};

export async function summariseCode(doc: Document): Promise<string> {
  console.log("getting summary for", doc.metadata.source);
  try {
    return await withRetry(
      async () => {
        const code = doc.pageContent.slice(0, 10000);
        const response = await model.generateContent([
          `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
  You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
  Here is the code:
  ---
  ${code}
  ---
  Give a summary no more than 100 words of the code above`,
        ]);
        return response.response.text();
      },
      { label: `summarise-${doc.metadata.source}` }
    );
  } catch (error) {
    console.error(`❌ FAILED to summarize ${doc.metadata.source}:`, error);
    return "";
  }
}

export async function generateEmbedding(summary: string): Promise<number[]> {
  return withRetry(
    async () => {
      const embeddingModel = genAI.getGenerativeModel({
        model: "gemini-embedding-001",
      });
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text: summary }] },
        outputDimensionality: 768,
      });
      return result.embedding.values;
    },
    { maxRetries: 5, baseDelay: 1000, label: "generate-embedding" }
  );
}

export const aiSummarizeChangesSinceLastVisit = async (commitSummaries: string): Promise<string> => {
  return withRetry(
    async () => {
      const result = await model.generateContent([
        `You are a senior software engineer summarizing recent project changes for a team member who was away.
Below is a list of recent commits and their summaries since their last visit.
Please generate a concise, high-level summary (3-4 bullet points max) of the key changes, additions, and refactors that took place.
Be developer-friendly, clear, and direct.

Commits:
${commitSummaries}

Concise Summary:`,
      ]);
      return result.response.text();
    },
    { label: "summarize-changes-since-last-visit" }
  );
};

export const aiGenerateDocumentation = async (
  type: 'readme' | 'architecture' | 'getting-started',
  projectName: string,
  fileSummaries: string,
  languageBreakdown: string
): Promise<string> => {
  const prompts: Record<string, string> = {
    readme: `You are a senior technical writer generating a professional README.md for a project called "${projectName}".

Based on the following file summaries and language breakdown, generate a comprehensive README.md with:
- Project title and description
- Tech stack (based on languages detected)
- Project structure overview
- Key features (inferred from file summaries)
- Setup instructions (generic but appropriate for the tech stack)
- Contributing guidelines
- License placeholder

Language Breakdown: ${languageBreakdown}

File Summaries:
${fileSummaries}

Generate the README in clean markdown format.`,

    architecture: `You are a senior software architect generating an architecture overview document for "${projectName}".

Based on the following file summaries, generate a clear architecture document covering:
- High-level system overview
- Component/module breakdown
- Data flow description
- Key design patterns observed
- External dependencies and integrations
- Directory structure explanation

File Summaries:
${fileSummaries}

Generate the document in clean markdown format.`,

    'getting-started': `You are a senior developer writing a "Getting Started" onboarding guide for "${projectName}".

Based on the file summaries and tech stack, generate a step-by-step guide for new developers:
- Prerequisites (tools, accounts, dependencies)
- Installation steps
- Environment setup
- Running the project locally
- Key files to understand first
- Common development workflows
- Troubleshooting tips

Language Breakdown: ${languageBreakdown}

File Summaries:
${fileSummaries}

Generate the guide in clean markdown format.`,
  };

  return withRetry(
    async () => {
      const result = await model.generateContent([prompts[type] ?? prompts.readme!]);
      return result.response.text();
    },
    { label: `generate-docs-${type}` }
  );
};