import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat
 *
 * Body:
 *   { messages: Array<{ role: 'user' | 'assistant', content: string }> }
 *
 * Uses Anthropic Claude when ANTHROPIC_API_KEY is set.
 * Falls back to a smart context-aware mock when the key is absent.
 */

export const runtime = 'edge'; // Use edge runtime for lower latency

const SYSTEM_PROMPT = `You are a highly specialized AI Career Advisor with deep expertise in career transitions, skill development, and hiring trends.

You are embedded inside a career guidance platform called **PathFinder**. You have access to the user's personalized career profile and roadmap data.

---

## YOUR ROLE:
Give highly specific, personalized, and actionable career advice. Never be generic.

---

## WHEN USER DATA IS PROVIDED:
You will receive a JSON object called USER CONTEXT containing:
- selectedCareers: Career titles selected by the user
- skillMatch: How well their current skills match the target career (0–100%)
- marketDemand: Market demand level for their target career
- automationRisk: How likely this career will be automated (0–100%)
- gapSkills: Specific skills they are missing
- workPreferences: How they like to work (team/solo, creative/analytical, etc.)
- roadmap: Their personalized 3-phase learning roadmap (Foundation, Building, Advanced)
  - Each phase has: skills to learn, actions to take, resources, and a milestone

**Always reference this data specifically in your responses.** Never give generic advice when data is available.

---

## STRICT RULES:
- ONLY answer questions related to career guidance, skills, learning, job hunting, salary, or the user's specific roadmap
- If user asks ANYTHING outside these topics, respond ONLY with: "I'm your Career Advisor. I can only help with career-related questions."
- Never say "I don't have information about you" — always reference their profile data when it's provided
- Keep responses structured with bullet points where possible
- Avoid long paragraphs — be concise and direct
- Every response should end with one clear, specific **action the user can take today**

---

## OUTPUT FORMAT (adapt based on question type):

For roadmap questions: Reference their exact phases, skills, and milestones from the roadmap data
For skill questions: Reference their specific gap skills by name  
For career comparison: Compare their two selected careers using their match scores
For salary questions: Give realistic numbers for their specific career and location
For motivation/general: Be encouraging but tie back to their specific profile
`;


import insforge from '@/lib/insforgeClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages as Array<{ role: 'user' | 'assistant'; content: string }>;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // ── InsForge AI API ────────────────────────────────────────────────────────
    try {
      const stateParams = body.state ? `\n\nUSER CONTEXT:\n${JSON.stringify(body.state)}` : '';
      const completion = await insforge.ai.chat.completions.create({
        model: 'xai/grok-beta', // Switched to Grok as requested
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + stateParams },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      if (content) {
        return NextResponse.json({ content });
      }
    } catch (apiError) {
      console.warn('InsForge AI failed, falling back to mock:', apiError);
    }

    // ── Smart Mock Fallback ───────────────────────────────────────────────────
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .at(-1)?.content?.toLowerCase() ?? '';

    const mockResponse = generateMockResponse(lastUserMessage);
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800));

    return NextResponse.json({ content: mockResponse });

  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── Mock response generator ───────────────────────────────────────────────────

function generateMockResponse(message: string): string {
  if (message.includes('salary') || message.includes('pay') || message.includes('earn')) {
    return `Great question on salaries! Here are some realistic ranges:

• **Software Engineer** — ₹6–30L (India) · $90K–$180K (USA)
• **Data Scientist** — ₹8–35L (India) · $100K–$200K (USA)
• **Product Manager** — ₹12–50L (India) · $120K–$220K (USA)
• **UX Designer** — ₹5–25L (India) · $80K–$160K (USA)

These vary significantly based on **company size**, **location within the country**, and **years of experience**.

**Your action for today:** Research the top 5 companies hiring for your target role on LinkedIn and note their offered salary ranges — this gives you real negotiation data.`;
  }

  if (message.includes('roadmap') || message.includes('how to become') || message.includes('plan')) {
    return `Here's a proven 6-month career transition roadmap:

**Month 1–2: Foundation**
• Identify the top 3 skills required for your target role
• Enrol in one high-quality course (Coursera, Udemy, or YouTube)
• Join relevant communities (Reddit, Discord, LinkedIn groups)

**Month 3–4: Build**
• Complete 2 hands-on projects you can show to employers
• Start contributing publicly (GitHub, Behance, Medium — depends on field)
• Connect with 3 professionals in your target role for informational interviews

**Month 5–6: Launch**
• Polish your portfolio/resume with real project outcomes
• Apply to 10+ positions per week
• Prepare for 2–3 interview formats in your domain

**Your action for today:** Write down the single most important skill gap you need to close and spend 30 minutes finding the best free resource to start learning it.`;
  }

  if (message.includes('skill') || message.includes('learn') || message.includes('study')) {
    return `Skills that consistently deliver career ROI in 2025:

**High-demand technical skills:**
• **AI/ML & Prompting** — Applicable across almost every industry now
• **Data Analysis** — SQL, Python, Power BI/Tableau
• **Cloud Platforms** — AWS, Azure, or GCP certification

**High-demand soft skills:**
• **Stakeholder communication** — Often the bottleneck for promotions
• **Project management** — Agile/Scrum certification is a fast win
• **Systems thinking** — Rare and highly valued at senior levels

For your specific career path, focus on **depth in 2–3 skills** rather than surface-level breadth across 10.

**Your action for today:** Take a free skills assessment on LinkedIn Learning to identify your current baseline.`;
  }

  if (message.includes('compare') || message.includes('vs') || message.includes('choose') || message.includes('better')) {
    return `When comparing career paths, evaluate these 5 dimensions:

1. **Skill Fit** — How much of what you already know transfers?
2. **Market Demand** — Which has more open roles in your target location?
3. **Salary Trajectory** — Which pays more at 5 years in, not just entry level?
4. **Growth Ceiling** — Where does the career max out, and is that acceptable?
5. **Personal Alignment** — Which one would you do even if salary were equal?

The data often points to one direction, but your personal alignment score matters enormously for long-term satisfaction and performance.

**Your action for today:** Score both careers 1–10 on each dimension above and see which wins on aggregate — the answer usually becomes obvious.`;
  }

  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start')) {
    return `Hello! I'm your **AI Career Advisor** — here to help you make confident, data-driven career decisions.

I can help you with:
• 💼 **Career path analysis** — which field suits your skills and personality
• 💰 **Salary benchmarks** — realistic earning expectations by role and location
• 🗺️ **Learning roadmaps** — step-by-step plans to reach your career goal
• ⚖️ **Career comparisons** — data-driven side-by-side breakdowns
• 🔧 **Skill gap analysis** — what you need to learn and in what order

What would you like to explore first? Tell me about your current situation and where you want to go — I'll give you a personalised plan.`;
  }

  // Enforce strict out-of-bounds rejection for non-career queries
  const careerKeywords = ['salary', 'pay', 'earn', 'roadmap', 'become', 'plan', 'skill', 'learn', 'study', 'compare', 'vs', 'choose', 'better', 'job', 'interview', 'resume', 'career'];
  const isRelevant = careerKeywords.some(kw => message.includes(kw));

  if (!isRelevant) {
    return `I'm your Career Advisor. I can only help with career-related questions. Try asking about career paths, skills, or salaries!`;
  }

  // Default thoughtful response
  return `That's an insightful question about your career path. Let me break this down:

**Key factors to consider:**
• Your current skills and how they transfer to this direction
• Market demand trends for the next 3–5 years (not just today)
• The realistic time investment required to become competitive
• Alignment with your long-term lifestyle and income goals

Based on what you've shared, the most strategic move is usually to **identify the highest-leverage skill gap** — the one improvement that would unlock the most doors — and attack that first rather than trying to fix everything simultaneously.

Many successful career transitions happen faster than people expect when they focus ruthlessly on what matters most.

**Your action for today:** Write a 2-sentence summary of your ideal career 3 years from now. This clarity will make every other decision easier.

    *(💡 Make sure AI is enabled in your InsForge Project to unlock full AI responses!)*`;
}
