# Hedera Hack Backend API

This document provides information about the AI Assistant API endpoints and how to use them.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with required environment variables
4. Start the server:
   ```
   npm start
   ```

The API will be available at `http://localhost:3000` by default.

## API Endpoints

### Assistant API

All assistant endpoints are available under `/api/assistant`.

#### Initialize Assistant

Creates a new assistant session or initializes an existing one.

- **URL:** `/api/assistant/init`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "userId": "optional-user-id"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Code assistant initialized successfully",
    "userId": "generated-or-provided-user-id",
    "profile": {}
  }
  ```

#### Send Message

Send a message to the assistant and get a response.

- **URL:** `/api/assistant/message`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "userId": "your-user-id",
    "message": "How do I implement a binary search tree in JavaScript?"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "userId": "your-user-id",
    "response": "To implement a binary search tree in JavaScript..."
  }
  ```

#### Analyze GitHub Repository

Have the assistant analyze a GitHub repository.

- **URL:** `/api/assistant/analyze/github`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "userId": "your-user-id",
    "repoUrl": "https://github.com/username/repository"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "userId": "your-user-id",
    "repoUrl": "https://github.com/username/repository",
    "response": "Analysis of the repository..."
  }
  ```

#### Analyze Code Snippet

Have the assistant analyze a code snippet.

- **URL:** `/api/assistant/analyze/code`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "userId": "your-user-id",
    "code": "function example() { return 'Hello World'; }",
    "language": "javascript"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "userId": "your-user-id",
    "language": "javascript",
    "response": "Analysis of the code snippet..."
  }
  ```

#### Analyze Resume

Upload and analyze a resume PDF.

- **URL:** `/api/assistant/analyze/resume`
- **Method:** `POST`
- **Form Data:**
  - `userId`: Your user ID (optional)
  - `resume`: PDF file (required)
- **Response:**
  ```json
  {
    "success": true,
    "userId": "your-user-id",
    "filePath": "uploads/resume-1234567890.pdf",
    "response": "Analysis of the resume..."
  }
  ```

#### Get User Profile

Retrieve a user's profile information.

- **URL:** `/api/assistant/profile/:userId`
- **Method:** `GET`
- **URL Parameters:** `userId` - The ID of the user
- **Response:**
  ```json
  {
    "success": true,
    "userId": "your-user-id",
    "profile": {
      // Profile information
    }
  }
  ```

## Error Handling

All endpoints return appropriate status codes and error messages in case of failure:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Examples

### cURL Examples

#### Initialize Assistant
```bash
curl -X POST http://localhost:3000/api/assistant/init \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

#### Send Message
```bash
curl -X POST http://localhost:3000/api/assistant/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "How do I write a React component?"}'
```

#### Analyze GitHub Repository
```bash
curl -X POST http://localhost:3000/api/assistant/analyze/github \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "repoUrl": "https://github.com/facebook/react"}'
```

#### Analyze Code Snippet
```bash
curl -X POST http://localhost:3000/api/assistant/analyze/code \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "code": "const sum = (a, b) => a + b;", "language": "javascript"}'
```

#### Upload and Analyze Resume
```bash
curl -X POST http://localhost:3000/api/assistant/analyze/resume \
  -F "userId=user123" \
  -F "resume=@/path/to/resume.pdf"
```

#### Get User Profile
```bash
curl -X GET http://localhost:3000/api/assistant/profile/user123
```
