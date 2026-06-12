// Movie Explorer JavaScript logic
document.addEventListener("DOMContentLoaded", () => {
    const movieInput = document.getElementById("movie");
    const searchBtn = document.getElementById("search-btn");
    const movieDisplay = document.getElementById("movieDisplay");
    const clearSearchBtn = document.getElementById("clear-search");
    const historyContainer = document.getElementById("history-container");
    const historyChips = document.getElementById("history-chips");
    const clearHistoryBtn = document.getElementById("clear-history-btn");
    const API_KEY = "df5dde7";
    const MAX_HISTORY = 5;
    // Initialize search history from localStorage
    let searchHistory = JSON.parse(localStorage.getItem("movieSearchHistory")) || [];
    // Render search history chips on load
    updateHistoryUI();
    // Toggle search clear button
    movieInput.addEventListener("input", () => {
        if (movieInput.value.trim().length > 0) {
            clearSearchBtn.style.display = "flex";
        } else {
            clearSearchBtn.style.display = "none";
        }
    });
    // Clear search input
    clearSearchBtn.addEventListener("click", () => {
        movieInput.value = "";
        clearSearchBtn.style.display = "none";
        movieInput.focus();
    });
    // Handle Search click
    searchBtn.addEventListener("click", () => {
        performSearch(movieInput.value.trim());
    });
    // Handle Enter key on input
    movieInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performSearch(movieInput.value.trim());
        }
    });
    // Handle suggestion tags clicking
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("suggestion-tag")) {
            const query = e.target.textContent;
            movieInput.value = query;
            clearSearchBtn.style.display = "flex";
            performSearch(query);
        }
    });
    // Handle search history chip clicking
    historyChips.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("history-chip")) {
            const query = e.target.dataset.query;
            movieInput.value = query;
            clearSearchBtn.style.display = "flex";
            performSearch(query);
        }
    });
    // Clear search history
    clearHistoryBtn.addEventListener("click", () => {
        searchHistory = [];
        localStorage.removeItem("movieSearchHistory");
        updateHistoryUI();
    });
    // Principal Search Function
    function performSearch(movieName) {
        if (!movieName) {
            showError("Input Required", "Please type a movie or show name before searching.");
            movieInput.focus();
            return;
        }
        // Show Skeleton Loader
        injectSkeletonLoader();
        const URL = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${API_KEY}`;
        fetch(URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response error");
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === "False") {
                    showError("No Results Found", `We couldn't find any listings for "${movieName}". Please double check your spelling.`);
                } else {
                    renderMovieCard(data);
                    saveToHistory(data.Title);
                }
            })
            .catch(error => {
                console.error("API Fetch Error:", error);
                showError("Connection Failed", "Unable to retrieve details. Please check your internet connection and try again.");
            });
    }
    // Save search query to history list
    function saveToHistory(title) {
        // Prevent duplicate title issues (case insensitive check)
        const existsIndex = searchHistory.findIndex(item => item.toLowerCase() === title.toLowerCase());
        if (existsIndex !== -1) {
            searchHistory.splice(existsIndex, 1);
        }
        // Add to front of history array
        searchHistory.unshift(title);
        // Cap size limit
        if (searchHistory.length > MAX_HISTORY) {
            searchHistory.pop();
        }
        localStorage.setItem("movieSearchHistory", JSON.stringify(searchHistory));
        updateHistoryUI();
    }
    // Update History component display
    function updateHistoryUI() {
        if (searchHistory.length === 0) {
            historyContainer.style.display = "none";
            historyChips.innerHTML = "";
            return;
        }
        historyContainer.style.display = "flex";
        historyChips.innerHTML = searchHistory
            .map(item => `<button class="history-chip" data-query="${item}">${item}</button>`)
            .join("");
    }
    // Inject loading skeleton structure
    function injectSkeletonLoader() {
        movieDisplay.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-poster skeleton-pulse"></div>
                <div class="skeleton-details">
                    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                        <div class="skeleton-title skeleton-pulse"></div>
                        <div class="skeleton-meta-row">
                            <div class="skeleton-meta-badge skeleton-pulse"></div>
                            <div class="skeleton-meta-badge skeleton-pulse"></div>
                            <div class="skeleton-meta-badge skeleton-pulse"></div>
                        </div>
                    </div>
                    <div class="skeleton-rating skeleton-pulse"></div>
                    <div class="skeleton-genre-row">
                        <div class="skeleton-genre-badge skeleton-pulse"></div>
                        <div class="skeleton-genre-badge skeleton-pulse"></div>
                        <div class="skeleton-genre-badge skeleton-pulse"></div>
                    </div>
                    <div class="skeleton-plot">
                        <div class="skeleton-text skeleton-plot-line-1 skeleton-pulse"></div>
                        <div class="skeleton-text skeleton-plot-line-2 skeleton-pulse"></div>
                        <div class="skeleton-text skeleton-plot-line-3 skeleton-pulse"></div>
                    </div>
                    <div class="skeleton-stats">
                        <div class="skeleton-stat-box skeleton-pulse"></div>
                        <div class="skeleton-stat-box skeleton-pulse"></div>
                    </div>
                </div>
            </div>
        `;
    }
    // Render detailed movie layout
    function renderMovieCard(movie) {
        // Poster Handling with Fallbacks
        const hasPoster = movie.Poster && movie.Poster !== "N/A";
        const posterHTML = hasPoster
            ? `<img src="${movie.Poster}" alt="${movie.Title} Poster" class="poster-img" loading="lazy">`
            : `
              <div class="fallback-poster">
                  <i class="fa-solid fa-film"></i>
                  <span>No Poster Available</span>
              </div>
            `;
        const ratedHTML = movie.Rated && movie.Rated !== "N/A"
            ? `<span class="meta-badge meta-badge-accent">${movie.Rated}</span>`
            : "";
        const runtimeHTML = movie.Runtime && movie.Runtime !== "N/A"
            ? `<span class="meta-badge">${movie.Runtime}</span>`
            : "";
        const yearHTML = movie.Year && movie.Year !== "N/A"
            ? `<span class="meta-badge">${movie.Year}</span>`
            : "";
        // Genres pills
        const genres = movie.Genre && movie.Genre !== "N/A" ? movie.Genre.split(", ") : [];
        const genreHTML = genres.length > 0
            ? genres.map(g => `<span class="genre-tag">${g}</span>`).join("")
            : "";
        // Parse IMDB Rating
        const imdbScore = parseFloat(movie.imdbRating);
        let ratingClass = "rating-mid";
        let hasValidRating = !isNaN(imdbScore);
        if (hasValidRating) {
            if (imdbScore >= 7.5) {
                ratingClass = "rating-high";
            } else if (imdbScore < 5.0) {
                ratingClass = "rating-low";
            }
        }
        // Fetch other ratings if present (Rotten Tomatoes, Metacritic)
        let rtRating = "N/A";
        let metaRating = "N/A";
        if (movie.Ratings && Array.isArray(movie.Ratings)) {
            const rtObj = movie.Ratings.find(r => r.Source === "Rotten Tomatoes");
            if (rtObj) rtRating = rtObj.Value;
            const metaObj = movie.Ratings.find(r => r.Source === "Metacritic");
            if (metaObj) metaRating = metaObj.Value;
        }
        // Rating Section HTML
        const ratingSectionHTML = hasValidRating
            ? `
            <div class="ratings-bar-section">
                <div class="rating-score-circle ${ratingClass}">
                    <span class="rating-num">${movie.imdbRating}</span>
                    <span class="rating-scale">/10</span>
                </div>
                <div class="rating-label-box">
                    <span class="rating-label-title">IMDb rating (based on ${movie.imdbVotes || "N/A"} votes)</span>
                    <div class="ratings-grid">
                        <span><i class="fa-solid fa-apple-whole"></i> RT: ${rtRating}</span>
                        <span><i class="fa-solid fa-circle-dot"></i> Metacritic: ${metaRating}</span>
                    </div>
                </div>
            </div>
            `
            : `
            <div class="ratings-bar-section">
                <div class="rating-score-circle rating-low">
                    <span class="rating-num">N/A</span>
                </div>
                <div class="rating-label-box">
                    <span class="rating-label-title">Ratings Not Available</span>
                </div>
            </div>
            `;
        // Render card
        movieDisplay.innerHTML = `
            <article class="movie-card">
                <div class="poster-container">
                    ${movie.Type && movie.Type !== "movie" ? `<span class="poster-badge">${movie.Type.toUpperCase()}</span>` : ""}
                    ${posterHTML}
                </div>
                <div class="details-container">
                    <div class="movie-header-details">
                        <h2 class="movie-title">${movie.Title}</h2>
                        <div class="movie-meta">
                            ${yearHTML}
                            ${ratedHTML}
                            ${runtimeHTML}
                        </div>
                    </div>
                    ${ratingSectionHTML}
                    <div class="genre-tags-list">
                        ${genreHTML}
                    </div>
                    <div class="plot-block">
                        <span class="section-label">Plot Outline</span>
                        <p class="plot-text">${movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "No synopsis details currently available."}</p>
                    </div>
                    <div class="movie-people-list">
                        <div class="people-item">
                            <span class="people-role">Director</span>
                            <span class="people-names">${movie.Director || "N/A"}</span>
                        </div>
                        <div class="people-item">
                            <span class="people-role">Writers</span>
                            <span class="people-names">${movie.Writer || "N/A"}</span>
                        </div>
                        <div class="people-item">
                            <span class="people-role">Starring</span>
                            <span class="people-names">${movie.Actors || "N/A"}</span>
                        </div>
                    </div>
                    <div class="movie-stats-grid">
                        <div class="stat-item">
                            <span class="section-label">Released Date</span>
                            <span class="stat-value">${movie.Released || "N/A"}</span>
                        </div>
                        <div class="stat-item">
                            <span class="section-label">Box Office</span>
                            <span class="stat-value">${movie.BoxOffice || "N/A"}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }
    // Display error messages nicely inside custom error states
    function showError(title, message) {
        movieDisplay.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-triangle-exclamation error-icon"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }
});