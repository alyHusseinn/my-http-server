class Request {
  constructor(reqHeader, socket) {
    this.method;
    this.path;
    this.headers;
    this.httpVersion;
    this.ip;
    this.socket = socket;

    this.#parseHeaders(reqHeader);

    // this.#parseBody(reqBody);
  }

  #parseHeaders(reqHeader) {
    const requestHeaders = reqHeader.split("\r\n");
    const reqFirstLine = requestHeaders[0].split(" ");
    this.headers = requestHeaders.reduce((acc, currentHeader) => {
      const [key, value] = currentHeader.split(": ");
      acc[key.toLocaleLowerCase().trim()] = value;
      return acc;
    }, {});

    this.path = reqFirstLine[1];
    this.method = reqFirstLine[0];
    this.httpVersion = reqFirstLine[2].split("/")[1];
    // get the ip address of the client
    this.ip = this.socket.remoteAddress.startsWith("::ffff:") // if ipv6 is used (ipv4 is mapped to ipv6)
      ? `${this.socket.remoteAddress.split("::ffff:")[1]}`
      : this.socket.remoteAddress;
  }
}

module.exports = Request;
