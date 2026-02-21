# Exam Booster Hub

Exam Booster Hub is a modern, responsive student website that generates:
- Short notes
- 10 MCQs with answers
- 5 short answer questions
- 1-page quick revision summary

Users choose a topic, class (6–10), and language (English/Hindi).

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- AI integration: OpenAI Chat Completions API structure
- Security/performance: rate limiting + in-memory caching

## Project Structure
- `index.html` - complete frontend UI
- `server.js` - Express app and `/generate` API route
- `lib/contentGenerator.js` - OpenAI request + fallback generators + cache logic
- `api/generate.js` - Vercel serverless API handler
- `netlify/functions/generate.js` - Netlify function handler
- `vercel.json` - Vercel routing config
- `netlify.toml` - Netlify function + redirect config
- `.env.example` - required environment variables

## Environment Variables
Copy `.env.example` to `.env` and set values:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_MAX=20
PORT=3000
```

## Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## API
### `POST /generate`
Body:
```json
{
  "topic": "Photosynthesis",
  "classLevel": "8",
  "language": "English",
  "examMode": false
}
```

Returns generated notes, MCQs, short questions, and revision sheet.

## Deployment
### Vercel
- Uses `api/generate.js`
- Route `/generate` is mapped in `vercel.json`

### Netlify
- Uses `netlify/functions/generate.js`
- Route `/generate` redirected in `netlify.toml`
