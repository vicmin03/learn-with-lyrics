# Learn With Lyrics

Deployed on Vercel: https://learn-with-lyrics-cx4jkv4e3-me-c67f99fd.vercel.app/

Learn With Lyrics is a web app for learning Chinese through music. Browse a song collection, read synced lyrics, look up new vocabulary, and listen to songs while following along.

NOTE: The application currently only supports Chinese-language songs.

## Features

- Toggle pinyin pronunciation
- Switch between simplified and traditional Chinese characters
- Select words in the lyrics to view dictionary definitions
- Translate lyrics into English
- Embedded music player with synced lyrics 
- Navigate to the previous or next lyric line during playback
- Admins can add songs by searching YouTube for an artist and title

## Technology

- React 19 with TypeScript
- Vite
- React Router
- Material UI and Emotion
- Supabase for application data and authentication
- YouTube Data API v3 for video search and metadata
- Google Cloud Translation API for lyric translation
- Vitest and Testing Library for tests
- Vercel serverless functions for API calls that require secret keys

## Prerequisites

- Node.js and npm
- A Supabase project
- A YouTube Data API v3 key
- A Google Cloud Translation API key
- Vercel CLI for local development of the serverless API routes

## Local Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a local environment file:

    ```bash
    cp .env.example .env.local
    ```

3. Replace the example values in `.env.local` with credentials from Supabase, YouTube, and Google Cloud. Do not commit `.env.local` or expose server-only keys with a `VITE_` prefix.

4. Start the application with Vercel's local server so both the frontend and `/api` functions are available:

    ```bash
    npx vercel dev
    ```

    The Vercel CLI will print the local URL. Running `npm run dev` starts only the Vite frontend and does not provide the Vercel serverless functions.

## Environment Variables

The expected variables are:

| Variable | Used by | Description |
| --- | --- | --- |
| `VITE_PUBLIC_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase publishable key |
| `YT_DATA_API_KEY` | Server | YouTube Data API v3 key used by the YouTube functions |
| `GOOGLE_TRANSLATION_API_KEY` | Server | Google Cloud Translation API key used by the translation function |

Only variables prefixed with `VITE_` are exposed to browser code by Vite. YouTube and Google Translation keys must remain server-side.

## API Routes

The Vercel functions live in the `api/` directory:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/youtube/search?artist=...&title=...` | `GET` | Searches YouTube for matching videos |
| `/api/youtube/videos?ids=...` | `GET` | Retrieves duration and licensing metadata for video IDs |
| `/api/translate` | `POST` | Translates lyric text; expects `text`, `source`, and `target` in the JSON body |

The YouTube routes keep the API key on the server and return a user-facing configuration error if `YT_DATA_API_KEY` is missing.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server only |
| `npx vercel dev` | Start the frontend and Vercel API functions locally |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm test -- --run` | Run the test suite once |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run lint` | Run ESLint |

## Testing

Run the full test suite once with:

```bash
npm test -- --run
```

Before submitting changes, also run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

The project is configured for deployment on Vercel. Add the environment variables from the table above to the Vercel project settings before deploying. The `api/` directory is detected as Vercel serverless functions, while the Vite build produces the frontend assets.


## Acknowledgements

This project makes use of the following open-source libraries and external services:

### Open-source libraries

* [react-youtube](https://github.com/tjallingt/react-youtube) — React wrapper for the YouTube IFrame Player API.
* [CC-CEDICT](https://cc-cedict.org/) — Chinese–English dictionary data.
* [jieba-wasm](https://github.com/fengkx/jieba-wasm) — Chinese word segmentation.
* [opencc-js](https://github.com/nk2028/opencc-js) — Simplified/Traditional Chinese conversion.
* [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — Chinese Pinyin conversion and processing.
* [react-ionicons](https://github.com/zamarrowski/react-ionicons) / [Ionicons](https://ionic.io/ionicons) — icons.
* [react-hook-form](https://github.com/react-hook-form/react-hook-form) — form state management and validation.

### External APIs

* [Google Cloud Translation API](https://cloud.google.com/translate) — machine translation.
* [YouTube Data API v3](https://developers.google.com/youtube/v3) — YouTube video and metadata access.

### CC-CEDICT

Chinese dictionary data is based on CC-CEDICT, licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). Please see the CC-CEDICT licensing information for details.
