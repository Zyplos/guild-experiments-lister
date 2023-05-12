# guild-experiments-lister

A tiny project that lists all the features available in all the Discord servers you're in. Useful if you want to see what beta features are available to you across all the servers you're in.

# Project Setup

You'll need to have a Discord application set up. Create one on the [Discord Developer Portal](https://discord.com/developers/applications) and go to the OAuth2 page for your application. Copy the Client ID and keep it somewhere as you'll need it later.

Clone the repository and copy the `.env.example` file to `.env`. Fill in the `CLIENT_ID` field with the Client ID you copied earlier.

Install the dependencies with `npm install` and run the development server with `npm run dev`. Navigate to `http://localhost:3000` and you should see the application running.
