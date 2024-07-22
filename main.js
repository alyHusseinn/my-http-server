const Server = require("./http-server/server");
const logger = require("./middlewares/logger");
const bodyParser = require("./middlewares/bodyParser");

const server = new Server();
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

server.static("./public");

server.use(logger);

server.use(bodyParser);

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
    res.render("index.html");
})

server.get("/a7a", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>a7a</h1>");
})

server.get("/download", (req, res) => {
    res.download("./public/img.jpg", "1.jpg");
    // res.redirect("/app/html");
})

server.get("/redirect", (req, res) => {
    res.redirect("/app/html");
})

server.get("/login", (req, res) => {
    res.render("login.html");
})

server.post("/login", (req, res) => {    
    console.log(req.body);
    res.end("login");
})