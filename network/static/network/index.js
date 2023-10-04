document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#allPostsButton').addEventListener('click', () => allPosts());
    try {document.querySelector('#followingButton').addEventListener('click', () => following());
    document.querySelector('#createButton').addEventListener('click', () => createPost());}catch{}
    
    // default
    allPosts();
  });

function allPosts(page){
    document.querySelector('#allPosts').style.display = 'block';
    try {document.querySelector('#following').style.display = 'none';}catch{}
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#createPost').style.display = 'none';
    document.querySelector('#editPost').style.display = 'none';

    document.querySelector('#title').innerHTML = 'All Posts';

    if (page === undefined){
        page = 1;
    }

    fetch('/allposts'+"?page="+page)
    .then(response => response.json())
    .then(postObj => {
        // gets the user if they are logged in
        fetch('getuser')
        .then(response => response.json())
        .then(userRes => {
            user = userRes["user"];
            posts = postObj["posts"];

            document.querySelector('#allPosts').innerHTML = ""

            posts.forEach(post => {
                const bgDiv = document.createElement('div');
                bgDiv.className = "card ml-5 mr-5 mt-3 border";
                const div = document.createElement('div');
                div.className = "card-body";

                userName = document.createElement("h5");
                userName.innerHTML = `<a onclick=profile(${post["id"]})>@${post["user"]}</a>`
                userName.className = "text-muted card-title";

                postText = document.createElement("h4");
                postText.innerHTML = `${post["post"]}<hr>`;
                postText.className = "card-text";

                time = document.createElement("p");
                time.innerHTML = post["timestamp"];
                time.className = "font-weight-light";
                
                div.append(userName);
                div.append(postText);
                div.append(time);

                if (user != "false"){
                    isLiked = false;
                    
                    // checks if user has liked the post
                    post["usersLiked"].forEach(item => {
                        if (item.includes(user)){
                            isLiked = true;
                        }
                    })

                    if (isLiked){
                        // user has liked the post
                        button = document.createElement('button');
                        button.className = "btn btn-secondary";
                        button.innerHTML = `<i class="fa-solid fa-heart"> ` + post["likes"];
                        button.addEventListener("click", function(){
                            toggleLike(post["postId"], false, "all", page);
                        });
                        div.append(button);
                    }
                    else{
                        // user not yet liked the post
                        button = document.createElement('button');
                        button.className = "btn btn-secondary";
                        button.innerHTML = `<i class="fa-regular fa-heart"> `+ post["likes"];
                        button.addEventListener("click", function(){
                            toggleLike(post["postId"], true, "all", page);
                        });

                        div.append(button);
                    }

                    if (post["id"] === user){
                        // the user viewing is the poster
                        const button = document.createElement('button');
                        button.className = "ml-2 btn btn-light";
                        button.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #6f6d6d;"></i>`;
                        button.addEventListener("click", function(){
                            edit(post["postId"], user, post["post"]);
                        });
                        div.append(button)
                    }
                }

                bgDiv.append(div);
                document.querySelector('#allPosts').append(bgDiv);
        })

        pagDiv = document.createElement("div");
        pagDiv.className = "ml-5 mt-3"

        if (postObj["previous"] != "nan"){
            const a = document.createElement("button");
            a.innerHTML = "Previous";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                allPosts(postObj["previous"]);
            });
            pagDiv.append(a);
        }
        if (postObj["next"] != "nan"){
            const a = document.createElement("a");
            a.innerHTML = "Next";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                allPosts(postObj["next"]);
            });
            pagDiv.append(a);
        }
        document.querySelector("#allPosts").append(pagDiv);
    })
    })
}

function following(page){
    document.querySelector('#allPosts').style.display = 'none';
    document.querySelector('#following').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#createPost').style.display = 'none';
    document.querySelector('#editPost').style.display = 'none';

    document.querySelector('#title').innerHTML = 'Following';

    if (page === undefined){
        page = 1;
    }

    fetch('/posts'+"?page="+page)
    .then(response => response.json())
    .then(postObj => {
        // gets the user if they are logged in
        fetch('getuser')
        .then(response => response.json())
        .then(userRes => {
        posts = postObj["posts"];
        user = userRes["user"];

        document.querySelector('#following').innerHTML = ""


        posts.forEach(post => {
            const bgDiv = document.createElement('div');
            bgDiv.className = "card ml-5 mr-5 mt-3 border";
            const div = document.createElement('div');
            div.className = "card-body";
            //div.innerHTML = `<a onclick=profile(${post["id"]})>${post["user"]}</a>: ${post["post"]}(${post["timestamp"]}) likes:${post["likes"]}`;
            
            userName = document.createElement("h5");
            userName.innerHTML = `<a onclick=profile(${post["id"]})>@${post["user"]}</a>`
            userName.className = "text-muted card-title";

            postText = document.createElement("h4");
            postText.innerHTML = `${post["post"]}<hr>`;
            postText.className = "card-text";

            time = document.createElement("p");
            time.innerHTML = post["timestamp"];
            time.className = "font-weight-light";
            
            div.append(userName);
            div.append(postText);
            div.append(time);

            // checks if user has liked the post
            hasLiked = false;        
            post["usersLiked"].forEach(item => {
                if (item.includes(user)){
                    hasLiked = true;
                }
            })
            

            if (hasLiked){
                // user has liked the post
                button = document.createElement('button');
                button.className = "btn btn-secondary";
                button.innerHTML = `<i class="fa-solid fa-heart"> ` + post["likes"];
                button.addEventListener("click", function(){
                    toggleLike(post["postId"], false, "following", page);
                });
                div.append(button);
            }
            else{
                // user not yet liked the post
                button = document.createElement('button');
                button.className = "btn btn-secondary";
                button.innerHTML = `<i class="fa-regular fa-heart"> `+ post["likes"];
                button.addEventListener("click", function(){
                    toggleLike(post["postId"], true, "following", page);
                });
                div.append(button);
            }
            
            bgDiv.append(div);
            document.querySelector('#following').append(bgDiv);
        })

        pagDiv = document.createElement("div");
        pagDiv.className = "ml-5 mt-3"

        if (postObj["previous"] != "nan"){
            const a = document.createElement("button");
            a.innerHTML = "Previous";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                following(postObj["previous"]);
            });
            pagDiv.append(a);
        }
        if (postObj["next"] != "nan"){
            const a = document.createElement("a");
            a.innerHTML = "Next";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                following(postObj["next"]);
            });
            pagDiv.append(a);
        }
        document.querySelector("#following").append(pagDiv);
    })
})
}

function createPost(){
    document.querySelector('#allPosts').style.display = 'none';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#createPost').style.display = 'block';
    document.querySelector('#editPost').style.display = 'none';

    document.querySelector('#title').innerHTML = 'Create Post';
}

function profile(id, page){
    document.querySelector('#allPosts').style.display = 'none';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    document.querySelector('#createPost').style.display = 'none';
    document.querySelector('#editPost').style.display = 'none';

    document.querySelector('#title').innerHTML = 'View Profile';

    if (page === undefined){
        page = 1;
    }

    fetch('/profile/'+id+"?page="+page)
    .then(response => response.json())
    .then(info => {
        fetch('getuser')
        .then(response => response.json())
        .then(userRes => {
        user = userRes["user"];

        // redirects user to log in to view profile
        if (info["loggedIn"] === false){
            window.location.replace("login");
        }

        document.querySelector("#profile").innerHTML = "";

        const bgDiv = document.createElement('div');
        bgDiv.className = "card ml-3 mr-3 mt-3";
        const div = document.createElement('div');
        div.className = "card-body";

        userName = document.createElement("h4");
        userName.innerHTML = `@${info["name"]}</a>`;
        userName.className = "text-muted card-title";

        infoText = document.createElement("h5");
        infoText.innerHTML = `<b>${info["following"]}</b> Following &nbsp <b>${info["followers"]}</b> Followers`;
        infoText.className = "float-left";

        div.append(userName);
        followDiv = document.createElement("div");
        followDiv.className = "clearfix";
        followDiv.append(infoText);
        div.append(followDiv);

        if (info["isUser"] === false){
            if (info["isFollowing"] === true){
                // user is following
                button = document.createElement('button');
                button.innerHTML = "Unfollow";
                button.className = "btn btn-outline-primary ml-3";
                button.addEventListener("click", function(){
                    toggleFollow(info["id"], false, "profile", id);
                });
                followDiv.append(button);
            }
            else{
                // user isnt following
                button = document.createElement('button');
                button.innerHTML = "Follow";
                button.className = "btn btn-outline-primary ml-3";
                button.addEventListener("click", function(){
                    toggleFollow(info["id"], true, "profile", id);
                });
                followDiv.append(button);
            }
        }
        
        bgDiv.append(div);
        document.querySelector('#profile').append(bgDiv);

        pastPostsTitle = document.createElement("h2");
        pastPostsTitle.innerHTML = "<hr>Past Posts:";
        document.querySelector("#profile").append(pastPostsTitle);

        info["posts"].forEach(post => {
            const bgDiv = document.createElement('div');
            bgDiv.className = "card ml-5 mr-5 mt-3 border";
            const div = document.createElement('div');
            div.className = "card-body";
            
            //div.innerHTML = `<a onclick=profile(${post["id"]})>${post["user"]}</a>: ${post["post"]}(${post["timestamp"]}) likes:${post["likes"]}`;
            
            userName = document.createElement("h5");
            userName.innerHTML = `<a onclick=profile(${post["id"]})>@${post["user"]}</a>`
            userName.className = "text-muted card-title";
            
            postText = document.createElement("h4");
            postText.innerHTML = `${post["post"]}<hr>`;
            postText.className = "card-text";

            time = document.createElement("p");
            time.innerHTML = post["timestamp"];
            time.className = "font-weight-light";

            div.append(userName);
            div.append(postText);
            div.append(time);

            // checks if user has liked the post
            isLiked = false;
            post["usersLiked"].forEach(item => {
                if (item.includes(user)){
                    isLiked = true;
                }
            })

            if (isLiked){
                // user has liked the post
                button = document.createElement('button');
                button.className = "btn btn-secondary";
                button.innerHTML = `<i class="fa-solid fa-heart"> ` + post["likes"];
                button.addEventListener("click", function(){
                    toggleLike(post["postId"], false, "profile", page,id);
                });
                div.append(button);
            }
            else{
                // user not yet liked the post
                button = document.createElement('button');
                button.className = "btn btn-secondary";
                button.innerHTML = `<i class="fa-regular fa-heart"> `+ post["likes"];
                button.addEventListener("click", function(){
                    toggleLike(post["postId"], true, "profile", page,id);
                });
                div.append(button);
            }
            bgDiv.append(div);
            document.querySelector('#profile').append(bgDiv);
        })
        pagDiv = document.createElement("div");
        pagDiv.className = "ml-5 mt-3"

        if (info["previous"] != "nan"){
            const a = document.createElement("button");
            a.innerHTML = "Previous";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                profile(id, info["previous"]);
            });
            pagDiv.append(a);
        }
        if (info["next"] != "nan"){
            const a = document.createElement("button");
            a.innerHTML = "Next";
            a.className = "btn btn-light border mr-2";
            a.addEventListener("click", function(){
                profile(id, info["next"]);
            });
            pagDiv.append(a);
        }
        
        document.querySelector("#profile").append(pagDiv);
    })
})
}

function toggleFollow(followingid, toToggle, result, pid){
    fetch('togglefollow', {
        method: 'POST',
            body: JSON.stringify({
                followingid: followingid,
                toToggle: toToggle
            })
        })
    .then(response => response.json())
    .then(res => {
        if (result === "profile"){
            profile(pid);
        }
    })
}

function toggleLike(postid, toToggle, result, page, pid){
    fetch('togglelike', {
        method: 'POST',
            body: JSON.stringify({
                postid: postid,
                toToggle: toToggle
            })
        })
    .then(response => response.json())
    .then(res => {
        if (result === "all"){
            allPosts(page);
        }
        else if (result === "following"){
            following(page);
        }
        else if (result === "profile"){
            profile(pid, page);
        }
    })
}

function edit(postid, userid, postBody){
    document.querySelector('#allPosts').style.display = 'none';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#createPost').style.display = 'none';
    document.querySelector('#editPost').style.display = 'block';

    document.querySelector('#title').innerHTML = 'Edit Post';


    document.querySelector('#postArea').innerHTML = postBody;
    document.querySelector('#postid').value = postid;
    document.querySelector('#userid').value = userid;

}