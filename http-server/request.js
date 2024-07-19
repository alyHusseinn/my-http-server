class Request {
  constructor(rawRequest, socket) {
    const requestHeaders = rawRequest.split("\r\n");
    // first line is special
    const reqFirstLine = requestHeaders[0].split(" ");
    const headers = requestHeaders.reduce((acc, currentHeader) => {
      const [key, value] = currentHeader.split(": ");
      acc[key.toLocaleLowerCase().trim()] = value;
      return acc;
    }, {});

    this.method = reqFirstLine[0];
    this.path = reqFirstLine[1];
    this.headers = headers;
    this.httpVersion = reqFirstLine[2].split("/")[1];
    this.socket = socket;
  }
}

module.exports = Request;
