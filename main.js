const Server = require("./http-server/server");
const logger = require("./middlewares/logger");
const bodyParser = require("./middlewares/bodyParser");
const rateLimiter = require("./middlewares/rateLimiter");

const app = new Server();
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.static("public");

app.use(logger);
app.use(rateLimiter({
    windowSize: 1000 * 60, // 10 requests per minute
    maxRequests: 10
}));
app.use(bodyParser);

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("Hello World");
})

app.get("/json", (req, res) => {
    // form with two inputs
    res.json(res)
})

app.post("/test", (req, res) => {
    console.log(req.body);
    res.end("test");
})

app.get("/app/html", (req, res) => {
    res.render("index.html");
})

app.get("/a7a", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>a7a</h1>");
})

app.get("/download", (req, res) => {
    res.download("./public/img.jpg", "1.jpg");
    // res.redirect("/app/html");
})

app.get("/redirect", (req, res) => {
    res.redirect("/app/html");
})

app.get("/login", (req, res) => {

    res.render("login.html");
})

app.post("/login", (req, res) => {    
    console.log(req.body);
    res.end("login");
})