const Server = require("./http-server/server");

const server = new Server();
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.get("/", (req, res) => {
    res.end("Hello World");
})

server.get("/test", (req, res) => {
    // form with two inputs
    res.setHeader("Content-Type", "text/html");
    res.end("<form action='/test' method='POST'><input type='text' name='name'><input type='text' name='age'> <input type='submit'></form>");
})

server.post("/test", (req, res) => {
    console.log(req.body);
    res.end("test");
})

// middleware Logger
server.use("/test", (req, res) => {
    // print like morgan logger in the console
    console.log(req.method, req.path, res.status);
})