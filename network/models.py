from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    post = models.CharField(max_length=500, blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True) 
    likes = models.IntegerField(default=0, blank=True, null=True, editable=False)

    def serialize(self):
        return {
            "id": self.user.pk,
            "user": self.user.username,
            "post": self.post,
            "postId": self.pk,
            "timestamp": self.timestamp.strftime("%H:%M - %b %d %Y"),
            "likes": self.likes,
            "usersLiked": list(Like.objects.filter(post=self).values_list('user'))
        }

class Follow(models.Model):
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed")
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower") 

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likedPost")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likedUser")