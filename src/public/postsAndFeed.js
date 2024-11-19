import { checkCurrentUser, limit, getMyPosts } from './profile.js';

const postButton = document.getElementById('post_button');
const postError = document.getElementById('post_error');
const feed = document.getElementById('feed');
let page = 1;

// get posts function with pagination
async function getPosts(page) {
    const search_bar = document.getElementById('search_bar');
    search_bar.innerHTML = '';
    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search';
    search.className = 'search';
    search.id = 'search_feed';
    search_bar.appendChild(search);
    try {
        const response = await fetch(`http://127.0.0.1:4000/M00982633/posts?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status == 200) {
            const posts = await response.json();
            if (page === 1) {
                feed.innerHTML = ''; // Clear the feed only if it's the first page
            }
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.id = post.postId;
                postElement.innerHTML = `
                    <h3 class="poster">${post.user}</h3>
                    <p class="post_content_feed">${post.content}</p>
                    <p class="post_date">${post.date}</p>
                `;
                postElement.addEventListener('click', () => {
                    let backMarcker = 0; // a marker to tell the getPostDetails function that the back button was clicked from the feed
                    getPostDetails(postElement.id, backMarcker);
                });
                feed.appendChild(postElement);
            });

            if (posts.length === limit) {
                const showMoreButton = document.createElement('button');
                showMoreButton.className = 'show_more';
                showMoreButton.textContent = 'Show More';
                showMoreButton.id = page;
                showMoreButton.addEventListener('click', () => {
                    document.getElementById(page).remove(); // remove the previous show more button
                    page++;
                    getPosts(page);
                });
                feed.appendChild(showMoreButton);
            }
        } else {
            console.log('Error getting posts');
        }
    } catch (error) {
        console.log('Error getting posts:', error);
    }
}


// get post details function
async function getPostDetails(postId, backMarcker) {
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
                if(backMarcker === 0){
                    getPosts(page); // reload the posts
                }
                if(backMarcker === 1){
                    checkCurrentUser(page); // reload the user's posts
                }
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

// post thought function for posting a message
async function postThought() {
    let postContent = document.getElementById('post_content');
    const postDate = new Date().toISOString();

    if (postContent.value === "") {
        postError.textContent = "Please enter a message";
        return;
    }

    const post = {
        content: postContent.value,
        date: postDate,
    };

    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post),
            credentials: 'include' // Ensure cookies are included in the request
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
    page = 1;
    getPosts();
}

postButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    postThought(); // initiate function to post thought
});

// get posts on page load
document.addEventListener('DOMContentLoaded', async () => {
    page = 1;
    getPosts(page);
});

export { getPosts, getPostDetails, feed };