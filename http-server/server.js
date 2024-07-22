const net = require("net");
const Request = require("./request");
const Response = require("./response");
const fs = require("fs");
const path = require("path");

let mime;
(async () => {
  mime = (await import("mime")).default;
})();

class Server {
  constructor() {
    this.server = net.createServer(this.#handleConnection.bind(this));
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
  }

  #handleConnection(socket) {
    socket.once("readable", () => {
      try {
        let reqBuffer = Buffer.alloc(0);
        let reqHeader;
        let buf;

        while ((buf = socket.read()) !== null) {
          reqBuffer = Buffer.concat([reqBuffer, buf]);
          const headerEndIdx = reqBuffer.indexOf("\r\n\r\n");
          if (headerEndIdx !== -1) {
            const remainingData = reqBuffer.subarray(headerEndIdx + 4);
            reqHeader = reqBuffer.subarray(0, headerEndIdx).toString();
            socket.unshift(remainingData);
            break;
          }
        }

        if (reqHeader) {
          const request = new Request(reqHeader, socket);
          const response = new Response(socket);

          if (this.staticFolderPath) {
            response.setStaticFolderPath(this.staticFolderPath);
          }

          this.#applyMiddleware(request, response, () => {
            const routeHandler = this.routes[request.method]?.[request.path];
            if (routeHandler) {
              routeHandler(request, response);
            } else {
              this.#serveStatic(request.path, request, response);
            }
          });
        } else {
          socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
        }
      } catch (err) {
        console.error("Error handling connection:", err);
        socket.end("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  }

  // thanks ChatGPT :) for this function applyMiddleware
  #applyMiddleware(req, res, next) {
    const pathToMiddleware = (path) => {
      return this.routes.use[path] || [];
    };

    const applyMiddlewaresForPath = (path, cb) => {
      const middlewares = pathToMiddleware(path);
      if (middlewares.length > 0) {
        let index = 0;
        const nextMiddleware = () => {
          if (index < middlewares.length) {
            const middleware = middlewares[index++];
            try {
              middleware(req, res, nextMiddleware);
            } catch (err) {
              console.error("Middleware error:", err);
              res.setStatus(500, "Internal Server Error");
              res.end("500 Internal Server Error");
            }
          } else {
            cb();
          }
        };
        nextMiddleware();
      } else {
        cb();
      }
    };

    const applyPathAndParents = (path, cb) => {
      applyMiddlewaresForPath(path, () => {
        const pathSegments = path.split("/").filter(Boolean);
        for (let i = pathSegments.length; i > 0; i--) {
          const parentPath = `/${pathSegments.slice(0, i).join("/")}`;
          applyMiddlewaresForPath(parentPath, () => {});
        }
        applyMiddlewaresForPath("/", cb);
      });
    };

    applyPathAndParents(req.path, () => {
      next();
    });
  }

  get(path, handler) {
    this.routes.GET[path] = handler;
  }

  post(path, handler) {
    this.routes.POST[path] = handler;
  }

  put(path, handler) {
    this.routes.PUT[path] = handler;
  }

  delete(path, handler) {
    this.routes.DELETE[path] = handler;
  }

  use(pathOrHandler, handler) {
    if (typeof pathOrHandler === "function") {
      handler = pathOrHandler;
      pathOrHandler = "/";
    }
    if (!this.routes.use[pathOrHandler]) {
      this.routes.use[pathOrHandler] = [];
    }
    this.routes.use[pathOrHandler].push(handler);
  }

  #serveStatic(filePath, req, res) {
    if (!this.staticFolderPath) {
      throw new Error("Static path not set");
    }
    const fullPath = path.join(this.staticFolderPath, filePath);
    const extname = path.extname(fullPath).toLowerCase();
    const contentType = mime.getType(extname) || "application/octet-stream";

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
