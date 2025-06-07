# **Auth Routes Documentation**

This documentation provides details about the authentication routes available in the FitFi backend. These routes are essential for user login, signup, and nonce retrieval, enabling secure access to the platform.

## Flows <span style="color: rgb(203, 28, 28); font-weight: bold; font-size: 0.5em;">IMPORTANT</span>

<span style="background-color:rgb(255, 205, 205); color:rgb(133, 4, 4); padding: 8px 12px; border-radius: 4px; display: block; margin-bottom: 16px;">IMPORTANT: Sometimes, users need to follow a series of authentication steps to complete certain actions</span>

There are some endpoints that need to be called in a specific order to complete the authentication process. These flows are crucial for ensuring that users can securely log in, sign up, and interact with the platform.

- Those flows will also be documentated in this documentation.
- They will be explained after the explaining each endpoint that will be used in the flow.
- For example, a user might need to log in, retrieve a nonce, and then sign a message to complete the authentication process.

## General Request Structure

Each authentication route is documented using the following structure:

### Endpoint

- **URL:** The path to the API endpoint (e.g., `/api/auth/login`).
- **Method:** HTTP method used (e.g., `POST`, `GET`).

### Description

- Brief explanation of the endpoint's purpose.

### Request Headers

- List of required or optional headers (e.g., `Content-Type`, `Authorization`).

### Request Body

- **Parameters:**
  - List and describe all body parameters, including their types and whether they are required or optional.
- **Example:**
  ```json
  {
    "parameter1": "value",
    "parameter2": 123
  }
  ```

### Response

- **Success Response:**
  - **Status Code:** (e.g., `200 OK`)
  - **Body:** Example and description of the response payload.
- **Error Responses:**
  - **Status Code:** (e.g., `400 Bad Request`)
  - **Body:** Example and description of possible error messages.

### Notes

- Any additional information, such as authentication requirements, rate limits, or special considerations.

<span style="background-color:rgb(205, 248, 255); color:rgb(4, 107, 133); padding: 8px 12px; border-radius: 4px; display: block; margin-bottom: 16px;">
Next several sections will cover the authentication routes, including their purposes, request methods, and expected responses.
</span>

---

Use this structure to document each authentication route in detail.

# Endpoints

Endpoints will be documented in the following sections, starting with the nonce retrieval endpoint and followed by the login and signup verification endpoint.

// light color for highlight

## <p style="color: rgb(0, 123, 255); font-weight: bold;background-color: rgb(240, 248, 255);">Get Nonce</p>

### URL

`/api/v1/auth/get-nonce`

### Method

`POST`

### Description

Used to request a nonce from the backend by sending the user's wallet address. This nonce is required for signing messages during the login or signup process.

### Request Headers

- `Content-Type`: `application/json`

### Request Body

```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

### Response

#### Success Response

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "message": "Nonce generated successfully",
    "details": {
      "title": "Nonce Generated",
      "description": "A nonce has been generated for the provided wallet address."
    },
    "success": true,
    "status": "success",
    "statusCode": 200,
    "data": {
      "nonce": "0xabcdef1234567890abcdef1234567890abcdef12"
    }
  }
  ```

#### Error Responses

- **Missing Wallet Address**
  - **Status Code:** `400 Bad Request`
  - **Body:**
    ```json
    {
      "details": {
        "title": "Missing Wallet Address",
        "description": "The wallet address field is required in the request body.",
        "context": {
          "1": "walletAddress parameter is undefined or empty",
          "2": "Client did not provide a wallet address for authentication"
        }
      },
      "success": false,
      "status": "fail",
      "statusCode": 400
    }
    ```
- **User Creation Failed**
  - **Status Code:** `500 Internal Server Error`
  - **Body:**
    ```json
    {
      "success": false,
      "message": "User not found after creation",
      "data": null,
      "error": {
        "title": "User Creation Failed",
        "description": "User could not be found after creation attempt.",
        "context": {
          "1": "User.create returned null or undefined",
          "2": "Possible database issue or validation error"
        }
      },
      "status": "error",
      "statusCode": 500
    }
    ```

### Notes

- The nonce is a unique value that must be signed by the user to authenticate their session.
- Ensure the wallet address is valid and properly formatted.

---

## <p style="color: rgb(0, 123, 255); font-weight: bold;background-color: rgb(240, 248, 255);">Verify and Login</p>

### URL

`/api/v1/auth/verify-and-login`

### Method

`POST`

### Description

Used to log in or sign up a user by verifying their wallet address and signed message. This endpoint handles both login and signup flows based on whether the user already exists.

### Request Headers

- `Content-Type`: `application/json`

### Request Body

```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "signature": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

### Response

#### Success Response

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "message": "Login successful",
    "details": {
      "title": "Successfully logged in",
      "description": "You were able to login succssfully"
    },
    "status": "success",
    "statusCode": 200,
    "success": true,
    "data": {
      "token": "jwt_token_string_here",
      "user": {
        "_id": "user_id_here",
        "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
      }
    }
  }
  ```

#### Error Responses

- **Missing Parameters**
  - **Status Code:** `400 Bad Request`
  - **Body:**
    ```json
    {
      "details": {
        "title": "Insufficient parameters",
        "description": "Either the wallet address or signature is not sent the frontend",
        "context": {
          "values": {
            "walletAddress": "undefined",
            "signature": "undefined"
          }
        }
      },
      "status": "fail",
      "statusCode": 400
    }
    ```
- **Wallet Not Found**
  - **Status Code:** `400 Bad Request`
  - **Body:**
    ```json
    {
      "details": {
        "title": "Wallet not found",
        "description": "Wallet not found. Please request nonce first.",
        "context": {
          "values": {
            "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
          }
        }
      },
      "status": "fail",
      "statusCode": 400
    }
    ```
- **Signature Verification Failed**
  - **Status Code:** `401 Unauthorized`
  - **Body:**
    ```json
    {
      "details": {
        "title": "Signature verification failed",
        "description": "The provided signature could not be verified.",
        "context": {
          "values": {
            "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
            "signature": "0xabcdef1234567890abcdef1234567890abcdef12"
          }
        }
      },
      "status": "fail",
      "statusCode": 401
    }
    ```
- **Invalid Signature**
  - **Status Code:** `401 Unauthorized`
  - **Body:**
    ```json
    {
      "details": {
        "title": "Invalid signature",
        "description": "Invalid signature for given wallet address.",
        "context": {
          "values": {
            "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
            "signature": "0xabcdef1234567890abcdef1234567890abcdef12"
          }
        }
      },
      "status": "fail",
      "statusCode": 401
    }
    ```

### Notes

- The endpoint expects both `walletAddress` and `signature` in the request body.
- The nonce must be retrieved first using the `/get-nonce` endpoint.
- On successful verification, a JWT token is returned for authenticated access.
- The nonce is updated after each successful login to prevent replay attacks.
