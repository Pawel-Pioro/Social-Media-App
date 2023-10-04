
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posts" , views.posts, name="posts"),
    path("allposts", views.allPosts, name="allPosts"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("togglefollow", views.toggleFollow, name="toggleFollow"),
    path("togglelike", views.toggleLike, name="toggleLike"),
    path("getuser", views.getUser, name="getUser"),
    path("edit", views.editPost, name="editPost")
]
