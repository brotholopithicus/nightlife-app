const placesContainer = document.querySelector('.places');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector(`input[type='text']`);
const searchButton = document.querySelector(`button[type='submit']`);

searchButton.addEventListener('click', searchButtonClickHandler);

function searchButtonClickHandler() {
    const method = 'POST';
    const data = JSON.stringify({ search: searchInput.value });
    const headers = [{ name: 'Content-Type', value: 'application/json' }];
    const options = { method, data, headers };
    requestify('/search', options).then(JSON.parse).then(displaySearchResults);
}

function displaySearchResults(results) {
    [...placesContainer.children].forEach(place => placesContainer.removeChild(place));
    results.forEach(place => {
        const div = document.createElement('div');
        div.classList.add('place');
        div.dataset.id = place.id;
        const h3 = document.createElement('h3');
        h3.textContent = place.name;
        div.appendChild(h3);
        const img = document.createElement('img');
        img.src = place.image_url;
        img.style.width = '200px';
        img.style.height = '300px';
        div.appendChild(img);
        const p = document.createElement('p');
        p.textContent = '0 Attending';
        div.appendChild(p);
        if (typeof user_id !== 'undefined') {
            const button = document.createElement('button');
            button.id = 'attend';
            button.textContent = 'Attend';
            button.addEventListener('click', attendClickHandler);
            div.appendChild(button);
        }
        placesContainer.insertBefore(div, placesContainer.firstChild);
    });
}
const userLocation = localStorage.getItem('location');

if (userLocation) {
    searchInput.value = userLocation;
} else {
    getCurrentLocation();
}

addEventHandlers(searchInput, 'focus blur keydown', searchInputEventHandler);

function addEventHandlers(element, events, listener) {
    if (typeof events === 'string') events = events.split(' ');
    for (let i = 0; i < events.length; i++) {
        element.addEventListener(events[i], listener);
    }
}

function searchInputEventHandler(e) {
    switch (e.type) {
        case 'focus':
            searchForm.classList.add('focused');
            break;
        case 'blur':
            searchForm.classList.remove('focused');
            break;
        case 'keydown':
            if (e.keyCode === 13) searchButtonClickHandler();
            break;
    }
}

function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(success, error);

    function success(pos) {
        const url = `https://geocode.xyz/${pos.coords.latitude},${pos.coords.longitude}?geoit=json`;
        requestify(url, { method: 'GET' }).then(JSON.parse).then(res => {
            const location = `${res.city}, ${res.prov}`;
            if (location !== userLocation) {
                searchInput.value = location;
                localStorage.setItem('location', location);
            }
        });
    }

    function error(err) {
        console.log(err);
    }
}

const places = document.querySelectorAll('.place');
const attendButtons = document.querySelectorAll('button#attend');
attendButtons.forEach(button => button.addEventListener('click', attendClickHandler));

function notAttendingClickHandler(e) {
    console.log(e);
}

function attendClickHandler(e) {
    const id = e.target.parentNode.dataset.id;
    const url = `/api/places/${id}`;
    requestify(url, { method: 'POST' }).then(() => window.location.reload());
}

function getUser() {
    const url = `/users/${user_id}`;
    requestify(url, { method: 'GET' }).then(JSON.parse).then((response) => {
        places.forEach(place => {
            if (place.dataset.id === response.attending) {
                place.classList.add('attending');
                place.removeChild(place.querySelector('button#attend'));
                const button = document.createElement('button');
                button.id = 'unAttend';
                button.textContent = 'Cancel Attend';
                button.addEventListener('click', notAttendingClickHandler);
                place.appendChild(button);
            }
        })
    });
}

function requestify(url, options) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open(options.method, url);
        if (typeof options.headers !== 'undefined') options.headers.forEach(header => req.setRequestHeader(header.name, header.value));
        req.onload = () => {
            if (req.status >= 200 && req.status < 300) {
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        }
        req.onerror = () => reject({ status: req.status, statusText: req.statusText });
        req.send(options.data);
    });
}

if (typeof user_id !== 'undefined') getUser();
