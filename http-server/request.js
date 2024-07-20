class Request {
  constructor(reqHeader, socket) {
    this.body;
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

  #parseBody(reqBuffer) {
    const headerEndIdx = reqBuffer.indexOf("\r\n\r\n");
    if (headerEndIdx !== -1 && this.headers["content-length"]) {
      const contentLength = parseInt(this.headers["content-length"]);
      if (reqBuffer.length >= headerEndIdx + 4 + contentLength) {
        const body = reqBuffer.subarray(
          headerEndIdx + 4,
          headerEndIdx + 4 + contentLength
        );
        // this.body = body.toString(); // Ensure the body is a string
        if(this.headers["content-type"] === "application/json"){
          this.body = JSON.parse(body.toString());
        }else{
            this.body = this.#parseUrlEncodedBody(body.toString());
      }
    }
  }
}

  #parseUrlEncodedBody(body) {
    return body.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      acc[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
      return acc;
    }, {});
  }
}

module.exports = Request;
