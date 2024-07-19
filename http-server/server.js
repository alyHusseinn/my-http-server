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
      let reqBuffer = Buffer.alloc(0);
      let reqHeader;
      let buf;

      while ((buf = socket.read()) !== null) {
        reqBuffer = Buffer.concat([reqBuffer, buf]);
        // Check if we've reached \r\n\r\n, indicating end of header
        const headerEndIdx = reqBuffer.indexOf("\r\n\r\n");
        if (headerEndIdx !== -1) {
          const remainingData = reqBuffer.subarray(headerEndIdx + 4);
          reqHeader = reqBuffer.subarray(0, headerEndIdx).toString();
          // push the reminaing data back to the socket
          socket.unshift(remainingData);
          break;
        }
      }

      this.request = new Request(reqHeader, socket);
      this.response = new Response(socket);

      if (this.routes[this.request.method][this.request.path]) {
        // call all the handlers use before the route handler
        for (let path in this.routes.use) {
          this.routes.use[path](this.request, this.response);
        }
        this.routes[this.request.method][this.request.path](
          this.request,
          this.response
        );
      } else {
        this.response.end("Not Found");
      }
    });

    // socket.on("error", (err) => {
    //   console.error("Socket error:", err);
    // });
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
