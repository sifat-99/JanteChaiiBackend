
# JanteChaii - Backend

This is the backend for a news portal application called JanteChaii. It is built with Node.js, Express.js, and MongoDB.

## Features

- User authentication (registration and login) for admins, reporters, and users.
- CRUD operations for admins, reporters, users, news, and categories.
- Reporters can publish, update, and delete news articles.
- Users can comment on news articles and reply to comments.
- News articles can be filtered by category and reporter.
- Multiple database connections for different user roles.

## API Endpoints

### Admin

- `POST /api/admins/login`: Login an admin.
- `GET /api/admins`: Get all admins.
- `GET /api/admins/:id`: Get a single admin by ID.
- `PUT /api/admins/:id`: Update an admin.
- `DELETE /api/admins/:id`: Delete an admin.

### User

- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Login a user.
- `GET /api/users`: Get all users.
- `GET /api/users/:id`: Get a single user by ID.
- `PUT /api/users/:id`: Update a user.
- `DELETE /api/users/:id`: Delete a user.

### Reporter

- `POST /api/reporters/register`: Register a new reporter.
- `POST /api/reporters/login`: Login a reporter.
- `GET /api/reporters`: Get all reporters.
- `GET /api/reporters/:id`: Get a single reporter by ID.
- `PUT /api/reporters/:id`: Update a reporter.
- `DELETE /api/reporters/:id`: Delete a reporter.

### Category

- `POST /api/categories`: Create a new category.
- `GET /api/categories`: Get all categories.
- `GET /api/categories/:id`: Get a single category by ID.
- `PUT /api/categories/:id`: Update a category.
- `DELETE /api/categories/:id`: Delete a category.

### News

- `POST /api/news/publish`: Publish a new news article.
- `PUT /api/news/:id`: Update a news article.
- `DELETE /api/news/:id`: Delete a news article.
- `GET /api/news`: Get all news articles.
- `GET /api/news/by-reporter/:email`: Get all news articles by a specific reporter.
- `GET /api/news/by-category/:category`: Get all news articles in a specific category.
- `GET /api/news/:id`: Get a single news article by ID.
- `POST /api/news/:id/comments`: Add a comment to a news article.
- `POST /api/news/:id/comments/:commentId/replies`: Add a reply to a comment.
- `GET /api/news/:id/comments`: Get all comments for a news article.

## Database Schema

The application uses multiple MongoDB databases for different user roles.

### Admin Schema

- `adminId`: String (unique)
- `email`: String (unique)
- `name`: String (unique)
- `password`: String
- `role`: String (enum: "admin")
- `profilePic`: String
- `createdAt`: Date

### User Schema

- `name`: String
- `email`: String (unique)
- `password`: String
- `role`: String (enum: "user")
- `profilePic`: String
- `createdAt`: Date

### Reporter Schema

- `reporterId`: String (unique)
- `name`: String (unique)
- `email`: String (unique)
- `password`: String
- `role`: String (enum: "reporter")
- `profilePic`: String
- `createdAt`: Date
- `status`: String (enum: "approved", "Pending", "fired")

### Category Schema

- `categoryId`: String (unique)
- `categoryName`: String (unique)
- `createdAt`: Date

### News Schema

- `title`: String
- `description`: String
- `pictureUrl`: String
- `category`: String
- `reporterEmail`: String
- `publishedAt`: Date
- `comments`: Array of CommentSchema

#### Comment Schema

- `commenterName`: String
- `commenterEmail`: String
- `content`: String
- `createdAt`: Date
- `replies`: Array of ReplySchema

#### Reply Schema

- `replierName`: String
- `replierEmail`: String
- `content`: String
- `createdAt`: Date

## Getting Started

1.  Clone the repository.
2.  Install the dependencies: `npm install`
3.  Create a `.env` file in the root directory and add the following environment variables:
    ```
    PORT=5000
    MONGO_URI=<your_mongodb_uri>
    DB_USER_NAME=users
    DB_REPORTER_NAME=reporters
    DB_ADMIN_NAME=admins
    JWT_SECRET=<your_jwt_secret>
    JWT_EXPIRES_IN=1d
    BCRYPT_SALT_ROUNDS=10
    ```
4.  Start the server: `npm start`

The server will be running on `http://localhost:5000`.
