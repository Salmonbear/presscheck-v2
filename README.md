# PressCheck

Article credibility checker powered by OpenAI.

## Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add your OpenAI API key as an environment variable in Vercel:
   - Go to your project settings on Vercel
   - Navigate to Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key

## Local Development

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`

3. Run locally:
```bash
vercel dev
```

## Structure

- `index.html` - Frontend interface
- `api/check.js` - Vercel serverless function that calls OpenAI
- `background.jpg` - Background image
