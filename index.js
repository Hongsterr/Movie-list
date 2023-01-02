const BASE_URL = 'https://movie-list.alphacamp.io'
const Index_Url = BASE_URL + '/api/v1/movies/'
const Poster_Url = BASE_URL + '/posters/'
const Movie_Per_Page = 12

const movies = []
let filteredMovies = []
let currentpage = 1
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeChangeButton = document.querySelector('#mode-change')

function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
            <div class="mb-2">
              <div class="card">
                <img src="${Poster_Url + item.image}" class="card-img-top" alt="Movie Poster">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                  <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>
          </div>`
    })
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class='list-group-action'>`
    data.forEach((item) => {
      rawHTML += `
      <li class='list-group-item list-group-item-action d-flex justify-content-between'>
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="mt-3">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>        
      </li>
      `
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / Movie_Per_Page)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage (page) {
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * Movie_Per_Page
  return data.slice(startIndex, startIndex + Movie_Per_Page)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(Index_Url + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${Poster_Url + data.image}" alt="movie-poster" class="img-fliud">`
  })
}

function addToFavorite(id) { 
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert ('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function changeDisplayMode(displaymode) {
  if (dataPanel.dataset.mode === displaymode) return
  dataPanel.dataset.mode = displaymode
}

modeChangeButton.addEventListener('click', function onChangeClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentpage))
  } else if (event.target.matches('#list-mode-button')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentpage))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener ('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentpage = page
  renderMovieList(getMoviesByPage(currentpage))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword))
  
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword )
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

axios.get(Index_Url).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(currentpage))
})
