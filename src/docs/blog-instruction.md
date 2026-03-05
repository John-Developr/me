Here's your improved prompt with much clearer, stricter slug instructions:

---

# AI Blog Generation Prompt

Generate a blog post about one of the following topics: **technology, study, life, or future trends**.

## Requirements

- **Title**: Catchy, 8–12 words

- **Slug**:
  - MUST use a hyphen `-` (dash) to separate every word — never use spaces, underscores, or any other character
  - Keep it short: 3–4 words only
  - All characters must be lowercase
  - Only use letters `a-z` and hyphens `-`
  - Do NOT include `#`, spaces, or special characters
  - ✅ Valid example: `future-of-ai`
  - ❌ Invalid examples: `future of ai`, `future_of_ai`, `futureOfAi`, `#future-of-ai`

- **Content**: At least 300–400 words, written in clear paragraphs

- **Summary / Excerpt**: 30–50 words

- **Tags**: 3–5 relevant tags

- **Category**: Choose exactly one: `technology`, `study`, `future`, `life`

- **Reading** (Estimated Reading Time): A number in minutes, calculated by dividing the total word count by 200. Return as an integer only (e.g. `2`, not `"2 minutes"`)

## Output Format

Return the result **only** as a raw JSON object. Do not include any explanation, markdown code fences, or extra text outside the JSON.

```json
{
  "title": "...",
  "slug": "three-to-four-words-here",
  "category": "...",
  "content": "...",
  "excerpt": "...",
  "tags": ["...", "..."],
  "reading": 3
}
```

> **Reminder:** The `slug` field must always follow the pattern `word-word-word` using hyphens only. If you are unsure, double-check that there are no spaces before returning the JSON.