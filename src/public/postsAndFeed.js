import { checkCurrentUser, getFollowingPosts } from './profile.js';

const postButton = document.getElementById('post_button');
const postError = document.getElementById('post_error');
const feed = document.getElementById('feed');
let page = 1; // page number for pagination
const limit = 2; // limit of posts per page

// get posts function with pagination to display posts in feed
async function getPosts(page) {
    // initialize search bar
    initializeSearchBar();
    // get posts from the server
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/contents?page=${page}&limit=${limit}`, {
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
                    page++;  // page number for pagination
                    getPosts(page);
                });
                feed.appendChild(showMoreButton);
            }
        } else {
            console.log('Error getting posts:', response.status);
        }
    } catch (error) {
        console.log('Error getting posts:', error);
    }
}

// search feed function to search for posts in the feed
async function searchFeed(page, searchValue) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/search?page=${page}&limit=${limit}&searchValue=${searchValue}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
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
                    page++;  // page number for pagination
                    searchFeed(page, searchValue);
                });
                feed.appendChild(showMoreButton);
            }
        } else if (response.status === 401) {
            // Redirect to login screen if unauthorized
            window.location.href = '/login';
        } else {
            console.log('Error getting posts:', response.status);
        }
    } catch (error) {
        console.log('Error fetching current user:', error);
    }
}


// get post details function to display a single post's details
async function getPostDetails(postId, backMarcker) {
    // check current user for following functionality
    try {
        const response = await fetch('http://127.0.0.1:8080/M00982633/login', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            const user_data = await response.json();
            try {
                const response = await fetch(`http://127.0.0.1:8080/M00982633/contents/${postId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status == 200) {
                    const post = await response.json();
                    feed.innerHTML = ''; // clear the feed
                    const selectedElement = document.createElement('article');
                    selectedElement.innerHTML = `
                        <h3 class="poster">${post.user}</h3>
                        <button class="poster follow">follow/unfollow</button>
                        <p class="post_content_display">${post.content}</p>
                        ${post.image ? `<img src="/${post.image.replace(/\\/g, '/')}" alt="Post Image" class="post_image">` : ''}
                        <span id="back">Back</span>
                        <p class="post_date">${post.date}</p>
                    `;
                    feed.appendChild(selectedElement);

                    // follow button functionality
                    const followButton = selectedElement.querySelector('.follow');
                    if (followButton) {
                        // Check if the current user follows the post's author
                        const followResponse = await fetch(`http://127.0.0.1:8080/M00982633/follow/${post.user}`, {
                            method: 'GET',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        const followData = await followResponse.json();
                        let isFollowing = followData.follows;
                        followButton.innerHTML = isFollowing ? `Unfollow ${post.user}` : `Follow ${post.user}`;

                        followButton.addEventListener('click', async () => {
                            followButton.disabled = true; // Disable the button

                            const action = isFollowing ? 'unfollow' : 'follow';
                            const response = await followed(user_data.username, post.user, action);
                            if (response.message === 'User followed successfully') {
                                followButton.innerHTML = `Unfollow ${post.user}`;
                                isFollowing = true;
                            } else if (response.message === 'User unfollowed successfully') {
                                followButton.innerHTML = `Follow ${post.user}`;
                                isFollowing = false;
                            } else if (response.message === 'You cannot follow yourself') {
                                followButton.innerHTML = 'You cannot follow yourself';
                            } else {
                                followButton.innerHTML = 'Error';
                            }

                            setTimeout(() => {
                                followButton.disabled = false; // Re-enable the button after 2 seconds
                            }, 2000);
                        });
                    }

                    // add event listener to the back button
                    const back = selectedElement.querySelector('#back');
                    if (back) {
                        back.addEventListener('click', () => {
                            feed.innerHTML = ''; // clear the feed
                            if (backMarcker === 0) {
                                getPosts(page); // reload the posts
                            }
                            if (backMarcker === 1) {
                                checkCurrentUser(page); // reload the user's posts
                            }
                            if (backMarcker === 2) {
                                getFollowingPosts(page); // reload the user's posts
                            }
                        });
                    }
                } else if (response.status == 500) {
                    console.log('Post not found');
                } else {
                    console.log('Error getting post details:', response.status);
                }
            } catch (error) {
                console.log('Error getting post details', error);
            }
        } else {
            console.log('Error getting current user:', response.status);
        }
    } catch (error) {
        console.log('Error getting current user:', error);
    }
}

// post thought function for posting a message/post
async function postThought() {
    let postContent = document.getElementById('post_content');
    let postImage = document.getElementById('post_image').files[0];
    const postDate = new Date().toISOString();

    if (postContent.value === "") {
        postError.textContent = "Please enter a message";
        return;
    }

    const formData = new FormData();
    formData.append('content', postContent.value);
    formData.append('date', postDate);
    if (postImage) {
        formData.append('image', postImage);
    }

    try {
        const response = await fetch('http://127.0.0.1:8080/M00982633/contents', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Ensure cookies are included in the request
        });
        // check if post was created successfully
        response.status === 200 ? postError.textContent = "Post created successfully" : postError.textContent = "Post creation failed";
    } catch {
        postError.textContent = "Error posting message";
    }

    // clear input field
    postContent.value = "";
    document.getElementById('post_image').value = "";
    // refresh feed
    feed.innerHTML = '';
    page = 1;  // page number for pagination
    getPosts(page);
}

// follow function to follow or unfollow a user
async function followed(follower, followed, action) {
    try {
        const response = await fetch('http://127.0.0.1:8080/M00982633/follow', {
            method: action === 'follow' ? 'POST' : 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ follower, followed }),
            credentials: 'include' // Ensure cookies are included in the request
        });

        const result = await response.json();
        if (response.status === 200) {
            console.log(result.message);
            return { message: result.message };
        } else if (response.status === 400 && result.error === 'You cannot follow yourself') {
            console.log(result.error);
            return { message: result.error };
        } else {
            console.log('Error following/unfollowing user:', response.status);
            return { message: 'Error' };
        }
    } catch (error) {
        console.log('Error following/unfollowing user:', error);
        return { message: 'Error' };
    }
}

// Initialize search bar
function initializeSearchBar() {
    const search_feed = document.getElementById('search_feed'); // search input field
    if (search_feed) {
        search_feed.addEventListener('keyup', async (event) => {
            page = 1;  // page number for pagination
            await searchFeed(page, event.target.value);
        });
    } else { // create search bar for general feed
        const search_bar = document.getElementById('search_bar');
        search_bar.innerHTML = '';
        const search = document.createElement('input');
        search.type = 'text';
        search.placeholder = 'Search';
        search.className = 'search';
        search.id = 'search_feed';
        search_bar.appendChild(search);
        search.addEventListener('keyup', async (event) => {
            page = 1;  // page number for pagination
            await searchFeed(page, event.target.value);
        });
    }
}

// EVENT LISTENERS

// event listener for posting a thought
postButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    postThought(); // initiate function to post thought
});

// get posts on page load
document.addEventListener('DOMContentLoaded', async () => {
    page = 1;  // page number for pagination
    initializeSearchBar(); // initialize search bar to ensure responsive behaviour
    getPosts(page);
});


// export functions
export { getPosts, getPostDetails, feed, limit, searchFeed};