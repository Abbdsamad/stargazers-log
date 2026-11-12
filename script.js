const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");
const repositorySearch = document.querySelector("#repository-search");
const languageFilter = document.querySelector("#language-filter");
const repositorySort = document.querySelector("#repository-sort");
let repositories = [];

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

function renderRepositories() {
  const searchTerm = repositorySearch.value.trim().toLowerCase();
  const selectedLanguage = languageFilter.value;
  const sortOrder = repositorySort.value;
  const filteredRepositories = repositories
    .filter((repository) => {
      const searchableText = [
        repository.name,
        repository.description,
        repository.language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        searchableText.includes(searchTerm) &&
        (!selectedLanguage || repository.language === selectedLanguage)
      );
    })
    .sort((first, second) => {
      if (sortOrder === "name") {
        return first.name.localeCompare(second.name);
      }

      const firstDate = Date.parse(`${first.starredAt || ""}T00:00:00Z`) || 0;
      const secondDate = Date.parse(`${second.starredAt || ""}T00:00:00Z`) || 0;
      return sortOrder === "oldest"
        ? firstDate - secondDate
        : secondDate - firstDate;
    });

  repositoryList.replaceChildren(...filteredRepositories.map(createRepositoryCard));

  if (filteredRepositories.length === 0) {
    listStatus.textContent = "No repositories match your search and filters.";
    return;
  }

  const count = filteredRepositories.length;
  const total = repositories.length;
  listStatus.textContent =
    count === total
      ? `${count} starred ${count === 1 ? "repository" : "repositories"}`
      : `Showing ${count} of ${total} starred repositories`;
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repositories (${response.status}).`);
    }

    repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    if (repositories.length === 0) {
      listStatus.textContent = "No starred repositories yet.";
      return;
    }

    const languages = [
      ...new Set(repositories.map(({ language }) => language).filter(Boolean)),
    ].sort((first, second) => first.localeCompare(second));
    languageFilter.append(
      ...languages.map((language) => {
        const option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        return option;
      }),
    );

    repositorySearch.disabled = false;
    languageFilter.disabled = false;
    repositorySort.disabled = false;
    renderRepositories();
  } catch (error) {
    console.error("Unable to load starred repositories:", error);
    listStatus.textContent = "Repositories couldn't be loaded. Please try again later.";
  }
}

repositorySearch.addEventListener("input", renderRepositories);
languageFilter.addEventListener("change", renderRepositories);
repositorySort.addEventListener("change", renderRepositories);

loadRepositories();
