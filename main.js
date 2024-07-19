const Server = require("./http-server/server");

const server = new Server();
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.get("/", (req, res) => {
    res.end("Hello World");
})

server.get("/test", (req, res) => {
    res.end("test");
})

// middleware Logger
server.use("/test", (req, res) => {
    // print like morgan logger in the console
    console.log(req.method, req.path, res.status);
})