import { getPosts, getPostDetails, feed } from './postsAndFeed.js';

// html elements
const loginRegisterScreen = document.getElementById('login_register_screen');
const profileName = document.getElementById('profile_name');
const logoutButton = document.getElementById('logout_button');
const year = document.getElementById('year');
const myPostsButton = document.getElementById('my_posts');
const followingButton = document.getElementById('following');
const logoButton = document.getElementById('logo_button');
const feedButton = document.getElementById('profile_feed');
let page = 1;
const limit = 2;
// after clicking logo get all posts
logoButton.addEventListener('click', (event) => {
    event.preventDefault();
    page = 1;
    feed.innerHTML = '';
    getPosts(page);
});

feedButton.addEventListener('click', (event) => {
    event.preventDefault();
    page = 1;
    feed.innerHTML = '';
    getPosts(page);
});

myPostsButton.addEventListener('click', async () => {
    console.log('Getting my posts');
    page = 1;
    feed.innerHTML = '';
    checkCurrentUser(page);
});

// function checking currently login user and getting their posts throu getMyPosts function
async function checkCurrentUser(page) {
    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/current-user', {
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
        const response = await fetch('http://127.0.0.1:4000/M00982633/check-login', {
            method: 'GET',
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
        const response = await fetch('http://127.0.0.1:4000/M00982633/logout', {
            method: 'POST',
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

// function to delete post
async function deletePost(postId, username) {
    console.log(`Attempting to delete post with ID: ${postId} for user: ${username}`);
    try {
        const response = await fetch(`http://127.0.0.1:4000/M00982633/posts/${postId}/${username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status == 200) {
            console.log('Post deleted');
            getMyPosts(username);
        } else {
            console.log(`Error deleting post: ${response.status}`);
        }
    } catch (error) {
        console.log('Error deleting post:', error);
    }
}


// function to get only posts made by logged in user with pagination
async function getMyPosts(username, page) {
    const search_bar = document.getElementById('search_bar');
    search_bar.innerHTML = '';
    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search';
    search.className = 'search';
    search.id = 'search_my_posts';
    search_bar.appendChild(search);
    try {
        const response = await fetch(`http://127.0.0.1:4000/M00982633/posts/user/${username}?page=${page}&limit=${limit}`, {
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
                    getPostDetails(postElement.id);
                });
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deletePost(postElement.id, username);
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

export { checkCurrentUser, limit };