const API_KEY = "e861f02026cd129cf14d67a498015126"; // replace this later
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const moviesContainer = document.getElementById("moviesContainer");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const favoritesBtn = document.getElementById("favoritesBtn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 🌟 Fetch movies by category
async function fetchMovies(category = "popular") {
  toggleLoading(true);
  try {
    const { data } = await axios.get(`${BASE_URL}/movie/${category}`, {
      params: { api_key: API_KEY },
    });
    renderMovies(category === "latest" ? [data] : data.results);
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    toggleLoading(false);
  }
}

// 🔍 Search movies
async function searchMovies(query) {
  if (!query) return;
  toggleLoading(true);
  try {
    const { data } = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: API_KEY, query },
    });
    renderMovies(data.results);
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    toggleLoading(false);
  }
}

// 🖼️ Render movie cards (Netflix-style)
function renderMovies(movies) {
  if (!movies.length) {
    moviesContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">No movies found.</p>`;
    return;
  }

  moviesContainer.innerHTML = movies
    .map((movie) => {
      const imageUrl = movie.poster_path
        ? `${IMG_URL}/${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";
      const movieUrl = `https://www.themoviedb.org/movie/${movie.id}`;
      const rating = movie.vote_average || 0;
      const description = movie.overview || "No description available.";
      const releaseDate = movie.release_date || "N/A";

      return `
        <a
          href="${movieUrl}"
          target="_blank"
          class="relative block group overflow-hidden rounded-lg shadow-lg hover:scale-[1.03] transition-transform duration-300"
        >
          <img
            src="${imageUrl}"
            alt="${movie.title}"
            class="w-full h-96 object-cover"
          />
          <div
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
          </div>
        </a>
      `;
    })
    .join("");
}

// ❤️ Manage favorites (can be expanded later)
function toggleFavorite(id, title, poster) {
  const existing = favorites.find((m) => m.id === id);
  if (existing) {
    favorites = favorites.filter((m) => m.id !== id);
  } else {
    favorites.push({ id, title, poster });
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderMovies(favorites); // refresh if in Favorites view
}

// 🧭 Favorites button
favoritesBtn.addEventListener("click", () => {
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
document.querySelectorAll(".nav-btn").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    const category = e.target.dataset.category; // we need a prop name with "data-category"
    if (category) fetchMovies(category);
  })
);

// 🔍 Search event listeners
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  searchMovies(query);
});

// event when user type in search input then press enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies(searchInput.value.trim());
});

// 🧩 Init
fetchMovies("popular");
const navBtns = document.querySelectorAll(".nav-btn");

// Set default active button
navBtns.forEach((btn) => {
  if (btn.dataset.category === "popular") {
    btn.classList.remove("bg-gray-700");
    btn.classList.add("bg-blue-600");
  }
});
