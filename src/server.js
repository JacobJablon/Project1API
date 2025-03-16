const http = require('http');
const query = require('querystring');

const { getIndex, getCSS, getDocumentation } = require('./htmlResponses.js');
const {
  getMovies, getActor, getMoviesByReviewRating, getMoviesByRuntime, addMovie, editStatus, notFound,
} = require('./dataResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    handler(request, response);
  });
};

const handleGet = (request, response, parsedUrl, params) => {
  if (parsedUrl.pathname === '/') {
    getIndex(request, response);
  } else if (parsedUrl.pathname === '/client.html') {
    getIndex(request, response);
  } else if (parsedUrl.pathname === '/documentation.html') {
    getDocumentation(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    getCSS(request, response);
  } else if (parsedUrl.pathname === '/getMovies') {
    getMovies(request, response, params);
  } else if (parsedUrl.pathname === '/getActor') {
    getActor(request, response, params);
  } else if (parsedUrl.pathname === '/getMoviesByReviewRating') {
    getMoviesByReviewRating(request, response, params);
  } else if (parsedUrl.pathname === '/getMoviesByRuntime') {
    getMoviesByRuntime(request, response, params);
  } else {
    notFound(request, response);
  }
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addMovie') {
    parseBody(request, response, addMovie);
  } else if (parsedUrl.pathname === '/editStatus') {
    parseBody(request, response, editStatus);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  const params = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl, params);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
