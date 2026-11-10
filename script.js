const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

function createRepositoryCard(repository) {
  const item = document.createElement("li");
  item.className = "repository-card";

  const heading = document.createElement("h2");
  const link = document.createElement("a");
  link.href = repository.url;
  link.textContent = repository.name;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  heading.append(link);

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repository.description;

  const details = document.createElement("p");
  details.className = "repository-details";

  if (repository.language) {
    const language = document.createElement("span");
    language.className = "language";
    language.textContent = repository.language;
    details.append(language);
  }

  if (repository.starredAt) {
    const date = document.createElement("span");
    const parsedDate = new Date(`${repository.starredAt}T00:00:00`);
    date.textContent = `Starred ${parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
    details.append(date);
  }

  item.append(heading, description, details);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repositories (${response.status}).`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    if (repositories.length === 0) {
      listStatus.textContent = "No starred repositories yet.";
      return;
    }

    repositoryList.replaceChildren(...repositories.map(createRepositoryCard));
    listStatus.textContent = `${repositories.length} starred ${
      repositories.length === 1 ? "repository" : "repositories"
    }`;
  } catch (error) {
    console.error("Unable to load starred repositories:", error);
    listStatus.textContent = "Repositories couldn't be loaded. Please try again later.";
  }
}

loadRepositories();
