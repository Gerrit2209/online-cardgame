const http = require("http");
const host = "http://ec2-18-193-150-60.eu-central-1.compute.amazonaws.com";
const port = 8000;
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("My first server!");
};
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
