
# Native NodeJS Blog CMS

Native NodeJS headless blog CMS (without express). The CMS have a public route to get articles and its author. One must be able to authenticate, and, while being authenticated, post articles.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.
```sh
$ git clone https://github.com/paulsavoye/nodejs_server.git
$ cd nodejs_server
$ npm install
$ npm start
```

Make sure you exported HOSTNAME, DB_URL and PORT environement variables or created an env file like below.

**`.env`**
```sh
HOSTNAME=localhost
DB_URL="mongodb://localhost:27017/nodejs_server"
PORT=8080
```

The server should now be running on  [localhost:YOUR_PORT](http://localhost/YOUR_PORT).
