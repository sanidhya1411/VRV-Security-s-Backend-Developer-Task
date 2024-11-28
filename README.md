# Blog Post Management API

This repository contains the backend code for a **Blog Post Management API**. The API allows users to create, read, update, and delete (CRUD) blog posts, as well as manage user-related post information. It also integrates **Cloudinary** for image hosting and includes role-based access controls.

---

## Features

### User Features
- **Create Posts:** Users can create blog posts with a title, category, description, and thumbnail.
- **View Posts:**
  - View all posts.
  - View posts filtered by category.
  - View posts created by a specific user.
  - View a single post by its ID.
- **Edit Posts:** Users can edit their own posts, including updating the thumbnail image.
- **Delete Posts:** Users can delete their own posts, along with their associated thumbnails from Cloudinary.

---

## Technologies Used
- **Node.js**: Backend runtime.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user and post data.
- **Mongoose**: ODM library for MongoDB.
- **Cloudinary**: For image hosting and management.
- **JWT (JSON Web Tokens)**: Authentication and authorization.
- **Custom Error Handling**: Centralized error management using `HttpError`.

---

## Installation and Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sanidhya1411/VRV-Security-s-Backend-Developer-Task.git
   cd VRV-Security-s-Backend-Developer-Task
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the Server**
   ```bash
   npm start
   ```
   The server will start on the specified `PORT` (default: 5000).

---

## API Endpoints
---
### User Routes

| HTTP Method | Endpoint               | Description                                              | Controller Function | Authentication |
|-------------|------------------------|----------------------------------------------------------|---------------------|-----------------|
| **POST**    | `/register`            | Register a new user.                                     | `registerUser`      | Not Required    |
| **POST**    | `/login`               | Authenticate user and provide access token.              | `loginUser`         | Not Required    |
| **GET**     | `/:id`                 | Retrieve a specific user by ID.                          | `getUser`           | Not Required    |
| **GET**     | `/`                    | Retrieve all users (authors).                            | `getAuthors`        | Not Required    |
| **POST**    | `/change-avatar`       | Change or upload user avatar.                            | `changeAvatar`      | Required        |
| **PATCH**   | `/edit-user`           | Edit a user's profile.                                   | `editUser`          | Required        |
| **POST**    | `/forgotPassword`      | Start password recovery process.                         | `ForgotPassword`    | Not Required    |
| **PATCH**   | `/resetPassword/:token`| Reset the user's password using the provided token.      | `ResetPassword`     | Not Required    |
| **POST**    | `/verify`              | Send a verification email to the user.                   | `verifyMail`        | Not Required    |
| **PATCH**   | `/verified/:token`     | Verify a user's email address using the provided token.  | `verifiedMail`      | Not Required    |

---
### Post Routes


| HTTP Method | Endpoint               | Description                                   | Controller Function  | Authentication |
|-------------|------------------------|-----------------------------------------------|----------------------|-----------------|
| **POST**    | `/`                    | Create a new post.                           | `createPost`         | Required        |
| **GET**     | `/`                    | Retrieve all posts.                          | `getPosts`           | Not Required    |
| **GET**     | `/:id`                 | Retrieve a post by its ID.                   | `getPost`            | Not Required    |
| **GET**     | `/categories/:category`| Retrieve posts by category.                  | `getCatPosts`        | Not Required    |
| **GET**     | `/users/:id`           | Retrieve posts created by a specific user.   | `getUserPosts`       | Not Required    |
| **PATCH**   | `/:id`                 | Edit a specific post by its ID.              | `editPost`           | Required        |
| **DELETE**  | `/:id`                 | Delete a specific post by its ID.            | `deletePost`         | Required        |

---
### API Endpoints for User

---

### **Register a User**  
**Method**: POST  
**Endpoint**: `/api/users/register`  
**Body**:  
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securepassword",
  "password2": "securepassword"
}
```  
**Response**:  
```json
{
  "message": "new user user@example.com registered"
}
```

---

### **Log In a User**  
**Method**: POST  
**Endpoint**: `/api/users/login`  
**Body**:  
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```  
**Response**:  
```json
{
  "token": "auth_token",
  "id": "user_id",
  "name": "User Name",
  "expiryDate": "2024-12-01T14:00:00Z"
}
```

---

### **Get a User by ID**  
**Method**: GET  
**Endpoint**: `/api/users/:id`  
**Response**:  
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "avatar": "avatar_url"
}
```

---

### **Get All Authors**  
**Method**: GET  
**Endpoint**: `/api/users`  
**Response**:  
```json
[
  {
    "_id": "user_id1",
    "name": "Author 1",
    "email": "author1@example.com",
    "avatar": "avatar_url"
  },
  {
    "_id": "user_id2",
    "name": "Author 2",
    "email": "author2@example.com",
    "avatar": "avatar_url"
  }
]
```

---

### **Edit User Profile**  
**Method**: PATCH  
**Endpoint**: `/api/users/edit`  
**Authorization**: Requires Bearer Token  
**Body**:  
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "currentPassword": "currentpassword",
  "newPassword": "newpassword",
  "confirmNewPassword": "newpassword"
}
```  
**Response**:  
```json
{
  "_id": "user_id",
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

---

### **Change User Avatar**  
**Method**: POST  
**Endpoint**: `/api/users/change-avatar`  
**Authorization**: Requires Bearer Token  
**Body**:  
- `avatar` (file upload in `form-data`)  
**Response**:  
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "avatar": "new_avatar_url"
}
```

---

### **Forgot Password**  
**Method**: POST  
**Endpoint**: `/api/users/forgot-password`  
**Body**:  
```json
{
  "email": "user@example.com"
}
```  
**Response**:  
```json
{
  "message": "Mail sent"
}
```

---

### **Reset Password**  
**Method**: PATCH  
**Endpoint**: `/api/users/reset-password/:token`  
**Body**:  
```json
{
  "password": "newpassword",
  "password2": "newpassword"
}
```  
**Response**:  
```json
{
  "_id": "user_id",
  "message": "Password updated successfully"
}
```

---

### **Verify Email**  
**Method**: POST  
**Endpoint**: `/api/users/verify-mail`  
**Body**:  
```json
{
  "email": "user@example.com"
}
```  
**Response**:  
```json
{
  "message": "Mail sent"
}
```

---

### **Verified Mail**  
**Method**: GET  
**Endpoint**: `/api/users/verified/:token`  
**Response**:  
```json
{
  "_id": "user_id",
  "verified": true
}
```
### **Posts**

#### Create a Post
- **Method:** `POST`
- **Endpoint:** `/api/posts`
- **Authorization:** Requires `Bearer Token`
- **Body:**
  ```json
  {
    "title": "Post Title",
    "category": "Post Category",
    "description": "Post Description",
    "thumbnail": "file (form-data)"
  }
  ```
- **Response:**
  ```json
  {
    "_id": "post_id",
    "title": "Post Title",
    "category": "Post Category",
    "description": "Post Description",
    "thumbnail": "thumbnail_url",
    "creator": "user_id"
  }
  ```

#### Get All Posts
- **Method:** `GET`
- **Endpoint:** `/api/posts`
- **Response:** List of all posts.

#### Get Post by ID
- **Method:** `GET`
- **Endpoint:** `/api/posts/:id`

#### Get Posts by Category
- **Method:** `GET`
- **Endpoint:** `/api/posts/category/:category`

#### Get Posts by User
- **Method:** `GET`
- **Endpoint:** `/api/posts/user/:id`

#### Edit a Post
- **Method:** `PATCH`
- **Endpoint:** `/api/posts/:id`
- **Authorization:** Requires `Bearer Token` (creator only)
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "category": "Updated Category",
    "description": "Updated Description",
    "thumbnail": "file (form-data)"
  }
  ```

#### Delete a Post
- **Method:** `DELETE`
- **Endpoint:** `/api/posts/:id`
- **Authorization:** Requires `Bearer Token` (creator only)
- **Response:**
  ```json
  {
    "message": "Post deleted"
  }
  ```

---

## Error Handling

All errors are handled through the `HttpError` class. Common errors include:
- `400`: Bad Request (e.g., missing fields).
- `403`: Forbidden (e.g., unauthorized access).
- `404`: Not Found (e.g., post doesn't exist).
- `500`: Internal Server Error.

---

## Cloudinary Configuration

Cloudinary is used for storing and managing post thumbnails:
- Thumbnails are uploaded with a quality of 70% to optimize size.
- Thumbnails are deleted when their associated posts are removed.

---
### Testing Backend Code  

To test the backend functionalities use the provided test credentials:  

**Email**: `test@sanidhyablogtest.com`  
**Password**: `Test123456`  

---

