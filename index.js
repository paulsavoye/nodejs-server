require("dotenv").config();

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;
const server = require("./controller");
const db = require("./db/db");

db.connectDb();

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
