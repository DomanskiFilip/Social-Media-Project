const postButton = document.getElementById('post_button');
const postError = document.getElementById('post_error');
const feed = document.getElementById('feed');

postButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    postThought(); // initiate function to post thought
});

// get posts function
async function getPosts() {
    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(response.status == 200) {
        const posts = await response.json();
        posts.forEach(post => {
            // create element in the feed
            const postElement = document.createElement('div');
            postElement.id = post.postId;
            postElement.innerHTML = `
                <h3 class="poster">${post.user}</h3>
                <p class="post_content_feed">${post.content}</p>
                <p class="post_date">${post.date}</p>
            `;
            // after clicking element in the feed get the post details
            postElement.addEventListener('click', () => {
                getPostDetails(postElement.id);
            });
            feed.appendChild(postElement);
        });
        } else {
            console.log('Error getting posts');
    }
    } catch {
        console.log('Error getting posts');
    }
}

// get post details function
async function getPostDetails(postId) {
    try {
        const response = await fetch(`http://127.0.0.1:4000/M00982633/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status == 200) {
            const post = await response.json();
            // clear the feed before displaying the post details
            feed.innerHTML = '';
            // create element in the feed
            const selectedElement = document.createElement('article');
            selectedElement.innerHTML = `
                <h3 class="poster">${post.user}</h3>
                <p class="post_content_display">${post.content}</p>
                <span id="back">Back</span>
                <p class="post_date">${post.date}</p>
            `;
            feed.appendChild(selectedElement);

            // add event listener to the back button
            const back = document.getElementById('back');
            back.addEventListener('click', () => {
                feed.innerHTML = ''; // clear the feed
                getPosts(); // reload the posts
            });
        } else if (response.status == 404) {
            console.log('Post not found');
        } else {
            console.log('Error getting post details');
        }
    } catch (error) {
        console.log('Error getting post details', error);
    }
}

async function postThought() {
    let postContent = document.getElementById('post_content');
    const postDate = new Date().toISOString();
    const user_data = JSON.parse(sessionStorage.getItem('user_data'));

    if(postContent.value === "") {
        postError.textContent = "Please enter a message";
        return;
    }

    const post = {
        content: postContent.value,
        date: postDate,
        user: user_data.username,
    };

    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });
        // check if post was created successfully
        response.status === 201 ? postError.textContent = "Post created successfully" : postError.textContent = "Post creation failed";
    } catch {
        postError.textContent = "Error posting message";
    }

    // clear input field
    postContent.value = "";
    // refresh feed
    feed.innerHTML = '';
    getPosts();
}



// get posts on page load
document.addEventListener('DOMContentLoaded', async () => {
   getPosts();
});
