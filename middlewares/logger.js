let chalk;

(async () => {
    chalk = (await import("chalk")).default;
})();

// Logger middleware
function logger(req, res) {
  const methodColor = chalk.green(req.method);
  const pathColor = chalk.blue(req.path);
  
  // Apply color based on status code
  let statusColor;
  if (res.status >= 500) {
    statusColor = chalk.red(res.status);
  } else if (res.status >= 400) {
    statusColor = chalk.yellow(res.status);
  } else if (res.status >= 300) {
    statusColor = chalk.cyan(res.status);
  } else if (res.status >= 200) {
    statusColor = chalk.green(res.status);
  } else {
    statusColor = chalk.white(res.status);
  }

  console.log(`${methodColor} ${pathColor} ${statusColor} ${res.statusText}`);
}

module.exports = logger;
