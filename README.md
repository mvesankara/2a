# Simplified React Project

This is a simplified version of a React project, bootstrapped with Vite and using TypeScript, Tailwind CSS, and Supabase for authentication.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine. You can use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage your Node.js versions.

### Installation

1.  **Clone the repo**
    ```sh
    git clone <YOUR_GIT_URL>
    ```
2.  **Navigate to the project directory**
    ```sh
    cd <YOUR_PROJECT_NAME>
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up Supabase**
    - This project uses Supabase for authentication. You will need to create a `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a `.env` file in the root of the project.
    - You can get these keys from your Supabase project dashboard.
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Usage

To run the app in development mode, use the following command:

```sh
npm run dev
```

This will start the development server and you can view the application in your browser at `http://localhost:5173` (the port may vary).

## Project Structure

The project has been simplified to its core components:

-   **`src/`**: Contains all the source code.
    -   **`pages/`**: Contains the main pages of the application (`Index`, `Login`, `MySpace`, `NotFound`, `ResetPassword`).
    -   **`components/`**: Contains the reusable UI components.
    -   **`hooks/`**: Contains custom React hooks.
    -   **`integrations/`**: Contains the Supabase client configuration.
-   **`public/`**: Contains public assets.
-   **`README.md`**: This file.

## What was removed?

This project has been simplified from a much larger application. The following features have been removed:
- Admin dashboard
- Articles and news section
- Community features (members, events, projects)
- Payment integration
- Complex user profiles

The goal of this simplification is to provide a clean and simple starting point for a new project.
