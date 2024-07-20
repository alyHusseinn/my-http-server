const Server = require("./http-server/server");
const logger = require("./middlewares/logger");

const server = new Server();
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.static("./public");

server.use("/",logger);

server.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("Hello World");
})

server.get("/json", (req, res) => {
    // form with two inputs
    res.json(req)
})

server.post("/test", (req, res) => {
    console.log(req.body);
    res.end("test");
})

server.get("/app/html", (req, res) => {
    res.html("index.html");
})

server.get("/a7a", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>a7a</h1>");
})