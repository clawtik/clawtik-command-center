import { NextResponse } from "next/server";

// Static curated news for now - we can wire up a real feed later
const articles = [
  {
    title: "Google Chrome Ships WebMCP — Every Website Becomes an AI Agent Tool",
    source: "VentureBeat",
    url: "https://venturebeat.com/infrastructure/google-chrome-ships-webmcp-in-early-preview-turning-every-website-into-a",
    time: "Feb 12",
  },
  {
    title: "Claude Cowork Lands on Windows with Full Feature Parity",
    source: "VentureBeat",
    url: "https://venturebeat.com/technology/anthropics-claude-cowork-finally-lands-on-windows-and-it-wants-to-automate",
    time: "Feb 11",
  },
  {
    title: "OpenAI Deploys Cerebras Chips — First Major Move Beyond Nvidia",
    source: "VentureBeat",
    url: "https://venturebeat.com/technology/openai-deploys-cerebras-chips-for-15x-faster-code-generation-in-first-major",
    time: "Feb 12",
  },
  {
    title: "Nvidia's DMS Cuts LLM Reasoning Costs by 8x Without Losing Accuracy",
    source: "VentureBeat",
    url: "https://venturebeat.com/orchestration/nvidias-new-technique-cuts-llm-reasoning-costs-by-8x-without-losing-accuracy",
    time: "Feb 12",
  },
  {
    title: "MiniMax M2.5 — Near SOTA at 1/20th the Cost of Claude Opus",
    source: "VentureBeat",
    url: "https://venturebeat.com/technology/minimaxs-new-open-m2-5-and-m2-5-lightning-near-state-of-the-art-while",
    time: "Feb 12",
  },
  {
    title: "Spotify's Best Devs Haven't Written a Line of Code in 2026",
    source: "The Verge",
    url: "https://www.theverge.com/ai-artificial-intelligence",
    time: "Feb 14",
  },
  {
    title: "DoD May Designate Anthropic as 'Supply Chain Risk'",
    source: "The Verge / Axios",
    url: "https://www.axios.com/2026/02/16/anthropic-defense-department-relationship-hegseth",
    time: "Feb 16",
  },
  {
    title: "ChatGPT Gets Lockdown Mode for Prompt Injection Protection",
    source: "OpenAI",
    url: "https://openai.com/index/introducing-lockdown-mode-and-elevated-risk-labels-in-chatgpt/",
    time: "Feb 16",
  },
];

export async function GET() {
  return NextResponse.json({ articles });
}
