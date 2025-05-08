export const mockArticles = {
      "articles": [
        {
          "slug": "mock-article-1",
          "title": "Vitalina title",
          "description": "Vitalina description",
          "body": "Mock article body",
          "tagList": ["test", "mock"],
          "createdAt": new Date().toISOString(),
          "updatedAt": new Date().toISOString(),
          "favorited": false,
          "favoritesCount": 0,
          "author": {
            "username": "mockuser",
            "bio": null,
            "image": "https://api.realworld.io/images/demo-avatar.png",
            "following": false
          }
        }
      ],
      "articlesCount": 1
};