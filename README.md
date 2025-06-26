# MoviePedia - Svelte Edition

MoviePedia is a web application designed for searching movies and managing user-specific watchlists. This project was developed as a learning exercise to explore Svelte, SvelteKit, TypeScript, and practical API integration for building a dynamic front-end application with user account functionalities.

## Key Features

*   **User Authentication:**
    *   User registration (Sign Up)
    *   User login
    *   Account deletion
    *   Session management (mocked using LocalStorage)
*   **Movie Discovery:**
    *   Search for movies using the OMDB API.
    *   View movie details including poster, title, year, and type.
*   **Personal Watchlist:**
    *   Add movies to a personal watchlist.
    *   View all movies in the watchlist on the profile page.
    *   Remove movies from the watchlist.
*   **Responsive Interface:** Designed to be usable across different screen sizes (styling based on modern CSS practices).

## Tech Stack

*   **Frontend Framework:** [Svelte](https://svelte.dev/) with [SvelteKit](https://kit.svelte.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **API:** [OMDB API](https://www.omdbapi.com/) for movie data.
*   **Styling:** Global CSS with component-scoped styles where necessary.
*   **Development Tooling:** Vite

## Screenshots

*   *Homepage / Movie Search View*

<img src="screenshots/Screenshot From 2025-06-26 17-50-41.png" width="500">

*   *Movie Card Detail*

<img src="screenshots/Screenshot From 2025-06-26 17-51-20.png" width="500">

*   *User Profile Page with Watchlist*

<img src="screenshots/Screenshot From 2025-06-26 17-54-31.png" width="500">

*   *Login/Signup Forms*

<img src="screenshots/Screenshot From 2025-06-26 17-50-48.png" width="500">

## Setup and Running the Application

The application is contained within the `svelte-movie-app` directory.

1.  **Navigate to the Svelte app directory:**
    ```bash
    cd svelte-movie-app
    ```

2.  **Install Dependencies:**
    If you haven't installed dependencies for the Svelte app yet:
    ```bash
    npm install
    ```
    *(Or use `pnpm install` or `yarn install` if you prefer, though `package-lock.json` is set for npm).*

3.  **OMDB API Key:**
    This project uses the OMDB API. The API key is currently hardcoded in `svelte-movie-app/src/lib/api.ts`.
    For personal use or further development, you might want to replace it with your own key from [OMDB API](https://www.omdbapi.com/apikey.aspx).

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    The application will typically be available at `http://localhost:5173/`. Check the terminal output for the exact URL.

---
