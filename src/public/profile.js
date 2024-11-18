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

// after clicking logo get all posts
logoButton.addEventListener('click', (event) => {
    event.preventDefault();
    feed.innerHTML = '';
    getPosts();
});

feedButton.addEventListener('click', (event) => {
    event.preventDefault();
    feed.innerHTML = '';
    getPosts();
});

// if user is already logged in, redirect to profile page
document.addEventListener('DOMContentLoaded', (event) => {
    const user_data = JSON.parse(sessionStorage.getItem('user_data'));
    if (user_data) {    
        profileName.textContent = user_data.username;
        profileName.title = user_data.username;
        loginRegisterScreen.style.display = 'none';
    } else {
        console.log('No user data found. Please login.');
        loginRegisterScreen.style.display = 'flex';
    }
});

// log out function
logoutButton.addEventListener('click', () => {
    console.log('Logout button clicked');
    sessionStorage.removeItem('user_data');
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

// on click get only posts made by logged in user
myPostsButton.addEventListener('click', () => {
    console.log('Getting my posts');
    const user_data = JSON.parse(sessionStorage.getItem('user_data'));
    getMyPosts(user_data.username);
});

// function to get only posts made by logged in user
async function getMyPosts(username) {
    const search_bar = document.getElementById('search_bar');
    search_bar.innerHTML = '';
    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search';
    search.className = 'search';
    search.id = 'search_my_posts';
    search_bar.appendChild(search);
    try {
        const response = await fetch(`http://127.0.0.1:4000/M00982633/posts/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status == 200) {
            const posts = await response.json();
            console.log('Posts fetched successfully:', posts);
            feed.innerHTML = '';
            posts.forEach(post => {
                // create element in the feed
                const postElement = document.createElement('div');
                postElement.id = post.postId;
                postElement.innerHTML = `
                    <h3 class="poster">${post.user}</h3>
                    <p class="post_content_feed">${post.content}</p>
                    <p class="post_date">${post.date}</p>
                    <button class="delete_post">Delete</button>
                `;
                const deleteButton = postElement.querySelector('.delete_post');
                // after clicking element in the feed get the post details
                postElement.addEventListener('click', () => {
                    getPostDetails(postElement.id);
                });
                // button to delete post
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // prevent triggering the post details event
                    deletePost(postElement.id, username);
                });
                feed.appendChild(postElement);
            });
        } else {
            console.log('Error fetching posts:', response.status);
        }
    } catch (error) {
        console.log('Error getting posts:', error);
    }
}