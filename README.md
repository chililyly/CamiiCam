# CamiiCam

CamiiCam is a web-based photobooth built with React, Vite, and Supabase. It lets users pick a layout, capture photos from their camera, preview the strip, and browse supporting pages like FAQ, About, and Privacy.

## Features

- Camera-based photobooth capture flow
- Layout selection before taking photos
- Downloadable photo strip output
- Supabase-backed client setup for auth/data features
- Responsive React UI with routed pages

## Tech Stack

- React 19
- Vite
- React Router
- Supabase JavaScript client

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Create a local `.env` file in the project root with these values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

The app will only initialize Supabase when both values are present.

### 3. Run the app locally

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Project Structure

```text
src/
	components/    Shared UI components
	lib/           Supabase and photobooth helpers
	pages/         Routed pages for the app
supabase/
	migrations/    Database schema and RLS migrations
```

## Supabase Notes

Database migrations live in `supabase/migrations`. Apply them to your Supabase project before using any features that depend on the database schema or row-level security policies.

## Housekeeping

Make sure `.env` stays local and is not committed to Git. A `.gitignore` entry is already included for env files.
