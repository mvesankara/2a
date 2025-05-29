# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b63d3f66-c9e4-4f3c-8ec3-9f2713285b95

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b63d3f66-c9e4-4f3c-8ec3-9f2713285b95) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Local Environment Setup

To run this project effectively locally, especially for features involving Supabase (like authentication, database interactions), you need to configure your local Supabase environment variables.

### Setting up Supabase Locally

The project is configured to use Vite environment variables for Supabase connectivity. These are:
- `VITE_SUPABASE_URL`: Your unique Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anonymous public key.

**Steps:**

1.  **Create a `.env` file:**
    In the root directory of this project, create a new file named `.env`.

2.  **Add Supabase credentials to `.env`:**
    Open the `.env` file and add the following lines, replacing the placeholder values with your actual Supabase project credentials:

    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

3.  **Find your Supabase credentials:**
    You can find "YOUR_SUPABASE_URL" and "YOUR_SUPABASE_ANON_KEY" in your Supabase project dashboard:
    *   Go to your project on [Supabase](https://supabase.com/).
    *   Navigate to **Project Settings** (the gear icon in the left sidebar).
    *   Click on **API**.
    *   Under "Project API keys", you'll find the "URL" (this is your `VITE_SUPABASE_URL`) and the "anon" "public" key (this is your `VITE_SUPABASE_ANON_KEY`).

**Important Notes:**

*   The Supabase client configuration file (`src/integrations/supabase/client.ts`) has been modified to prioritize these environment variables. If they are not found (e.g., the `.env` file is missing or not populated), the application will fall back to using hardcoded values that might be present in the `client.ts` file. You will see a `console.warn` message in your browser's developer console if this fallback occurs. Using a `.env` file is strongly recommended for local development to ensure you are connecting to your intended Supabase backend.
*   The `.env` file should be automatically included in your project's `.gitignore` file (as is standard for Vite projects) to prevent your secret keys from being committed to version control. Always ensure your `.env` file is not tracked by Git.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b63d3f66-c9e4-4f3c-8ec3-9f2713285b95) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
