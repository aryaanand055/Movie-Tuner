const API_URL_DISCOVER_MOVIES = 'https://api.themoviedb.org/3/discover/movie?api_key=bf7af8534242a2979c7554f3260e667f'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/multi?api_key=bf7af8534242a2979c7554f3260e667f&&query='
const searchBtn = document.getElementById("search"),
    sidebar = document.getElementById("sidebar");
let sidebarData = null;


function eventListeners() {
    document.addEventListener("click", clickEvent);
    searchBtn.addEventListener("keyup", serachMovies)
}

//Fetching Functions
async function getMovies(url, filter = "&sort_by=popularity.desc") {
    let newURL = url.concat(filter);
    const res = await fetch(newURL)
    const data = await res.json()
    results = data.results;


    showMovies(results)
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
function serachMovies() {
    if (searchBtn.value !== "") {
        searchNGetMovies(searchBtn.value).then(d => {
            showMovies(d.results)
        })
    } else {
        getMovies(API_URL_DISCOVER_MOVIES)
    }

}

function showMovies(content) {
    sidebarData = null;
    sidebarSH("h")
    main.innerHTML = ''
    // console.log(content)
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
            main.appendChild(movieElement)

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
        </div>
        `
            main.appendChild(tvElement)
        } else if (cnt.media_type === "person") {
            //Persons here
        }

    })
}

function showMovieDetailes(movie) {
    console.log(movie)
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
        <div class="sidebar-videos sidebar-info">
            <h4>Trailers and More</h4>
            <!-- Videos here -->
        </div>`

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
}

function showTVDetailes(tv) {

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

    console.log(tv)
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
                showMovieDetailes(data.details);
            })
        } else if (e.target.parentElement.classList.contains("tv")) {
            getTVDetails(e.target.parentElement.id).then(data => {

                showTVDetailes(data);
            })
        }
        e.target.parentElement.style.boxShadow = "rgba(46, 240, 240, 0.4) 5px 5px, rgba(46, 240, 240, 0.3) 10px 10px, rgba(46, 240, 240, 0.2) 15px 15px, rgba(46, 240, 240, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px"
        sidebarSH("s");
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

}

function setStickySideBar() {
    windowHeight = window.innerHeight
    const stickySidebarHeight = sidebar.offsetHeight - windowHeight + 50;
    sidebar.style.top = `-${stickySidebarHeight}px`
}

function sidebarSH(SH) {
    if (SH === "s") {
        document.getElementById("sidebar").style.display = "block";
    } else if (SH === "h") {
        document.getElementById("sidebar").style.display = "none";
    }
}


getMovies(API_URL_DISCOVER_MOVIES)
eventListeners();

//Suggestions
/* 
1. Bring the movie to the top when clicked.
2. Include actors
 */