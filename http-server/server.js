const net = require("net");
const Request = require("./request");
const Response = require("./response");

class Server {
  constructor() {
    this.server = net.createServer(this.#handleConnection.bind(this));
    // this.socket;
    this.request;
    this.response;
    this.routes = {
      GET: {},
      POST: {},
      use: {},
    };
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  #handleConnection(socket) {
    socket.once("readable", () => {
      // buffer hold the incoming data
      try {
        let reqBuffer = Buffer.alloc(0);
        let buf;

        while ((buf = socket.read()) !== null) {
          reqBuffer = Buffer.concat([reqBuffer, buf]);
          // Check if we've reached \r\n\r\n, indicating end of header
          // const headerEndIdx = reqBuffer.indexOf("\r\n\r\n");
          // if (headerEndIdx !== -1) {
          //   const remainingData = reqBuffer.subarray(headerEndIdx + 4);
          //   console.log(remainingData.toString());
          //   reqHeader = reqBuffer.subarray(0, headerEndIdx).toString();
          //   // push the reminaing data back to the socket
          //   socket.unshift(remainingData);
          //   break;
          // }
        }

        if (reqBuffer) {
          this.request = new Request(reqBuffer, socket);
          this.response = new Response(socket);

          const routeHandler =
            this.routes[this.request.method]?.[this.request.path];
          if (routeHandler) {
            for (let path in this.routes.use) {
              this.routes.use[path](this.request, this.response);
            }
            routeHandler(this.request, this.response);
          } else {
            this.response.setStatus(404, "Not Found");
            this.response.end("404 Not Found");
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

  //

  route(method, path, handler) {
    this.routes[method][path] = handler;
  }

  get(path, handler) {
    this.routes["GET"][path] = handler;
  }

  post(path, handler) {
    this.routes["POST"][path] = handler;
  }

  use(path, handler) {
    this.routes.use[path] = handler;
  }
}

module.exports = Server;
