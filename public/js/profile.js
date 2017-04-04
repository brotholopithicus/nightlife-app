const placeName = document.querySelector('.place-name');
const placeAttendees = document.querySelector('.place-attendees');

function getUser() {
    const url = `/users/${user_id}`;
    requestify(url, 'GET').then(JSON.parse).then(response => {
        const place = response.attending;
        requestify(`/api/places/${place}`, 'GET').then(JSON.parse).then(result => {
            console.log(result);
            console.log(placeName);
            placeName.textContent = result.name;
            placeAttendees.textContent = result.attendees.length + ' Attendees';
        });
    });
}

getUser();

function requestify(url, method, data) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open(method, url);
        req.onload = () => {
            if (req.status >= 200 && req.status < 300) {
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        }
        req.onerror = () => reject({ status: req.status, statusText: req.statusText });
        req.send();
    });
}
