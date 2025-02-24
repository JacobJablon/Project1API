const fs = require('fs');

const mcuMovies = fs.readFileSync("./datasets/mcu-movies-data.json");

const mcuMoviesJSON = JSON.parse(mcuMovies);

const respondData = (request, response, status, object) => {
    response.writeHead(status, { 'Content-Type': "application/json" });
    if (request.method !== "HEAD") {
        response.write(JSON.stringify(object));
    }
    response.end();
};

const getMovies = (request, response) => {
    //will return all info on a movie

    return respondData(request, response, 200, mcuMoviesJSON);
};

const getActor = (request, response) => {
    //will return the movie titles along with their release dates,
    //movie ratings, and review ratings for each movie an actor is in
    let responseData = mcuMoviesJSON.map(object => ({
        "Title": object.Title,
        "Release Date": object["Release Date"],
        "Movie Rating": object["Movie Rating"],
        "Review Rating": object["Review Rating"]
    }));

    return respondData(request, response, 200, responseData);
};

const getMoviesByReviewRating = (request, response) => {
    let respondData;
    if (request.reviewRatingGeaterOrLess == "<") {
        responseData = mcuMovies.filter(object => object["Review Rating"] < request.reviewRatingNum)
    } else {
        responseData = mcuMovies.filter(object => object["Review Rating"] > request.reviewRatingNum)
    }

    return respondData(request, response, 200, responseData);
};

const getMoviesByRunTime = (request, response) => {
    let respondData;
    if (request.runTimeGreaterOrLess == "<") {
        responseData = mcuMovies.filter(object => object["Movie Run Time"] < request.runTimeMins)
    } else {
        responseData = mcuMovies.filter(object => object["Movie Run Time"] > request.runTimeMins)
    }

    return respondData(request, response, 200, responseData);
}

const addMovie = (request, response) => {
    

    return respondData(request, response, 200, responseData);
}

const editStatus = (request, response) => {
    const responseData = {
        message: "A get request for this page has not been implemented yet. Check again later for updated content.",
        id: "notImplemented"
    };

    return respondData(request, response, 200, responseData);
}

const notFound = (request, response) => {
    const responseData = {
        message: "The page you are looking for was not found.",
        id: "notFound"
    };

    return respondData(request, response, 404, responseData);
}

module.exports = {
    getMovies,
    getActor,
    getMoviesByReviewRating,
    getMoviesByRunTime,
    addMovie,
    editStatus,
    notFound
};