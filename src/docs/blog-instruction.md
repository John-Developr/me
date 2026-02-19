# AI Blog Generation Prompt

Generate a blog post about one of the following topics: **technology, study, life or future trends**.

## Requirements

- **Title**: Catchy, 8–12 words  
- **Slug**: Use dashed for spacing, Keep it short and minimal (3–4 words only), Lowercase all character, Do not include #
- **Content**: At least 300–400 words, written in clear paragraphs  
- **Summary / Excerpt**: 30–50 words  
- **Tags**: 3–5 relevant tags  
- **Category**: Choose one: `technology`, `study`, `future`, `life`  
- **Estimated Reading Time As Reading**: in minutes, based on ~200 words per minute

## Output Format

Return the result as **JSON**:

```json
{
    "title": "...",
    "slug": "...",
    "category": "...",
    "content": "...",
    "excerpt": "...",
    "tags": ["...", "..."],
    "reading": 3
}