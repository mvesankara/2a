Node.js and npm installed on your machine. You can use [nvm](ht
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
 
 ### Email Confirmation

 When creating an account, a confirmation email is sent via Supabase. You must validate your address before accessing protected pages such as `MySpace`. After login, unverified users are redirected to the `/verify-email` page where they can request a new confirmation email.
 
 ## Project Structure
 
 The project has been simplified to its core components:
 
 -   **`src/`**: Contains all the source code.
(`Index`, `Login`, `MySpace`, `NotFound`, `ResetPassword`).
     -   **`pages/`**: Contains the main pages of the application (`Index`, `Login`, `MySpace`, `VerifyEmail`, `NotFound`, `ResetPassword`).
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
