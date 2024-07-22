const querystring = require('querystring');

function bodyParser(req, res, next) {
  req.body = {};
  const contentType = req.headers['content-type'] || '';
  const contentLength = parseInt(req.headers['content-length'], 10);
  const transferEncoding = req.headers['transfer-encoding'];

  let body = '';

  console.log(contentType)

  if(!contentType){
    return next();
  }

  // For fixed-length bodies
  if (!isNaN(contentLength)) {
    req.socket.on('data', (chunk) => {
      body += chunk.toString();

      // Check if the entire body has been received
      if (body.length >= contentLength) {
        req.socket.removeAllListeners('data');
        parseBody();
      }
    });
  } else if (transferEncoding === 'chunked') {
    // For chunked transfer encoding
    req.socket.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.socket.once('end', () => {
      parseBody();
    });
  } else {
    // Handle the case where neither content-length nor chunked encoding is specified
    req.socket.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.socket.once('end', () => {
      parseBody();
    });
  }

  // Function to parse the body based on content type
  function parseBody() {
    try {
      if (contentType.includes('application/json')) {
        console.log(body)
        req.body = JSON.parse(body);
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        req.body = querystring.parse(body);
      } else {
        req.body = body; // Fallback for other content types
      }
      next(); // Proceed to the next middleware or route handler
    } catch (e) {
      res.setStatus(400, 'Bad Request');
      res.end('Invalid body');
    }
  }

  // Handle potential errors with the data stream
  req.socket.on('error', (err) => {
    console.error('Socket error:', err);
    res.setStatus(500, 'Internal Server Error');
    res.end('Internal Server Error');
  });
  // next()
}

module.exports = bodyParser;
