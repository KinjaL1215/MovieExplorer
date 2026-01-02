function getmovie() {
   
    let movie = document.getElementById("movie").value.trim();

    if (!movie) {
        console.log("Please enter a movie name!");
        alert("Please enter a movie name!");
        return;
    }

    let apikey = "df5dde7";
    let URL = `https://www.omdbapi.com/?t=${encodeURIComponent(movie)}&apikey=${apikey}`;

    fetch(URL)
        .then(response => response.json())
        .then(data => {
            const movieBox = document.querySelector(".output");

            if (data.Response === "False") {
                alert("Movie not found");
                movieBox.innerHTML = "";
            } else {
                movieBox.innerHTML = `
                    <h2>${data.Title} (${data.Year})</h2>
                    <img src="${data.Poster}" width="100px">
                    <h3>Overview</h3>
                    <p>${data.Plot}</p>
                    <p><strong>Genre:</strong> ${data.Genre}</p>
                    <p><strong>Actors:</strong> ${data.Actors}</p>
                    <p><strong>IMDB Rating:</strong> ${data.imdbRating}</p>
                    <p><strong>Director:</strong> ${data.Director}</p>
                `;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Something went wrong. Please try again!");
        });
}

document.querySelector(".input-box button").addEventListener("click", getmovie);
