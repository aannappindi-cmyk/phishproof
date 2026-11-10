import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the environment (set in Vercel, never in code).
const client = new Anthropic();

export const SCAM_TYPES = {
  financial_aid: "Financial aid or tuition refund",
  job_offer: "Fake job or internship offer",
  club_dues: "Club dues or event payment request",
  account_security: "School account / password security alert",
  package_delivery: "Package delivery problem",
  textbook_deal: "Textbook or ticket resale deal",
} as const;
export type ScamType = keyof typeof SCAM_TYPES;

export type Flaggable = { text: string; is_red_flag: boolean; explanation: string };
export type Scenario = {
  channel: "email" | "text";
  from: Flaggable;
  subject: Flaggable;
  body: Flaggable[];
  takeaway: string;
};

const flaggable = {
  type: "object",
  properties: {
    text: { type: "string" },
    is_red_flag: { type: "boolean" },
    explanation: { type: "string" },
  },
  required: ["text", "is_red_flag", "explanation"],
  additionalProperties: false,
};

const SCHEMA = {
  type: "object",
  properties: {
    channel: { type: "string", enum: ["email", "text"] },
    from: flaggable,
    subject: flaggable,
    body: { type: "array", items: flaggable },
    takeaway: { type: "string" },
  },
  required: ["channel", "from", "subject", "body", "takeaway"],
  additionalProperties: false,
};

const SYSTEM = `You write phishing-awareness TRAINING exercises for PhishProof, a platform that teaches college students in student organizations to recognize scams. Each exercise is a realistic but fake message that a member will inspect and click on to find the red flags. The goal is protection: realistic practice so students recognize real scams.

Safety rules for every exercise:
- Use only made-up lookalike domains and phone numbers (e.g. "univ-finaid-support.com", "(555) 0142"). Never use a real URL, real phone number, or a real person's name.
- Never include working instructions for committing fraud; the message is only the bait a student would see.

How to structure the output:
- "from": the sender line as the student would see it (display name plus address or phone number).
- "subject": the email subject line. For a text message, use an empty string with is_red_flag false.
- "body": the message split into short segments in reading order. Every red flag must be its own segment, a short phrase or sentence. Ordinary text goes in segments with is_red_flag false and an empty explanation. Use "\\n" inside segment text for line breaks.
- Include the number of red flags the difficulty asks for, spread across the sender, subject and body.
- Each red-flag "explanation" is 1-2 friendly sentences for a college student: what the warning sign is and what to do instead.
- "takeaway": one sentence the student should remember from this exercise.
- Personalize it: mention the school, the club, and details that make it believable for that club's members. A text message should be short, like a real text.`;

const DIFFICULTY = {
  easy: "Easy: 4 to 5 fairly obvious red flags (bad grammar, wild urgency, clearly wrong domain).",
  medium: "Medium: 3 to 4 red flags that are realistic but noticeable.",
  hard: "Hard: 2 to 3 subtle red flags, polished writing, a very convincing lookalike sender.",
} as const;
export type Difficulty = keyof typeof DIFFICULTY;

export async function generateScenario(input: {
  school: string;
  club: string;
  scamType: ScamType;
  channel: "email" | "text";
  difficulty: Difficulty;
}): Promise<Scenario> {
  const response = await client.beta.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SCHEMA },
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Create one practice ${input.channel === "email" ? "email" : "text message"}.
School: ${input.school}
Student organization: ${input.club}
Scam type: ${SCAM_TYPES[input.scamType]}
Difficulty: ${DIFFICULTY[input.difficulty]}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The AI declined to write this scenario. Try a different scam type or wording.");
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("The AI returned an empty response. Please try again.");
  const scenario = JSON.parse(text.text) as Scenario;
  if (!Array.isArray(scenario.body) || scenario.body.length === 0) {
    throw new Error("The AI returned an incomplete scenario. Please try again.");
  }
  return scenario;
}
