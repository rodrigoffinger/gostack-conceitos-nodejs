const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

let reqCount = 0;

app.use(logRequests);

function logRequests(req, res, next) {
  console.time("Request");

  reqCount++;
  console.log(
    `Request Count: ${reqCount}; HTTP Method: ${req.method}; URL: ${req.url}`
  );

  next();

  console.timeEnd("Request");
}

function validateRepositoryId(req, res, next) {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid repository ID." });
  }

  next();
}

function checkRepositoryTitleExists(req, res, next) {
  if (!req.body.title) {
    return res.status(400).json({ error: "Repository title is required" });
  }

  return next();
}

function checkRepositoryInArray(req, res, next) {
  const { id } = req.params;
  const repository = repositories.find((repository) => repository.id === id);

  if (!repository) {
    return res.status(400).json({ error: "Repository does not exists" });
  }

  req.repository = repository;

  return next();
}

function checkRepositoryExistsInArray(req, res, next) {
  const { id } = req.params;
  const repository = repositories.find((repository) => repository.id === id);

  if (repository) {
    return res.status(400).json({ error: "Repository already exists" });
  }

  req.repository = repository;

  return next();
}

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
    ? repositories.filter((repository) => repository.title.includes(title))
    : repositories;

  return response.json(results);
});

app.post(
  "/repositories",
  checkRepositoryTitleExists,
  checkRepositoryExistsInArray,
  (request, response) => {
    const { title, url, techs } = request.body;

    var repository = { id: uuid(), title, url, techs, likes: 0 };

    repositories.push(repository);

    return response.json(repository);
  }
);

app.put(
  "/repositories/:id",
  validateRepositoryId,
  checkRepositoryInArray,
  (request, response) => {
    const { id } = request.params;
    const { title, url, techs } = request.body;

    const repositoryIndex = repositories.findIndex(
      (repository) => repository.id === id
    );

    const { likes } = repositories[repositoryIndex];

    const repository = {
      id,
      title,
      url,
      techs,
      likes,
    };

    repositories[repositoryIndex] = repository;

    return response.json(repository);
  }
);

app.delete(
  "/repositories/:id",
  validateRepositoryId,
  checkRepositoryInArray,
  (request, response) => {
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(
      (repository) => repository.id === id
    );

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
  }
);

app.post(
  "/repositories/:id/like",
  validateRepositoryId,
  checkRepositoryInArray,
  (request, response) => {
    const { id } = request.params;
    console.log("Id a incrementar like: " + id);
    const repositoryIndex = repositories.findIndex(
      (repository) => repository.id === id
    );

    repositories[repositoryIndex].likes++;

    return response.json(repositories[repositoryIndex]);
  }
);

module.exports = app;
