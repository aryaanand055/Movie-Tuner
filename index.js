const API_URL_DISCOVER_MOVIES = 'https://api.themoviedb.org/3/discover/movie?api_key=bf7af8534242a2979c7554f3260e667f',
    API_URL_DISCOVER_TV_SHOWS = "https://api.themoviedb.org/3/discover/tv?api_key=bf7af8534242a2979c7554f3260e667f",
    IMG_PATH = 'https://image.tmdb.org/t/p/w1280',
    SEARCH_API = 'https://api.themoviedb.org/3/search/multi?api_key=bf7af8534242a2979c7554f3260e667f&&query=',
    searchBtn = document.getElementById("search"),
    sidebar = document.getElementById("sidebar"),
    fullscreenSidebar = document.getElementById("fullScreenSidebar");
let sidebarData = null;
document.getElementById("form").addEventListener("submit", (event) => {
    event.preventDefault()
})

function eventListeners() {
    document.addEventListener("click", clickEvent);
    searchBtn.addEventListener("keyup", searchMovies)
}

//Fetching Functions
async function getMovies(url, filter = "&sort_by=popularity.desc") {
    let newURL = url.concat(filter);
    const res = await fetch(newURL)
    const data = await res.json()
    results = data.results;
    return results;
}
async function getTvShows(url, filter = "&sort_by=popularity.desc") {
    let newURL = url.concat(filter);
    const res = await fetch(newURL)
    const data = await res.json()
    results = data.results;
    return results;
}
async function getMovieDetails(id) {
    let detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=bf7af8534242a2979c7554f3260e667f&language=en-US`;
    let videoUrl = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=bf7af8534242a2979c7554f3260e667f&language=en-US`
    const responseOfDetails = await fetch(detailsUrl);
    const dataOfDetails = await responseOfDetails.json();
    const responseOfVideo = await fetch(videoUrl);
    const dataOfVideo = await responseOfVideo.json();
    return {
        details: dataOfDetails,
        video: dataOfVideo
    }
}

async function getTVDetails(id) {
    let detailsUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=bf7af8534242a2979c7554f3260e667f`;
    const responseOfDetails = await fetch(detailsUrl);
    const dataOfDetails = await responseOfDetails.json();
    return dataOfDetails
}

async function searchNGetMovies(word) {
    const res = await fetch(SEARCH_API.concat(word));
    const data = await res.json();
    return data;
}

//Other Functions
function searchMovies(e) {
    if (e.key == "Enter") {
        searchNGetMovies(searchBtn.value).then(d => {
            getMovieDetails(d.results[0].id).then(data => {
                document.querySelectorAll(".contentCard").forEach(i => {
                    i.remove();
                });
                showMovieDetails(data.details, "fullScreen");
            })
        })

    } else {
        if (searchBtn.value !== "") {
            searchNGetMovies(searchBtn.value).then(d => {
                showMovies(d.results);
                showHide("hide", "miniNavbar");

            })
        } else {
            getMovies(API_URL_DISCOVER_MOVIES).then(data => {
                showMovies(data);
                showHide("show", "miniNavbar")
            })
        }
    }
}


function showTVShows(content) {
    console.log(content)
    sidebarData = null;
    showHide("hide", "fullScreenSidebar");
    showHide("hide", "sidebar");
    document.querySelectorAll(".contentCard").forEach(i => {
        i.remove();
    });
    content.forEach((cnt) => {
        const tvElement = document.createElement('div')
        tvElement.classList.add(`contentCard`)
        tvElement.classList.add(`tv`)
        tvElement.id = cnt.id;

        tvElement.innerHTML = `
            <img src="${IMG_PATH + cnt.poster_path}" alt="${cnt.original_name}">
            <div class="movie-info">
          <h3>${cnt.original_name}</h3>
          <span class="${getClassByRate(cnt.vote_average)}">${cnt.vote_average}</span>
            </div>
            <div class="overview">
          <h3>Overview</h3>
          ${cnt.overview}
        </div>`
        main.appendChild(tvElement)
    })

}


function showMovies(content) {
    if (content.length === 1) {
        let mainItem = document.getElementsByClassName("contentCard")[0];
        getMovieDetails(content[0].id).then(details => {
            main.innerHTML = ''
            showMovieDetails(details.details, "fullScreen");
        })
    } else {
        sidebarData = null;
        showHide("hide", "fullScreenSidebar");
        showHide("hide", "sidebar");
        document.querySelectorAll(".contentCard").forEach(i => {
            i.remove();
        });
        content.forEach((cnt) => {
            if (cnt.media_type !== "person" && cnt.media_type !== "tv") {
                const movieElement = document.createElement('div')
                movieElement.classList.add(`movie`)
                movieElement.classList.add(`contentCard`)
                movieElement.id = cnt.id;

                movieElement.innerHTML = `
            <img src="${IMG_PATH + cnt.poster_path}" alt="${cnt.title}">
            <div class="movie-info">
          <h3>${cnt.title}</h3>
          <span class="${getClassByRate(cnt.vote_average)}">${cnt.vote_average}</span>
            </div>
            <div class="overview">
          <h3>Overview</h3>
          ${cnt.overview}
        </div>
        `
                main.appendChild(movieElement);

            } else if (cnt.media_type === "tv") {
                const tvElement = document.createElement('div')
                tvElement.classList.add(`contentCard`)
                tvElement.classList.add(`tv`)
                tvElement.id = cnt.id;

                tvElement.innerHTML = `
            <img src="${IMG_PATH + cnt.poster_path}" alt="${cnt.original_name}">
            <div class="movie-info">
          <h3>${cnt.original_name}</h3>
          <span class="${getClassByRate(cnt.vote_average)}">${cnt.vote_average}</span>
            </div>
            <div class="overview">
          <h3>Overview</h3>
          ${cnt.overview}
        </div>`
                main.appendChild(tvElement)
            } else if (cnt.media_type === "person") {
                //Persons here
            }


        })

    }
}

function showMovieDetails(movie, criteria = "sideBar") {
    if (criteria === "sideBar") {

        sidebar.innerHTML = "<div class=\"lds-facebook\"><div></div><div></div><div></div></div>"
        let arr = [],
            bud = "",
            arr_pr_co = [];

        sidebar.style.display = "block"
        movie.genres.forEach(data => {
            arr.push(data.name)
        })
        movie.production_companies.forEach(data => {
            arr_pr_co.push(data.name)
        })

        if (movie.budget === 0) {
            bud = "Not Provided"
        } else {
            bud = `${movie.budget} $`;
        }
        //    console.log(movie)
        sidebar.innerHTML = ` 
  
      
       <div class="tooltip">
          <img src="${IMG_PATH + movie.poster_path}" alt="Picture">
           <i class="fa fa-close sidebar-close-icon" style="font-size:24px"></i>
       </div>
        <div class="sidebar-movie-info" id="sidebar-${movie.id}">
      
            <h2 title="Home Page"><a href="${movie.homepage}" target="_blank">${movie.original_title}</a></h2>
            <span class = "${getClassByRate(movie.vote_average)}">${movie.vote_average}</span>

        </div>
          
        <div class="sidebar-movie-info"  id="sidebar-tagline" style="text-align: center;">
            <h4 class="sidebar-tagline">${movie.tagline}</h4>
        </div>

        <div class="sidebar-overview sidebar-info">
            <h3>Overview</h3>
          ${movie.overview}</div>
          <div class="sidebar-production-companies sidebar-info">
          <h4>Production Companies</h4>
          <ul id="ul-production-companies">
          
          </ul>
          </div>
        <div class="sidebar-genres sidebar-info">
            <h4>Genres</h4>
            <ul id="ulSidebar">
           
            </ul>
        </div>
        <div class="sidebar-budget sidebar-info" id="sidebar-budget">
            <h4>Budget</h4>${bud}</div>
       <!-- <div class="sidebar-videos sidebar-info"><h4>Trailers and More</h4></div>  --> `

        let list = document.getElementById("ulSidebar");
        arr.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li)
        })
        let list_production_companies = document.getElementById("ul-production-companies");
        arr_pr_co.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            list_production_companies.appendChild(li)
        })
        if (movie.tagline === "") {
            document.getElementById("sidebar-tagline").style.display = "none";
        }
        if (bud == "Not Provided") {
            document.querySelector("#sidebar-budget").style.display = "none";
        }

        setStickySideBar();
    } else if (criteria === "fullScreen") {
        showHide("hide", "miniNavbar")
        let arr = [],
            bud = "",
            arr_pr_co = [];

        movie.genres.forEach(data => {
            arr.push(data.name)
        })
        movie.production_companies.forEach(data => {
            arr_pr_co.push(data.name)
        })

        if (movie.budget === 0) {
            bud = "Not Provided"
        } else {
            bud = `${movie.budget} $`;
        }
        fullscreenSidebar.innerHTML = ` 
        <h3>${movie.title}</h3>
        <div class="sidebar-image">
            <img src = "${IMG_PATH + movie.poster_path}">

        </div>
        <div class="sidebar-content">
            <div class="tagline sidebar-info" id="sidebar-tagline">
                <h4>Tagline</h4><span>${movie.tagline}</span>
            </div>
            <div class="overview sidebar-info">
                <h4>Overview</h4>${movie.overview}
            </div>
            <div class="production-companies sidebar-info">
                <h4>Production Companies</h4>
                <ul id = "ul-production-companies">
                    
                </ul>
            </div>
            <div class="genres sidebar-info">
                <h4>Genres</h4>
                <ul id = "ul-genres">
                  
                </ul>
            </div>
            <div class="sidebar-budget sidebar-info" id="sidebar-budget">
                <h4>Budget</h4>
                $${bud}
            </div>
            <!-- <div class="extras">

        </div> -->
        </div>`
        let list = document.getElementById("ul-genres");
        arr.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li)
        })
        let list_production_companies = document.getElementById("ul-production-companies");
        arr_pr_co.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            list_production_companies.appendChild(li)
        })
        if (movie.tagline === "") {
            showHide("hide", "sidebar-tagline");
        }
        if (bud == "Not Provided") {
            showHide("hide", "sidebar-budget");
        }
        showHide("show", "fullScreenSidebar", "flex");
    }
}

function showTVDetails(tv) {

    let arr = [],
        bud = "",
        seasonsAvail;

    sidebar.style.display = "block"
    tv.genres.forEach(data => {
        arr.push(data.name)
    })

    if (tv.budget === 0) {
        bud = "Not Provided"
    } else {
        bud = `${tv.budget} $`;
    }

    sidebar.innerHTML = ` 
       <i class="fa fa-close sidebar-close-icon" style="font-size:24px"></i>
       <a href="${tv.homepage}" > <img src="${IMG_PATH + tv.poster_path}" alt="Picture"></a>
        <div class="sidebar-movie-info" id="sidebar-${tv.id}">
            <h2>${tv.original_name}</h2>
            <span class = "${getClassByRate(tv.vote_average)}">${tv.vote_average}</span>

        </div>
        <div class="sidebar-movie-info" style="text-align: center;">
            <h4 class="sidebar-tagline">${tv.tagline}</h4>
        </div>

        <div class="sidebar-overview sidebar-info">
            <h3>Overview</h3>
          ${tv.overview}</div>
        <div class="sidebar-genres sidebar-info">
            <h4>Genres</h4>
            <ul id="ulSidebar">

            </ul>
        </div>
        <div class="sidebar-budget sidebar-info">
            <h4>Seasons</h4><div id="tv-seasons"></div>
        </div>
        <div class="sidebar-videos sidebar-info">
            <h4>Trailers and More</h4>
            <!-- Videos here -->
        </div>`

    let list = document.getElementById("ulSidebar");
    let sesonsEle = document.getElementById("tv-seasons");
    arr.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li)
    })
    tv.seasons.forEach(sea => {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.textContent = sea.name;
        a.href = tv.homepage;
        li.appendChild(a);
        sesonsEle.appendChild(li);
    })

    setStickySideBar();
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return 'green'
    } else if (vote >= 7) {
        return 'orange'
    } else {
        return 'red'
    }
}

function clickEvent(e) {
    //Opening Sidebar
    if (e.target.parentElement.classList.contains("contentCard")) {
        if (e.target.parentElement.classList.contains("movie")) {
            getMovieDetails(e.target.parentElement.id).then(data => {
                showMovieDetails(data.details);
            })
        } else if (e.target.parentElement.classList.contains("tv")) {
            getTVDetails(e.target.parentElement.id).then(data => {

                showTVDetails(data);
            })
        }
        e.target.parentElement.style.boxShadow = "rgba(255, 240, 140, 0.4) 5px 5px, rgba(220, 240, 140, 0.4) 10px 10px"
        showHide("show", "sidebar")
        if (sidebarData !== null) {
            document.getElementById(sidebarData).style.display = "block";
            document.getElementById(sidebarData).style.boxShadow = ""
        }

        sidebarData = e.target.parentElement.id;
        scroll(0, document.getElementsByTagName("header")[0].offsetHeight)

    } else if (e.target.classList.contains("sidebar-close-icon")) {
        document.getElementById("sidebar").style.display = "none";
        document.getElementById(sidebarData).style.boxShadow = "";
    }
    //Swap between movies, shows and actors

    if (e.target.classList.contains("title") === true) {
        if (e.target.classList.contains("focus") === false) {
            document.getElementsByClassName("focus")[0].classList.remove("focus");
            e.target.classList.add("focus");
            if (e.target.textContent === "Top Shows") {
                getTvShows(API_URL_DISCOVER_TV_SHOWS).then(data => {
                    showTVShows(data);
                })
            } else if (e.target.textContent === "Top Movies") {
                getMovies(API_URL_DISCOVER_MOVIES).then(data => {
                    showMovies(data);
                })
            }
        }
    }

}

function setStickySideBar() {
    windowHeight = window.innerHeight
    const stickySidebarHeight = sidebar.offsetHeight - windowHeight + 50;
    sidebar.style.top = `-${stickySidebarHeight}px`
}


function showHide(showOrHide, id, displayType = "block") {
    if (showOrHide === "show") {
        document.getElementById(id).style.display = displayType;
    } else if (showOrHide === "hide") {
        document.getElementById(id).style.display = "none";
    }
}

function themeChooser() {
    document.documentElement.style.setProperty('--color-3', '#fff');
}

getMovies(API_URL_DISCOVER_MOVIES).then(data => {
    showMovies(data);
});
eventListeners();

//Suggestions
/* 
1. Bring the movie to the top when clicked.
2. Include actors
 */
