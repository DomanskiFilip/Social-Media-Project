import { getPosts, getPostDetails, feed, limit} from './postsAndFeed.js';

// html elements
const loginRegisterScreen = document.getElementById('login_register_screen');
const profileName = document.getElementById('profile_name');
const logoutButton = document.getElementById('logout_button');
const year = document.getElementById('year');
const myPostsButton = document.getElementById('my_posts');
const followingButton = document.getElementById('following');
const logoButton = document.getElementById('logo_button');
const feedButton = document.getElementById('profile_feed');
let page = 1; // page number for pagination

// function checking currently login user and getting their posts throu getMyPosts function
async function checkCurrentUser(page) {
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
            getMyPosts(user_data.username, page);
        } else {
            console.log('Error fetching current user:', response.status);
        }
    } catch (error) {
        console.log('Error fetching current user:', error);
    }
}

// automaticly log in user if session is still active
async function AutoLogIn(){
    try {
        const response = await fetch('http://127.0.0.1:8080/M00982633/login', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.status === 200) {
            const user_data = await response.json();
            profileName.textContent = user_data.username;
            profileName.title = user_data.username;
            loginRegisterScreen.style.display = 'none';
        } else {
            console.log('No user data found. Please login.');
            loginRegisterScreen.style.display = 'flex';
        }
    } catch (error) {
        console.log('Error checking login status', error);
        loginRegisterScreen.style.display = 'flex';
    }
}

// if user is already logged in, redirect to profile page
document.addEventListener('DOMContentLoaded', async (event) => {
    event.preventDefault();
    AutoLogIn();
});

// log out function
async function LogOutFunction() {
    try {
        const response = await fetch('http://127.0.0.1:8080/M00982633/login', {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.status === 200) {
            console.log('User logged out');
            loginRegisterScreen.style.display = 'flex';
            profileName.textContent = '';
            profileName.title = '';
        } else {
            console.log('Error logging out');
        }
    } catch (error) {
        console.log('Error logging out', error);
    }
}

// log out function
logoutButton.addEventListener('click', () => {
    LogOutFunction();
    window.location.reload();
});

// self updating year in footer
year.textContent = new Date().getFullYear();

async function deletePost(postId) {
    console.log(`Attempting to delete post with ID: ${postId}`);
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/contents/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Ensure cookies are included in the request
        });
        if (response.status == 200) {
            console.log('Post deleted');
            checkCurrentUser(1); // Refresh the posts after deletion
        } else {
            console.log(`Error deleting post: ${response.status}`);
        }
    } catch (error) {
        console.log('Error deleting post:', error);
    }
}


// function to get only posts made by logged in user with pagination
async function getMyPosts(username, page) {
    // Initialize search bar for user's posts
    initializeSearchBarMyPosts(username);
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/contents/user/${username}?page=${page}&limit=${limit}`, {
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
                    <button class="delete_post">Delete</button>
                `;
                const deleteButton = postElement.querySelector('.delete_post');
                postElement.addEventListener('click', () => {
                    let backMarcker = 1; // a marker to tell the getPostDetails function that the back button was clicked from the My Posts
                    getPostDetails(postElement.id, backMarcker);
                });
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deletePost(postElement.id);
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
                    getMyPosts(username, page);
                });
                feed.appendChild(showMoreButton);
            }
        } else {
            console.log('Error fetching posts:', response.status);
        }
    } catch (error) {
        console.log('Error getting posts:', error);
    }
}


// Initialize search bar for user's posts
function initializeSearchBarMyPosts(username) {
    const search_my_feed = document.getElementById('search_my_posts'); // search input field
    if (search_my_feed) {
        search_my_feed.addEventListener('keyup', async (event) => {
            page = 1;  // page number for pagination
            searchMyPosts(username, page, event.target.value);
        });
    } else { // create search bar for user's posts
        const search_bar = document.getElementById('search_bar');
        search_bar.innerHTML = '';
        const search = document.createElement('input');
        search.type = 'text';
        search.placeholder = 'Search';
        search.className = 'search';
        search.id = 'search_my_posts';
        search_bar.appendChild(search);
        search.addEventListener('keyup', async (event) => {
            page = 1;  // page number for pagination
            searchMyPosts(username, page, event.target.value);
        });
    }
}

// search My Posts function
async function searchMyPosts(username, page, searchValue) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/users/search/${username}?page=${page}&limit=${limit}&q=${searchValue}`, {
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
                <button class="delete_post">Delete</button>
                `;
                const deleteButton = postElement.querySelector('.delete_post');
                postElement.addEventListener('click', () => {
                    let backMarcker = 1; // a marker to tell the getPostDetails function that the back button was clicked from the feed
                    getPostDetails(postElement.id, backMarcker);
                });
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deletePost(postElement.id);
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
                    searchMyPosts(page, searchValue) ;
                });
                feed.appendChild(showMoreButton);
            }
        } else {
            console.log('Error getting posts');
        }
    } catch (error) {
        console.log('Error searching feed:', error);
    }
}

// function to get posts from user's following list
async function getFollowingPosts(page) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/M00982633/follows/posts?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            const posts = await response.json();
            console.log('Received posts:', posts); // Log the received posts
            if (Array.isArray(posts)) {
                if (page === 1) {
                    feed.innerHTML = ''; // Clear the feed only if it's the first page
                }
                if (posts.length === 0 && page === 1) {
                    feed.innerHTML = '<p>No posts to display</p>'; // Show message if no posts
                } else {
                    posts.forEach(post => {
                        const postElement = document.createElement('div');
                        postElement.id = post.postId;
                        postElement.innerHTML = `
                            <h3 class="poster">${post.user}</h3>
                            <p class="post_content_feed">${post.content}</p>
                            <p class="post_date">${post.date}</p>
                        `;
                        postElement.addEventListener('click', () => {
                            let backMarcker = 2; // a marker to tell the getPostDetails function that the back button was clicked from the feed
                            getPostDetails(postElement.id, backMarcker);
                        });
                        feed.appendChild(postElement);
                    });

                    if (posts.length === limit) {
                        const showMoreButton = document.createElement('button');
                        showMoreButton.className = 'show_more';
                        showMoreButton.textContent = 'Show More';
                        showMoreButton.id = `show_more_${page}`;
                        showMoreButton.addEventListener('click', () => {
                            document.getElementById(`show_more_${page}`).remove(); // remove the previous show more button
                            page++;  // page number for pagination
                            getFollowingPosts(page);
                        });
                        feed.appendChild(showMoreButton);
                    }
                }
            } else {
                console.log('Error: posts is not an array');
            }
        } else if (response.status === 404) {
            if (page === 1) {
                feed.innerHTML = '<p>No posts to display</p>'; // Show message if no posts
            }
        } else {
            console.log('Error getting following posts:', response.status);
        }
    } catch (error) {
        console.log('Error fetching following posts:', error);
    }
}

// EVENT LISTENERS

// after clicking logo get all posts
logoButton.addEventListener('click', (event) => {
    event.preventDefault();
    page = 1;  // page number for pagination
    getPosts(page);
});

feedButton.addEventListener('click', (event) => {
    event.preventDefault();
    page = 1;  // page number for pagination
    getPosts(page);
});

myPostsButton.addEventListener('click', async () => {
    console.log('Getting my posts');
    page = 1;  // page number for pagination
    checkCurrentUser(page);
});

// get posts form user's following list
followingButton.addEventListener('click', async () => {
    console.log('Getting following posts');
    page = 1;  // page number for pagination
    getFollowingPosts(page);
});

export { checkCurrentUser, getMyPosts, getFollowingPosts };