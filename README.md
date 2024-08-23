# React + Vite

A simple react-based blog web app built with vite, to fetch data from backend API.

Tech stack : React / Bootstrap / Express / postgreSql / JWT Auth

- FrontEnd - React Client : https://odin-blog-api-client-prisma.netlify.app
- FrontEnd - React Admin : https://odin-blog-api-client-admin-prisma.netlify.app
- Backend - Express + prisma + postgreSQL : https://odin-blog-api-prisma-psql.adaptable.app

Authentication API with JWT :

- POST http://[url]/v1/user/sign-in/
- POST http://[url]/v1/user/sign-up/

API :

1. POST-CRUD

- GET http://[url]/v1/posts
- POST http://[url]/v1/posts
- GET http://[url]/v1/posts/[post_id]
- PUT http://[url]/v1/posts/[post_id]
- DELETE http://[url]/v1/posts/[post_id]

2. COMMENT-CRUD
- GET http://[url]/v1/comments/[post_id]
- POST http://[url]/v1/comments/[post_id]
- PUT http://[url]/v1/comments/[comment_id]
- DELETE http://[url]/v1/comments/[comment_id]


