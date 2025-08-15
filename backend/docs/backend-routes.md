# Backend Routes Documentation

This documentation lists all backend routes for the FitFi application. Each route includes a link to its Swagger documentation and a detailed description.

Use this guide to find endpoint details, understand their purposes, and learn how to access them. It is intended for developers and API consumers working with the FitFi backend.

## Overview

The FitFi backend server runs locally by default at [http://localhost:3000](http://localhost:3000). If you have modified the `PORT` value in your `.env` file, the backend will be accessible at `http://localhost:<PORT>`, where `<PORT>` is the value you specified. Make sure to use the correct URL when accessing API endpoints or Swagger documentation.

All backend routes currently use the `/api/v1` prefix, indicating that these endpoints belong to version 1 of the API.

<span style="background-color: #fff3cd; color: #856404; padding: 8px 12px; border-radius: 4px; display: block; margin-bottom: 16px;">
<strong>Warning:</strong> The Swagger documentation file is currently not available, but it will be made in the future.
</span>

### API Version History

| Version | Status  | Description         |
| ------- | ------- | ------------------- |
| v1      | Current | Initial API version |

## API Endpoints

<table>
    <tr>
        <th></th>
        <th>Route</th>
        <th>Endpoint</th>
        <th>Description</th>
        <th>Swagger Link</th>
    </tr>
    <tr>
        <td><strong>Type</strong></td>
        <td><em>Auth</em></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td><a href="/#/./auth.md">Auth</a></td>
        <td><code>POST</code></td>
    <td><code>/api/v1/auth/wallet-auth</code></td>
        <td>Used to Login and Signup</td>
        <td><!-- Swagger link placeholder --></td>
    </tr>
    <tr>
        <td></td>
        <td><code>POST</code></td>
    <td><code>/api/v1/auth/wallet-get-message</code></td>
        <td>Used to request nonce from the back-end by sending wallet address</td>
        <td><!-- Swagger link placeholder --></td>
    </tr>
</table>
