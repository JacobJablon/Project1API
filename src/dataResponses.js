const fs = require('fs');

const mcuMovies = fs.readFileSync('./datasets/mcu-movies-data.json');
const mcuMoviesJSON = JSON.parse(mcuMovies);

const respondData = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

const getMovies = (request, response, params) => {
  // will return all info on a movie
  let responseData = mcuMoviesJSON;

  // The following if statements check to see if certain parameters were given
  // and if the parameters match data from the mcuMoviesJSON object, filtering the data
  if (params.id) {
    responseData = responseData.filter((object) => object.Id === Number(params.id));
  }
  if (params.title) {
    // uses toLowerCase() so title parameter doesn't need to be case sensitive
    // uses includes() so title parameter doesn't need to be the full title
    responseData = responseData.filter((object) => object.Title.toLowerCase()
      .includes(params.title.toLowerCase()));
  }
  if (params.actor) {
    // uses toLowerCase() so actor parameter doesn't need to be case sensitive
    // uses some() to search through the elements (individual actors) of the cast array
    // uses includes() so actor parameter doesn't need to be the full name of the actor
    responseData = responseData.filter((object) => object.Cast
      .some((castMember) => castMember.toLowerCase()
        .includes(params.actor.toLowerCase())));
  }
  if (params.director) {
    // uses toLowerCase() so director parameter doesn't need to be case sensitive
    // uses some() to search through the elements (individual directors) of the directors array
    // uses includes() so director parameter doesn't need to be the full name of the director
    responseData = responseData.filter((object) => object.Director
      .some((director) => director.toLowerCase()
        .includes(params.director.toLowerCase())));
  }
  if (params.year) {
    // uses includes() because the mcuMoviesJSON object has release dates not just years
    responseData = responseData.filter((object) => object['Release Date'].includes(params.year));
  }

  return respondData(request, response, 200, responseData);
};

const getActor = (request, response, params) => {
  // will return the movie titles along with their release dates,
  // movie ratings, and review ratings for each movie an actor is in
  let responseData = {
    error: 'Actor is required.',
  };

  // checks to see if actor parameter was given
  if (!params.actor) {
    responseData.id = 'getActorMissingParam';

    return respondData(request, response, 400, responseData);
  }

  // maps mcuMoviesJSON so that there is only specific key value pairs
  // are provided for each movie object in responseData
  responseData = mcuMoviesJSON.map((object) => ({
    Title: object.Title,
    Cast: object.Cast,
    'Release Date': object['Release Date'],
    'Movie Rating': object['Movie Rating'],
    'Review Rating': object['Review Rating'],
  }));

  // uses toLowerCase() so actor parameter doesn't need to be case sensitive
  // uses some() to search through the elements (individual actors) of the cast array
  // uses includes() so actor parameter doesn't need to be the full name of the actor
  responseData = responseData.filter((object) => object.Cast
    .some((castMember) => castMember.toLowerCase()
      .includes(params.actor.toLowerCase())));

  // checks if there are any movies that match the provided parameters
  if (responseData.length === 0) {
    responseData = {
      error: `No actor with name: ${params.actor}`,
      id: 'actorNotFound',
    };

    return respondData(request, response, 404, responseData);
  }

  return respondData(request, response, 200, responseData);
};

const getMoviesByReviewRating = (request, response, params) => {
  // will return movie titles, review ratings, runtimes, release date,
  // and parental guidline ratings
  let responseData = {
    error: 'Both operator and rating are required.',
  };

  // checks to see if greaterOrLess and rating parameters were given
  if (!params.greaterOrLess || !params.rating) {
    responseData.id = 'getMoviesByReviewRatingMissingParams';

    return respondData(request, response, 400, responseData);
  }

  // maps mcuMoviesJSON so that there is only specific key value pairs
  // are provided for each movie object in responseData
  responseData = mcuMoviesJSON.map((object) => ({
    Title: object.Title,
    'Review Rating': object['Review Rating'],
    'Movie Run Time': object['Movie Run Time'],
    'Release Date': object['Release Date'],
    'Movie Rating': object['Movie Rating'],
  }));

  // checks if greaterOrLess parameter is '>' or '<'
  if (params.greaterOrLess === '>') {
    responseData = responseData.filter((object) => object['Review Rating'] > params.rating);
  } else {
    // also filters out movies that have no review rating by ensuring it's greater than 0
    responseData = responseData.filter((object) => object['Review Rating'] < params.rating && object['Review Rating'] > 0);
  }

  // checks if there are any movies that match the provided parameters
  if (responseData.length === 0) {
    responseData = {
      error: 'No movie with those review rating parameters',
      id: 'movieNotFound',
    };

    return respondData(request, response, 404, responseData);
  }

  return respondData(request, response, 200, responseData);
};

const getMoviesByRuntime = (request, response, params) => {
  // will return movie titles, runtimes, review ratings, release date,
  // and parental guidline ratings
  let responseData = {
    error: 'Both operator and rating are required.',
  };

  // checks to see if greaterOrLess and runtime parameters were given
  if (!params.greaterOrLess || !params.runtime) {
    responseData.id = 'getMoviesByRuntimeMissingParams';

    return respondData(request, response, 400, responseData);
  }

  // maps mcuMoviesJSON so that there is only specific key value pairs
  // are provided for each movie object in responseData
  responseData = mcuMoviesJSON.map((object) => ({
    Title: object.Title,
    'Movie Run Time': object['Movie Run Time'],
    'Review Rating': object['Review Rating'],
    'Release Date': object['Release Date'],
    'Movie Rating': object['Movie Rating'],
  }));

  // checks if greaterOrLess parameter is '>' or '<'
  if (params.greaterOrLess === '>') {
    responseData = responseData.filter((object) => Number(object['Movie Run Time'].replace(' min', '')) > params.runtime);
  } else {
    // also filters out movies that have no runtime by ensuring it's greater than 0
    responseData = responseData.filter((object) => Number(object['Movie Run Time'].replace(' min', '')) < params.runtime && Number(object['Movie Run Time'].replace(' min', '')) > 0);
  }

  // checks if there are any movies that match the provided parameters
  if (responseData.length === 0) {
    responseData = {
      error: 'No movie with those runtime parameters',
      id: 'movieNotFound',
    };

    return respondData(request, response, 404, responseData);
  }

  return respondData(request, response, 200, responseData);
};

const addMovie = (request, response) => {
  // adds a movie and all of its data to the mcuMoviesJSON array
  let responseData = {
    error: 'All fields are required.',
  };

  const {
    title, phase, genres, release, director, screenwriter,
    producer, cast, plot, language, filminglocation, status, movierating,
    reviewrating, runtime, budget, boxoffice,
  } = request.body;

  // checks to see if all parameters were given
  if (!title || !phase || !genres || !release || !director || !screenwriter
        || !producer || !cast || !plot || !language || !filminglocation || !status
        || !movierating || !reviewrating || !runtime || !budget || !boxoffice) {
    responseData.id = 'addMovieMissingParams';

    return respondData(request, response, 400, responseData);
  }

  // creates newMovie object and changes the values of the given parameters if needed so they
  // match the type and format of the values already in the mcuMoviesJSON object
  const newMovie = {
    Id: Number(mcuMoviesJSON.slice(-1)[0].Id + 1),
    Title: title,
    Phase: phase,
    Genres: genres.split(','),
    'Release Date': `${release.split('-')[2]}-${release.split('-')[1]}-${release.split('-')[0]}`,
    Director: director.split(','),
    ScreenWriter: screenwriter.split(','),
    Producer: producer.split(','),
    Cast: cast.split(','),
    Plot: plot,
    Language: language.split(','),
    'Filming Locations': filminglocation,
    Status: status,
    'Movie Rating': movierating,
    'Review Rating': Number(reviewrating),
    'Movie Run Time': `${runtime} min`,
    Budget: Number(budget),
    'Box office': Number(boxoffice),
  };

  // adds the newMovie object to the mcuMoviesJSON array
  mcuMoviesJSON.push(newMovie);

  responseData = newMovie;

  return respondData(request, response, 201, responseData);
};

const editStatus = (request, response) => {
  // edits an existing movie by finding it by its id and then gives it a new status
  let responseData = {
    error: 'Both id and status are required.',
  };

  const { id, status } = request.body;

  // checks to see if id and status parameters were given
  if (!id || !status) {
    responseData.id = 'editStatusMissingParams';

    return respondData(request, response, 400, responseData);
  }

  // filters mcuMoviesJSON array to check if any movies have
  // an id that matches the given id parameter
  if (mcuMoviesJSON.filter((object) => object.Id === Number(id)).length === 0) {
    responseData = {
      error: `No movie has id: ${id}`,
      id: 'idNotFound',
    };

    return respondData(request, response, 404, responseData);
  }

  // finds the movie object with an id that matches the given id parameter
  // and sets its status to the given status parameter
  mcuMoviesJSON[id - 1].Status = status;

  return respondData(request, response, 204, {});
};

const notFound = (request, response) => {
  const responseData = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  return respondData(request, response, 404, responseData);
};

module.exports = {
  getMovies,
  getActor,
  getMoviesByReviewRating,
  getMoviesByRuntime,
  addMovie,
  editStatus,
  notFound,
};
