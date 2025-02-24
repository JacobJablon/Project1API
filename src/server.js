const http = require('http');
const url = require('url');
const query = require('querystring');

const { getIndex, getCSS } = require('./htmlResponses.js');
const { getMovies, getActor, getMoviesByReviewRating, getMoviesByRunTime, addMovie, editStatus, notFound } = require('./dataResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    '/': getIndex,
    '/style.css': getCSS,
    '/getMovies': getMovies,
    '/getActor': getActor,
    '/getMoviesByReviewRating': getMoviesByReviewRating,
    '/getMoviesByRunTime': getMoviesByRunTime,
    '/addMovie': addMovie,
    '/editStatus': editStatus,
    '/notFound': notFound,
    notFound: notFound
};

const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);
    const params = query.parse(parsedUrl.query);

    if (urlStruct[parsedUrl.pathname]) {
        return urlStruct[parsedUrl.pathname](request, response, params);
    } else {
        return urlStruct.notFound(request, response);
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1: ${port}`);
});