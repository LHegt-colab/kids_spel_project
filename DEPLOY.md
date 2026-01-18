# Deploying Space Learning Quest to Netlify

## Prerequisites
1.  GitHub Account
2.  Netlify Account
3.  Supabase Project

## Steps

### 1. Push Code to GitHub
Ensure your local code is committed and pushed to a GitHub repository.

### 2. Connect to Netlify
1.  Log in to [Netlify](https://app.netlify.com).
2.  Click **"Add new site"** -> **"Import from Git"**.
3.  Choose **GitHub** and select your repository (`space-learning-quest`).

### 3. Configure Build Settings
Netlify should auto-detect the Vite settings, but confirm:
-   **Build command**: `npm run build`
-   **Publish directory**: `dist`

### 4. Setup Environment Variables
Click on **"Advanced"** or go to **Site settings > Environment variables** after creation.
Add the variables from your local `.env` (or Supabase dashboard):

| Key | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

### 5. Deploy
Click **"Deploy site"**. Netlify will build your project.
Once finished, you will get a public URL (e.g., `https://random-name.netlify.app`).

### 6. Configure Supabase Auth Redirects
1.  Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2.  Add your Netlify URL to the **Site URL** and **Redirect URLs**.
    *   Example: `https://your-site-name.netlify.app`
    *   Also allow `https://your-site-name.netlify.app/**` (wildcard) if needed, though usually the base is enough for default auth.

## Troubleshooting
-   **Routing Issues**: If refreshing a page gives a 404, you need a `_redirects` file in the `public` folder.
    *   Create `public/_redirects` with content: `/*  /index.html  200`
    *   (I have not created this file yet, but it is standard for SPA on Netlify).
