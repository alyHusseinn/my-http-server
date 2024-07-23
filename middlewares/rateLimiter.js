let window = {};
function rateLimiter({ windowSize = 1000, maxRequests = 10 } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;

    if(!window[key]) {
      window[key] = [];
    }

    // remove older requests
    window[key] = window[key].filter((time) => time > now - windowSize);
    if(window[key].length >= maxRequests) {
        res.setHeader("x-ratelimit-limit", maxRequests);
        res.setHeader("x-ratelimit-remaining", 0);
        res.setHeader("x-ratelimit-reset", now + windowSize);

        res.setStatus(429, "Too Many Requests");
        res.end("Too Many Requests");

        return;
    } else {
        window[key].push(now);
        res.setHeader("x-ratelimit-limit", maxRequests);
        res.setHeader("x-ratelimit-remaining", maxRequests - window[key].length);
        next();
    }
  };
}

module.exports = rateLimiter;
