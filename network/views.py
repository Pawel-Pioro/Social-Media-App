import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post, Follow, Like

paginatorValue = 10

def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
@csrf_exempt
def posts(request):
    if request.method == "POST":
        # create a new post, takes in a user and a post body
        user = request.user
        postBody = request.POST["body"]

        newPost = Post(user=user, post=postBody)
        newPost.save()

        return HttpResponseRedirect(reverse("index"))
    elif request.method == "GET":
        # gets all followers and shows their posts
        # uses request.user and gets their following then shows all the posts

        followingList = request.user.follower.all().values_list('followed_id')
        followingList = User.objects.filter(pk__in=followingList)
        posts = Post.objects.filter(user__in=followingList).order_by("-timestamp").all()
        postsList = [post.serialize() for post in posts]
        paginator = Paginator(postsList, paginatorValue)

        if request.GET.get("page") != None:
            try:
                postsList = paginator.page(request.GET.get("page"))
            except:
                postsList = paginator.page(1)
        else:
            postsList = paginator.page(1)
        
        previous = "nan"
        next = "nan"

        if postsList.has_previous():
            previous = postsList.previous_page_number()
        if postsList.has_next():
            next = postsList.next_page_number()

        return JsonResponse({
            "posts": list(postsList),
            "previous": previous,
            "next": next
        }, safe=False)

def allPosts(request):
    # shows all public posts
    posts = Post.objects.order_by("-timestamp").all()
    postsList = [post.serialize() for post in posts]
    paginator = Paginator(postsList, paginatorValue)
    if request.GET.get("page") != None:
        try:
            postsList = paginator.page(request.GET.get("page"))
        except:
            postsList = paginator.page(1)
    else:
        postsList = paginator.page(1)
    
    previous = "nan"
    next = "nan"

    if postsList.has_previous():
        previous = postsList.previous_page_number()
    if postsList.has_next():
        next = postsList.next_page_number()
    return JsonResponse({
        "posts": list(postsList),
        "previous": previous,
        "next": next
        }, safe=False)

def profile(request, id):

    # shows profile info of someone
    getUser = User.objects.get(pk=id)

    isUser = False
    isFollowing = False

    posts = Post.objects.order_by("-timestamp").filter(user=getUser)
    postsList = [post.serialize() for post in posts]
    paginator = Paginator(postsList, paginatorValue)
    
    if not request.user.is_authenticated:
        return JsonResponse({"loggedIn": False}, safe=False)

    # checks if the logged in user is the clicked on user
    if request.user == getUser:
        isUser = True
    else:
        query = Follow.objects.filter(follower=request.user, followed=getUser).count()
        if query != 0:
            isFollowing = True

    if request.GET.get("page") != None:
        try:
            postsList = paginator.page(request.GET.get("page"))
        except:
            postsList = paginator.page(1)
    else:
        postsList = paginator.page(1)
    
    previous = "nan"
    next = "nan"

    if postsList.has_previous():
        previous = postsList.previous_page_number()
    if postsList.has_next():
        next = postsList.next_page_number()

    return JsonResponse({
        "id": id,
        "name": getUser.username,
        "following": Follow.objects.filter(follower=getUser).count(),
        "followers":  Follow.objects.filter(followed=getUser).count(),
        "isUser": isUser,
        "posts": list(postsList),
        "previous": previous,
        "next": next,
        "isFollowing": isFollowing
    }, safe=False)

@csrf_exempt
@login_required
def toggleFollow(request):
    if request.method != "POST":
        return JsonResponse({
            "status": "use POST method"
        })
    data = json.loads(request.body)

    currentUser = request.user.pk
    followingId = data["followingid"]
    toToggle = data["toToggle"]

    if toToggle:
        # make the follower follow the following
        newFollow = Follow(follower=User.objects.get(pk=currentUser), followed=User.objects.get(pk=followingId))
        newFollow.save()
    else:
        # make the follower unfollow
        followObject = Follow.objects.get(follower=User.objects.get(pk=currentUser), followed=User.objects.get(pk=followingId))
        followObject.delete()

    return JsonResponse({
        "status": "action made"
    })

@csrf_exempt
@login_required
def toggleLike(request):
    if request.method != "POST":
        return JsonResponse({
            "status": "use POST method"
        })
    data = json.loads(request.body)

    currentUser = request.user.pk
    postId = data["postid"]
    toToggle = data["toToggle"]

    if toToggle:
        # make user like the post
        like = Like(post=Post.objects.get(pk=postId), user=User.objects.get(pk=currentUser))
        like.save()
        postObj = Post.objects.get(pk=postId)
        postObj.likes += 1
        postObj.save()
    else:
        # make user unlike the post
        likeObject = Like.objects.get(post=Post.objects.get(pk=postId), user=User.objects.get(pk=currentUser))
        likeObject.delete()
        postObj = Post.objects.get(pk=postId)
        postObj.likes -= 1
        postObj.save()

    return JsonResponse({
        "status": "action made"
    })

def getUser(request):
    if request.user.is_authenticated:
        return JsonResponse({"user": request.user.pk})
    else:
        return JsonResponse({"user": "false"})
    
@csrf_exempt
@login_required
def editPost(request):
    user = request.user
    postBody = request.POST["body"]
    userid = request.POST["userid"]
    postid = request.POST["postid"]

    if user.pk == int(userid):
        postObject = Post.objects.get(pk=int(postid))
        postObject.post = postBody
        postObject.save()

        return HttpResponseRedirect(reverse("index"))
