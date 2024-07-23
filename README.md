# HTTP Server Framework from Scratch

This project involves building an HTTP server framework from scratch, using TCP sockets directly rather than the HTTP package, similar to how Express.js operates. This framework supports essential Express-like features and is designed to be extendable and flexible.

## Key Features

- Core methods similar to those provided by Express:
  - `listen(port, callback)`
  - `get(path, handler)`
  - `post(path, handler)`
  - `put(path, handler)`
  - `delete(path, handler)`
  - `use(pathOrHandler, handler)`: To add middleware or route handlers
  - `static(path/to/assets/folder)`: Add the path to the folder of assets

## Key Components
- **Server Class**:
    - Handles incoming TCP connections.
    - Parses request headers and bodies.
    - Routes requests to the appropriate handler based on the request method and path.
    - Applies middleware functions.
- **Request and Response Classes**:

    - `Request`: Parses and stores request information (method, path, headers, body, ip).
    - `Response`: Provides methods for sending responses (setting headers, status codes, and body).
        - `end`: end the response and send it.
        - `write`: write to the response body.
        - `json`: send json data.
        - `render`: render Html to the client.
        - `download`: allow the client to download files from the server.
        - `redirect`: redirect the client URL.
        - `setHeader`: set key/value header.
        - `setStatus`: set status code and statusText.

- **Middleware**:

    - Body Parser: Parses JSON and URL-encoded request bodies and attaches them to the request object.
    - Rate Limiter: Limits the number of requests a client can make within a specified time window.
    - Request Logger: Logs requests.

## Example Usage

### Creating the Server

```javascript
const Server = require('./path/to/server');
const bodyParser = require('./path/to/bodyParser');
const Logger = require('./path/to/logger');
const rateLimiter = require('./path/to/rateLimiter');

const app = new Server();

// Serving Static files
app.static('./public')

// request Logger
app.use(Logger);

// Use bodyParser middleware
app.use(bodyParser);

// Use rate limiter middleware
app.use(rateLimiter({ windowSize: 10000, maxRequests: 10 }));

// Define routes
app.get('/hello', (req, res) => {
  res.end('Hello, world!');
});

app.get('/json', (req, res) => {
  res.json(
    {
        Hello: 'Hello, world',
    }
  );
});

app.post('/data', (req, res) => {
    res.redirect("/hello")
})

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

## To be Done
- [x] Extract the body of the request and added to the Request object
- [x] Build a Body Parser
- [x] Make the next method available
- [x] Build express methods like ( download, redirect )
- [x] Serve Static files (html, javascript, css, ..etc)
- [x] Build a Rate Limiter Middleware
- [ ] the Error Handler
- [ ] provide the router class.
- [ ] Build a cookie Parser middleware.