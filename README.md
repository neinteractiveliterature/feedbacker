# Intercode Feedbacker

A Feedback webapp for Intercode2-based conventions

## How to run

### Local development

1. **Install dependencies**:=
    ```sh
    npm install
    ```

2. **Set up environment variables**:
    Create a `.env` file in the root directory and add the required environment variables listed in the Configuration Environment Variables section.

3. **Set up the database**
    See the database section for details.

4. **Run the application**:
    ```sh
    npm start
    ```
5. **Access the application**:
    Open your browser and go to `http://localhost:PORT` (replace `PORT` with the actual port number you set in the environment variables).


### Docker Build for Staging and Production

1. **Build the image**
    ```sh
    docker build -t feedbacker .
    ```

2. **Set up the database**
    See the database section for details.

3. **Run the image**
    Set the encironment variables up ini the command line as the secntion bleow. Enuse the container has access to your databse.
    ```sh
    docker run -e ENVVAR=value .... feedbacker
   ```


### Configuration Environment Variables


Here are the enviromnent varioable uou wil need to set at a minimum and some example values.

    PORT: 8080
    DATABASE_URL: "postgres://postgres:postgres@postgres:5432/feedbacker"
    INTERCODE_OAUTH_CLIENT_ID - get from your intercode2 instance
    INTERCODE_OAUTH_CLIENT_SECRET - as above
    INTERCODE_CALLBACK_URL: "http://localhost:8080/oauth_callback"
    INTERCODE_GRAPHQL_URL: "https://intercode.example.org/graphql"
    INTERCODE_TOKEN_URL: "https://intercode.example.org/oauth/token"
    INTERCODE_URL: "https://intercode.example.org/oauth/authorize"
    INTERCODE_OAUTH_CLIENT_ID: "nEaHs-yro_OGxT7_gshFulCHnSKL2-NpnVAg-Cvrpe8"
    NODE_ENV: "production" / "development"
    PGSSLMODE: "noverify"
    SESSION_TYPE: "postgresql"
    CACHE_TYPE: "local
    TZ: "Europe/London"
    MULTISITE_ADMIN:  1

### Database

You will need to setup a postgress database for feedbacker and 
install the schema from docs/tables.sql

### Intercode Intergation

To get the client id and secrets from your intercode2 instance you
will need to configure a new Oauth2 application as an intercord2
admin and give it access to the following scopes.


    public
    openid
    read_signups
    read_conventions
    read_profile
    read_events


