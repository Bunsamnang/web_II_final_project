const API_KEY = "e861f02026cd129cf14d67a498015126";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("moviesContainer");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const favoritesNav = document.getElementById("favorites");

let currentPage = 1;
let totalPages = 1;
let currentCategory = "popular";
let isFetching = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

console.log("Favorites: ", favorites);

// 🌟 Fetch movies by category
async function fetchMovies(category = "popular", page = 1, append = false) {
  toggleLoading(true);
  isFetching = true;

  try {
    const { data } = await axios.get(`${BASE_URL}/movie/${category}`, {
      params: { api_key: API_KEY, page },
    });
    totalPages = data.total_pages;
    renderMovies(data.results, append);
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    toggleLoading(false);
    isFetching = false;
  }
}

// 🔍 Search movies
async function searchMovies(query, page = 1, append = false) {
  if (!query) return;
  toggleLoading(true);
  isFetching = true;

  try {
    const { data } = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: API_KEY, query, page },
    });
    totalPages = data.total_pages;
    renderMovies(data.results, append);
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    toggleLoading(false);
    isFetching = false;
  }
}

// 🖼️ Render movie cards
function renderMovies(movies, append = false) {
  if (!movies.length) {
    if (!append) {
      moviesContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">No movies found.</p>`;
    }
    return;
  }

  const html = movies
    .map((movie) => {
      const imageUrl = movie.poster_path
        ? `${IMG_URL}/${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";
      const movieUrl = `https://www.themoviedb.org/movie/${movie.id}`;
      const rating = movie.vote_average || 0;
      const description = movie.overview || "No description available.";
      const releaseDate = movie.release_date || "N/A";
      const isFav = favorites.some((f) => f.id === movie.id);

      return `
        <div class="relative group overflow-hidden rounded-lg shadow-lg hover:scale-[1.03] transition-transform duration-300">
          <img
            src="${imageUrl}"
            alt="${movie.title}"
            class="w-full h-96 object-cover"
          />

          <!-- ❤️ Favorite Button -->
          <button
            data-id="${movie.id}"
            data-title="${movie.title}"
            data-poster_path="${movie.poster_path}"
            data-overview="${description}"
            data-release_date="${releaseDate}"
            data-vote_average="${movie.vote_average}"
            class="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-all duration-200 cursor-pointer fav-btn"
          >
            ${isFav ? "❤️" : "🤍"}
          </button>

          <!-- Overlay -->
          <a
            href="${movieUrl}"
            target="_blank"
            class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white"
          >
            <h3 class="text-lg font-semibold mb-1">${movie.title}</h3>
            <div class="flex justify-between text-sm mb-1 text-gray-200">
              <p>${releaseDate}</p>
              <p>${rating.toFixed(1)} ⭐</p>
            </div>
            <p class="text-sm text-gray-300 line-clamp-3">
              ${
                description.length > 100
                  ? description.slice(0, 100) + "..."
                  : description
              }
            </p>
          </a>
        </div>
      `;
    })
    .join("");

  moviesContainer.innerHTML = append ? moviesContainer.innerHTML + html : html;
}

// ❤️ Favorites click (event delegation)
moviesContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  const movieData = {
    id: Number(btn.dataset.id),
    title: btn.dataset.title,
    poster_path: btn.dataset.poster_path,
    overview: btn.dataset.overview,
    release_date: btn.dataset.release_date,
    vote_average: Number(btn.dataset.vote_average),
  };

  toggleFavorite(movieData);

  // update button immediately
  btn.innerHTML = favorites.some((f) => f.id === movieData.id) ? "❤️" : "🤍";
});

// ❤️ Manage favorites
function toggleFavorite(movieData) {
  const existing = favorites.find((m) => m.id === movieData.id);
  if (existing) {
    favorites = favorites.filter((m) => m.id !== movieData.id);
  } else {
    // the latest favorites get show at the front
    favorites.unshift(movieData);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

  // re-render only if viewing favorites
  if (currentCategory === "favorites") {
    renderMovies(favorites);
  }
}

// 🧭 Favorites navigation
favoritesNav.addEventListener("click", () => {
  currentCategory = "favorites";
  currentPage = 1;
  renderMovies(favorites);
});

// ⏳ UI helpers
function toggleLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
}

function showError() {
  errorEl.classList.remove("hidden");
  setTimeout(() => errorEl.classList.add("hidden"), 3000);
}

// 🧭 Nav Buttons
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");

    const category = e.target.dataset.category;
    if (category) {
      currentCategory = category;
      currentPage = 1;
      moviesContainer.innerHTML = "";
      fetchMovies(category, currentPage);
    }
  });
});

// 🔍 Search
function doSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  currentCategory = "search";
  currentPage = 1;
  moviesContainer.innerHTML = "";
  searchMovies(query, currentPage);
  searchInput.value = "";
}

searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") doSearch();
});

// 🧩 Init
fetchMovies("popular");
document
  .querySelectorAll(".nav-btn")
  .forEach(
    (btn) => btn.dataset.category === "popular" && btn.classList.add("active")
  );

// ♾️ Infinite scroll
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
    !isFetching &&
    currentPage < totalPages
  ) {
    currentPage++;
    if (currentCategory === "search") {
      searchMovies(searchInput.value.trim(), currentPage, true);
    } else if (currentCategory === "favorites") {
      // nothing to fetch for favorites
    } else {
      fetchMovies(currentCategory, currentPage, true);
    }
  }
});
