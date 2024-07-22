class Request {
  constructor(reqHeader, socket) {
    this.method;
    this.path;
    this.headers;
    this.httpVersion;
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
    // }
  }
}

module.exports = Request;
