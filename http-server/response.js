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
    try {
      if (this.isChunked) {
        this.socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`);
      } else {
        this.socket.write(chunk);
      }
    } catch (error) {
      console.error("Error writing to socket:", error);
      this.socket.destroy(); // Properly close the socket in case of an error
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
    try {
      if (this.isChunked) {
        if (chunk) {
          this.socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`);
        } else {
          this.socket.end("0\r\n\r\n");
        }
      } else {
        this.socket.end(chunk);
      }
    } catch (error) {
      console.error("Error ending response:", error);
      this.socket.destroy(); // Properly close the socket in case of an error
    }
  }

  setHeader(key, value) {
    this.headers[key.toLowerCase()] = value;
  }

  #sendHeaders() {
    if (this.headersSent) return;
    this.headersSent = true;
    this.setHeader("date", new Date().toGMTString());
    try {
      this.socket.write(`HTTP/1.1 ${this.status} ${this.statusText}\r\n`);

      for (let key in this.headers) {
        this.socket.write(`${key}: ${this.headers[key]}\r\n`);
      }
      // Add the final \r\n that delimits the response headers from body
      this.socket.write(`\r\n`);
    } catch (error) {
      console.error("Error sending headers:", error);
      this.socket.destroy(); // Properly close the socket in case of an error
    }
  }

  setStatus(statusCode, statusText) {
    this.status = statusCode;
    this.statusText = statusText;
  }

  json(data) {
    if (this.headersSent) {
      throw new Error("Headers already sent. Cannot proceed.");
    }
    const json = Buffer.from(JSON.stringify(data)); // Use Buffer.from() instead of Buffer()
    this.setHeader("content-type", "application/json");
    this.setHeader("content-length", json.length);
    this.#sendHeaders();
    try {
      this.socket.write(json);
      this.socket.end();
    } catch (error) {
      console.error("Error sending JSON response:", error);
      this.socket.destroy(); // Properly close the socket in case of an error
    }
  }
}

module.exports = Response;
