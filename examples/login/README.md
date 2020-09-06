# Login Example

If you want to run the project, create a Spotify app on [the Spotify Developer site](https://developer.spotify.com/dashboard/).

1. Add `http://localhost:8888/auth/spotify/callback` as a redirect URI to your app profile.
1. Create a `.env` file with the following:

   ```
   CLIENT_ID=
   CLIENT_SECRET=
   ```

1. Copy the client ID and client secret and paste them into the `.env`.
1. Install the dependencies.

   ```sh
   npm install
   ```

1. Run the application.

   ```sh
   node app.js
   ```

1. Navigate to `http://localhost:8888/`.
