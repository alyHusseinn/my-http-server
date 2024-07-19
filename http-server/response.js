class Response {
  constructor(socket) {
    this.socket = socket;
    this.headers = { server: "my-server" };
    this.headersSent = false;
    this.isChunked = false;
    this.status = 200;
    this.statusText = "OK";
  }
  write(chunk) {
    if (!this.headersSent) {
      if (!this.headers["content-length"]) {
        this.isChunked = true;
        this.setHeader("transfer-encoding", "chunked");
      }
      this.#sendHeaders();
    }
    if (isChunked) {
      // chunk length in hex before the chunk data if the transfer-encoding is chunked
      this.socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`);
    } else {
      this.socket.write(chunk);
    }
  }

  end(chunk) {
    if (!this.headersSent) {
      if (!this.headers["content-length"]) {
        this.isChunked = true;
        this.setHeader("transfer-encoding", "chunked");
      }
      this.#sendHeaders();
    }
    if (this.isChunked) {
      // chunk length in hex before the chunk data if the transfer-encoding is chunked
      this.socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`);
      this.socket.end("0\r\n\r\n");
    } else {
      this.socket.end(chunk);
    }
  }

  setHeader(key, value) {
    this.headers[key.toLocaleLowerCase()] = value;
  }

  #sendHeaders() {
    if (this.headersSent) return;
    this.headersSent = true;
    this.setHeader("date", new Date().toGMTString());
    this.socket.write(`HTTP/1.1 ${this.status} ${this.statusText}\r\n`);

    for (let key in this.headers) {
      this.socket.write(`${key}: ${this.headers[key]}\r\n`);
    }
    // Add the final \r\n that delimits the response headers from body
    this.socket.write(`\r\n`);
  }

  setStatus(statusCode, statusText) {
    this.status = statusCode;
    this.statusText = statusText;
  }
  json(data) {
    if (this.headersSent) {
      throw new Error("Headers already sent Cannot proceed");
    }
    const json = Buffer(JSON.stringify(data));
    this.setHeader("content-type", "application/json");
    this.setHeader("content-length", json.length);
    this.#sendHeaders();
    this.socket.write(json);
    this.socket.end();
  }
}

module.exports = Response;
