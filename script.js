//select elements
const fetchBtn = document.getElementById('fetch-btn');
const xhrBtn = document.getElementById('xhr-btn');
const dataDisplay = document.getElementById('data-display');
const postBtn = document.getElementById('post-btn');
const putBtn = document.getElementById('put-btn');
const form = document.getElementById('api-form');

//function to update the display, if isError is true then text will be red
const updateDisplay = (message, isError = false) => {
    dataDisplay.innerHTML = `<pre style="color: ${isError ? 'red' : 'black'}">${message}</pre>`;
};

//function to handle GET requests with dynamic error handling
const getData = (url, useFetch = true) => {
    if (useFetch) {
        fetch(url)
            .then((response) => {
                if (!response.ok) {     //checks if server has error
                    throw new Error(`Server Error (${response.status}): ${response.statusText}`);   
                }
                return response.json();
            })
            .then((data) => updateDisplay(`Title: ${data.title}\n\nBody: ${data.body}`))
            .catch((error) => {     //handles network or other errors
                if (error.message.includes('Failed to fetch')) {
                    updateDisplay('Network Error: Unable to reach the server. Please check your internet connection.', true);
                } else {
                    updateDisplay(`Error: ${error.message}`, true);
                }
            });
    } else {
        //fetch data using XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status >= 400) {    //checks if server has error
                updateDisplay(`Server Error (${xhr.status}): ${xhr.statusText}`, true);
            } else {
                const data = JSON.parse(xhr.responseText);
                updateDisplay(`Title: ${data.title}\n\nBody: ${data.body}`);
            }
        };
        //handles network errors
        xhr.onerror = () => updateDisplay('Network Error: Unable to reach the server. Please check your internet connection.', true);
        xhr.send();
    }
};

//function to handle POST and PUT requests with dynamic error handling
const sendData = (url, method) => {
    const id = form.id.value;
    const title = form.title.value;
    const body = form.body.value;
    const fullUrl = method === 'PUT' ? `${url}/${id}` : url;

    //validate input for empty fields
    if (!title || !body || (method === 'PUT' && !id)) {
        updateDisplay('Client Error: All fields are required.', true);
        return;
    }

    //send POST or PUT request
    fetch(fullUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
    })
        .then((response) => {
            if (!response.ok) {     //checks if server has error
                throw new Error(`Server Error (${response.status}): ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            //display response data
            const action = method === 'POST' ? 'Created' : 'Updated';
            updateDisplay(`Post ${action} Successfully:\n\n${JSON.stringify(data, null, 2)}`);
        })
        .catch((error) => {
            //handles network error
            if (error.message.includes('Failed to fetch')) {
                updateDisplay('Network Error: Unable to reach the server. Please check your internet connection.', true);
            } else {
                updateDisplay(`Error: ${error.message}`, true);
            }
        });
};

//event listeners for button clicks
fetchBtn.addEventListener('click', () => getData('https://jsonplaceholder.typicode.com/posts/1'));
xhrBtn.addEventListener('click', () => getData('https://jsonplaceholder.typicode.com/posts/2', false));
postBtn.addEventListener('click', () => sendData('https://jsonplaceholder.typicode.com/posts', 'POST'));
putBtn.addEventListener('click', () => sendData('https://jsonplaceholder.typicode.com/posts', 'PUT'));