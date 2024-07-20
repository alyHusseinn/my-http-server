const net = require("net");
const Request = require("./request");
const Response = require("./response");
const fs = require("fs");
const path = require("path");

// Use dynamic import for ES module
let mime;

(async () => {
  mime = (await import("mime")).default;
})();

// const { parse } = require("url");

// const METHODS = [
//   "GET",
//   "POST",
//   "PUT",
//   "DELETE",
//   "HEAD",
//   "CONNECT",
//   "OPTIONS",
//   "TRACE",
// ];

// const { EventEmitter } = require("events");

class Server {
  constructor() {
    this.server = net.createServer(this.#handleConnection.bind(this));
    // this.socket;
    this.request;
    this.response;
    // static assits path
    this.staticFolderPath = null;
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      use: {},
    };
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  static(folderPath) {
    const fullPath = path.join(__dirname, "..", folderPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error("Folder does not exist");
    }
    this.staticFolderPath = fullPath;
    if(this.response) {
      this.response.setStaticFolderPath(fullPath);
    }
  }

  #handleConnection(socket) {
    socket.once("readable", () => {
      // buffer hold the incoming data
      try {
        let reqBuffer = Buffer.alloc(0);
        let reqHeader;
        let buf;

        while ((buf = socket.read()) !== null) {
          reqBuffer = Buffer.concat([reqBuffer, buf]);
          // Check if we've reached \r\n\r\n, indicating end of header
          const headerEndIdx = reqBuffer.indexOf("\r\n\r\n");
          if (headerEndIdx !== -1) {
            const remainingData = reqBuffer.subarray(headerEndIdx + 4);
            // console.log(remainingData.toString());
            reqHeader = reqBuffer.subarray(0, headerEndIdx).toString();
            // push the reminaing data back to the socket
            socket.unshift(remainingData);
            break;
          }
        }

        if (reqHeader) {
          this.request = new Request(reqHeader, socket);
          this.response = new Response(socket);

          if (this.staticFolderPath) {
            this.response.setStaticFolderPath(this.staticFolderPath);
          }

          const routeHandler =
            this.routes[this.request.method]?.[this.request.path];
          if (routeHandler) {
            this.#applyMiddleware(this.request, this.response);
            routeHandler(this.request, this.response);
          } else {
            this.#serveStatic(this.request.path, this.request, this.response);
            this.#applyMiddleware(this.request, this.response);
          }
        } else {
          socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
        }
      } catch (err) {
        console.log(err);
        socket.end("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  }

  #applyMiddleware(req, res) {
     const applyMiddlewaresForPath = (path) => {
      const middlewares = this.routes.use[path];
      if (middlewares) {
        middlewares.forEach((middleware) => {
          middleware(req, res);
        });
      }
    };
    
    if(req.path === "/") {
      applyMiddlewaresForPath("/");
      return;
    }

    // Apply middlewares for the exact path
    applyMiddlewaresForPath(req.path);

    // Apply middlewares of parent paths
    const pathSegments = req.path.split("/").filter(Boolean);
    
    for (let i = pathSegments.length; i > 0; i--) {
      const parentPath = `/${pathSegments.slice(0, i).join("/")}`;
      applyMiddlewaresForPath(parentPath);
    }

    // Apply default middlewares
    applyMiddlewaresForPath("/");
  }

  get(path, handler) {
    this.routes["GET"][path] = handler;
  }
  post(path, handler) {
    this.routes["POST"][path] = handler;
  }
  put(path, handler) {
    this.routes["PUT"][path] = handler;
  }
  delete(path, handler) {
    this.routes["DELETE"][path] = handler;
  }

  use(path, handler) {
    if (!this.routes.use[path]) {
      this.routes.use[path] = [];
    }
    this.routes.use[path].push(handler);
  }

  #serveStatic(filePath, req, res) {
    // const basePath = path.join(__dirname, "..", "public");
    if (!this.staticFolderPath) {
      throw new Error("Static path not set");
    }
    const fullPath = path.join(this.staticFolderPath, filePath);
    const extname = path.extname(fullPath).toLowerCase();

    const contentType = mime.getType(extname) || "application/octet-stream";

    // sync this file exist before reading it
    if(!fs.existsSync(fullPath)) {
      res.setStatus(404, "Not Found");
      res.end("404 Not Found");
      return;
    }


    fs.readFile(fullPath, (err, content) => {
      if (err) {    
        if (err.code === "ENOENT") {
          res.setStatus(404, "Not Found");
          res.end("404 Not Found");
        } else {
          res.setStatus(500, "Internal Server Error");
          res.end("500 Internal Server Error");
        }
      } else {
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", content.length);
        res.end(content);
      }
    });
  }
}

module.exports = Server;