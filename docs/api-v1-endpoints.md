# Klinik PKP API v1 - Module Endpoint Documentation

This document covers all implemented module endpoints under `/api/v1`.

Excluded intentionally:
- `/api/v1/` (main route)
- `/api/v1/health` (health route)

## 1. Global API Conventions

### 1.1 Base URL
- Base path: `/api/v1`

### 1.2 Response Envelope
- Success response:

```json
{
  "success": true,
  "message": "success",
  "data": {}
}
```

- Error response:

```json
{
  "success": false,
  "error": "error message"
}
```

### 1.3 Common Pagination Query (List Endpoints)
Most list endpoints support:
- `page` (optional, integer, default `1`, must be `>= 1`)
- `limit` (optional, integer, default `10`, must be `>= 1`, max `10`)

Returned paginated data shape:

```json
{
  "items": [],
  "total_records": 0,
  "page": 1,
  "limit": 10
}
```

### 1.4 Authentication Rules
- Protected endpoints require `Authorization: Bearer <access_token>`.
- Refresh flow uses HTTP-only cookie: `refresh_token`.
- CORS allows credentials, so browser clients must send credentials for refresh/logout requests.

### 1.5 ID Types
- Path params like `:id` for province/region/district/village and similar modules are parsed as unsigned integers.
- User IDs are UUID.

## 2. Authentication Module

Route group: `/authentications`

### 2.1 POST /api/v1/authentications
Create login session.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User email (must be valid email format). |
| `nip` | string | Yes | User NIP, must match account data. |
| `password` | string | Yes | Plain password for credential verification. |

Behavior:
- Verifies email, NIP, active status, and password.
- Creates refresh token record in database.
- Sets `refresh_token` HTTP-only cookie.
- Returns access token in response body.

Success response (`201`):
- `data.id` (user UUID)
- `data.access_token` (JWT)

Common errors:
- `400` invalid body/validation
- `401` wrong password
- `404` user not found/inactive/NIP mismatch

### 2.2 PUT /api/v1/authentications
Refresh access token using refresh token cookie.

- Auth: Public (cookie-based)
- Body: None
- Required cookie: `refresh_token`

Success response (`200`):
- `data.access_token` (new JWT)

Common errors:
- `401` missing/invalid/expired refresh token

### 2.3 DELETE /api/v1/authentications
Terminate session (logout).

- Auth: Public (cookie-based)
- Body: None
- Cookie: `refresh_token` (optional)

Behavior:
- If cookie exists and token is found, token is deleted from DB.
- If cookie is missing or token already absent, endpoint still succeeds.
- Always clears `refresh_token` cookie client-side.

Success response (`200`):
- Message: `session terminated`

## 3. User Module

Route group: `/users`

### Access Control Summary
- `GET /users` and `POST /users` require authenticated admin role.
- `GET /users/:id` requires authentication.
  - Supports `:id = me` to fetch own profile.
  - Non-admin users cannot read other users.
- `PUT /users/:id` requires authentication and can only update own profile.

### 3.1 GET /api/v1/users
Get paginated users list.

- Auth: `Bearer` token + role `admin`
- Query: `page`, `limit`
- Body: None

Success response (`200`):
- Paginated list of users.

Common errors:
- `401` missing/invalid token
- `403` non-admin role
- `400` invalid pagination query

### 3.2 GET /api/v1/users/:id
Get user by UUID, or own profile using `me`.

- Auth: `Bearer` token
- Path params:
  - `id` (UUID or literal `me`)
- Body: None

Rules:
- `id = me`: returns currently authenticated user.
- `id = <uuid>`: admin can view any user; non-admin only own UUID.

Common errors:
- `400` invalid UUID format
- `403` forbidden access to other user profile
- `404` user not found

### 3.3 POST /api/v1/users
Create a new user.

- Auth: `Bearer` token + role `admin`
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Must not be null-like string. |
| `email` | string | Yes | Valid email format. |
| `nip` | string | Yes | Unique NIP value. |
| `password` | string | Yes | Plain password; hashed before save. |
| `phone` | string | No | Phone number. |
| `role` | string | Yes | Allowed values: `admin`, `user`. |
| `is_active` | boolean | Yes | Active status flag. |

Success response (`201`):
- `data.id` (new user UUID)

### 3.4 PUT /api/v1/users/:id
Update current user profile.

- Auth: `Bearer` token
- Path params:
  - `id` (UUID, must equal authenticated user ID)
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Must not be null-like string. |
| `phone` | string | No | Updated phone number. |

Rules:
- Endpoint forbids updating another user even for admin.

Common errors:
- `400` invalid UUID or invalid body
- `403` trying to edit another user
- `404` user not found

## 4. Province Module

Route group: `/provinces`

### 4.1 GET /api/v1/provinces
Get paginated provinces.

- Auth: Public
- Query: `page`, `limit`

### 4.2 GET /api/v1/provinces/:id
Get province by ID.

- Auth: Public
- Path params:
  - `id` (uint64)

### 4.3 POST /api/v1/provinces
Create province.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Province name, must not be null-like string. |

### 4.4 PUT /api/v1/provinces/:id
Update province by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 4.5 DELETE /api/v1/provinces/:id
Soft-delete province by ID.

- Auth: Public
- Path params: `id` (uint64)

## 5. Region Module

Route group: `/regions`

### 5.1 GET /api/v1/regions
Get paginated regions, optionally filtered by province.

- Auth: Public
- Query:
  - `province_id` (optional, uint64)
  - `page`, `limit`

### 5.2 GET /api/v1/regions/:id
Get region by ID.

- Auth: Public
- Path params: `id` (uint64)

### 5.3 POST /api/v1/regions
Create region.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Region name, must not be null-like string. |
| `province_id` | string | Yes | Province ID as numeric string. |

### 5.4 PUT /api/v1/regions/:id
Update region by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 5.5 DELETE /api/v1/regions/:id
Soft-delete region by ID.

- Auth: Public
- Path params: `id` (uint64)

## 6. District Module

Route group: `/districts`

### 6.1 GET /api/v1/districts
Get paginated districts, optionally filtered by region.

- Auth: Public
- Query:
  - `region_id` (optional, uint64)
  - `page`, `limit`

### 6.2 GET /api/v1/districts/:id
Get district by ID.

- Auth: Public
- Path params: `id` (uint64)

### 6.3 POST /api/v1/districts
Create district.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | District name, must not be null-like string. |
| `region_id` | string | Yes | Region ID as numeric string. |

### 6.4 PUT /api/v1/districts/:id
Update district by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 6.5 DELETE /api/v1/districts/:id
Soft-delete district by ID.

- Auth: Public
- Path params: `id` (uint64)

## 7. Village Module

Route group: `/villages`

### 7.1 GET /api/v1/villages
Get paginated villages, optionally filtered by district.

- Auth: Public
- Query:
  - `district_id` (optional, uint64)
  - `page`, `limit`

### 7.2 GET /api/v1/villages/:id
Get village by ID.

- Auth: Public
- Path params: `id` (uint64)

### 7.3 POST /api/v1/villages
Create village.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Village name, must not be null-like string. |
| `district_id` | string | Yes | District ID as numeric string. |

### 7.4 PUT /api/v1/villages/:id
Update village by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 7.5 DELETE /api/v1/villages/:id
Soft-delete village by ID.

- Auth: Public
- Path params: `id` (uint64)

## 8. BSPS Module

Route group: `/bsps`

### 8.1 GET /api/v1/bsps
Get paginated BSPS records with optional filters.

- Auth: Public
- Query:
  - `village_id` (optional, uint64)
  - `district_id` (optional, uint64)
  - `region_id` (optional, uint64)
  - `status` (optional, string)
  - `page`, `limit`

### 8.2 GET /api/v1/bsps/:id
Get BSPS by ID.

- Auth: Public
- Path params: `id` (uint64)

### 8.3 POST /api/v1/bsps
Create BSPS record.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `village_id` | string | Yes | Village ID as numeric string. |
| `district_id` | string | Yes | District ID as numeric string. |
| `region_id` | string | Yes | Region ID as numeric string. |
| `unit_count` | number | No | Number of units. |
| `year_given` | number | No | Allocation year. |
| `status` | string | Yes | Expected values: `Rencana`, `Dalam Proses`, `Selesai`. |
| `coordinate` | object | Yes | Coordinate object with latitude/longitude. |

Coordinate object:

```json
{
  "latitude": 3.5952,
  "longitude": 98.6722
}
```

### 8.4 PUT /api/v1/bsps/:id
Update BSPS by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 8.5 DELETE /api/v1/bsps/:id
Soft-delete BSPS by ID.

- Auth: Public
- Path params: `id` (uint64)

## 9. Kawasan Kumuh Module

Route group: `/kumuh`

### 9.1 GET /api/v1/kumuh
Get paginated kawasan kumuh records with filters.

- Auth: Public
- Query:
  - `region_id` (optional, uint64)
  - `district_id` (optional, uint64)
  - `village_id` (optional, uint64)
  - `area_name` (optional, string, partial match)
  - `year_inspected` (optional, uint64)
  - `page`, `limit`

Special note:
- `village_id` filter is implemented via village-name lookup and `LIKE` query against `villages` text field.

### 9.2 GET /api/v1/kumuh/:id
Get kawasan kumuh by ID.

- Auth: Public
- Path params: `id` (uint64)

### 9.3 POST /api/v1/kumuh
Create kawasan kumuh record.

- Auth: Public
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Description |
|---|---|---|---|
| `district_id` | string | Yes | District ID as numeric string. |
| `region_id` | string | Yes | Region ID as numeric string. |
| `area_name` | string | Yes | Area name. |
| `environments` | string | Yes | Environment descriptor. |
| `villages` | string | Yes | Village names/text representation in area. |
| `total_area` | number | Yes | Total area value. |
| `total_population` | number | Yes | Population count. |
| `slum_value` | number | Yes | Slum score/value. |
| `year_inspected` | number | Yes | Inspection year. |
| `coordinate` | object | Yes | Coordinate object with latitude/longitude. |

### 9.4 PUT /api/v1/kumuh/:id
Update kawasan kumuh by ID.

- Auth: Public
- Path params: `id` (uint64)
- Body: same as create

### 9.5 DELETE /api/v1/kumuh/:id
Soft-delete kawasan kumuh by ID.

- Auth: Public
- Path params: `id` (uint64)

## 10. Rusun Module

Route group: `/rusun`

### 10.1 GET /api/v1/rusun
Get paginated rusun records with optional location filters.

- Auth: Public
- Query:
  - `village_id` (optional, uint64)
  - `district_id` (optional, uint64)
  - `region_id` (optional, uint64)
  - `page`, `limit`

### 10.2 GET /api/v1/rusun/:id
Get rusun by ID.

- Auth: Public
- Path params: `id` (uint64)

### 10.3 POST /api/v1/rusun
Create rusun record with image upload.

- Auth: Public
- Content-Type: `multipart/form-data`

Form fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `village_id` | string | Yes | Village ID as numeric string. |
| `district_id` | string | Yes | District ID as numeric string. |
| `region_id` | string | Yes | Region ID as numeric string. |
| `name` | string | Yes | Rusun name. |
| `address` | string | Yes | Address text. |
| `tower` | number | Yes | Number of towers. |
| `unit_type` | string | Yes | Unit type descriptor. |
| `floor` | number | Yes | Floor count. |
| `unit_count` | number | Yes | Total units. |
| `year_given` | number | Yes | Allocation year. |
| `coordinate` | string | Yes | JSON string of coordinate object. |
| `images` | file[] | Yes | Image upload (service max: 1 file). |

`coordinate` must be a JSON string, for example:

```text
{"latitude":3.5952,"longitude":98.6722}
```

Success response (`201`) includes:
- `data.id`
- `data.image_urls`

### 10.4 PUT /api/v1/rusun/:id
Update rusun by ID, supports replacing images.

- Auth: Public
- Path params: `id` (uint64)
- Content-Type: `multipart/form-data`
- Form fields: same as create endpoint

Notes:
- If new images are uploaded, old images are cleaned up after successful commit.

### 10.5 DELETE /api/v1/rusun/:id
Soft-delete rusun and asynchronously clean associated image files.

- Auth: Public
- Path params: `id` (uint64)

## 11. Bank Desain Module

Route group: `/bank-desain`

### 11.1 GET /api/v1/bank-desain
Get paginated bank desain records with optional filters.

- Auth: Public
- Query:
  - `type` (optional, string)
  - `bedroom_count` (optional, uint64)
  - `bathroom_count` (optional, uint64)
  - `has_garage` (optional, bool-like string)
  - `name` (optional, string, partial match)
  - `page`, `limit`

Notes:
- `has_garage=true` or `has_garage=1` maps to true.
- Any other non-empty value maps to false.

### 11.2 GET /api/v1/bank-desain/:id
Get bank desain by ID.

- Auth: Public
- Path params: `id` (uint64)

### 11.3 POST /api/v1/bank-desain
Create bank desain with image and PDF file upload.

- Auth: Public
- Content-Type: `multipart/form-data`

Form fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Design name. |
| `type` | string | Yes | Expected values: `Tipe 36`, `Tipe 45`, `Tipe 54`, `Rusun`. |
| `bedroom_count` | number | Yes | Number of bedrooms. |
| `bathroom_count` | number | Yes | Number of bathrooms. |
| `total_area` | number | Yes | Total area. |
| `has_garage` | boolean | Yes | Garage availability. |
| `images` | file[] | Yes | Images (service max: 8). |
| `files` | file[] | Yes | Document files (service max: 1, PDF expected). |

Success response (`201`) includes:
- `data.id`
- `data.image_urls`
- `data.file_urls`

### 11.4 PUT /api/v1/bank-desain/:id
Update bank desain by ID, supports replacing image/file assets.

- Auth: Public
- Path params: `id` (uint64)
- Content-Type: `multipart/form-data`
- Form fields: same as create endpoint

### 11.5 DELETE /api/v1/bank-desain/:id
Soft-delete bank desain and asynchronously clean image/file assets.

- Auth: Public
- Path params: `id` (uint64)

## 12. Sosialisasi Module

Route group: `/sosialisasi`

### 12.1 GET /api/v1/sosialisasi
Get paginated sosialisasi records with optional filters.

- Auth: Public
- Query:
  - `village_id` (optional, uint64)
  - `district_id` (optional, uint64)
  - `region_id` (optional, uint64)
  - `location` (optional, string, partial match)
  - `title` (optional, string, partial match)
  - `page`, `limit`

### 12.2 GET /api/v1/sosialisasi/:id
Get sosialisasi by ID.

- Auth: Public
- Path params: `id` (uint64)

### 12.3 POST /api/v1/sosialisasi
Create sosialisasi record with optional images.

- Auth: Public
- Content-Type: `multipart/form-data`

Form fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `village_id` | string | Yes | Village ID as numeric string. |
| `district_id` | string | Yes | District ID as numeric string. |
| `region_id` | string | Yes | Region ID as numeric string. |
| `title` | string | Yes | Event title. |
| `location` | string | Yes | Event location. |
| `description` | string | Yes | Event description. |
| `scheduled_at_start` | string | Yes | Start datetime, RFC3339 format. |
| `scheduled_at_end` | string | Yes | End datetime, RFC3339 format. |
| `coordinate` | string | Yes | JSON string of coordinate object. |
| `images` | file[] | No | Optional images (service max: 4). |

Datetime format example:

```text
2026-04-01T09:00:00Z
```

Coordinate string example:

```text
{"latitude":3.5952,"longitude":98.6722}
```

### 12.4 PUT /api/v1/sosialisasi/:id
Update sosialisasi by ID, supports replacing images.

- Auth: Public
- Path params: `id` (uint64)
- Content-Type: `multipart/form-data`
- Form fields: same as create endpoint

### 12.5 DELETE /api/v1/sosialisasi/:id
Soft-delete sosialisasi and asynchronously clean image assets.

- Auth: Public
- Path params: `id` (uint64)

## 13. Uploads Static Access Module

Route group: `/uploads`

### 13.1 GET /api/v1/uploads/*
Serve static files from storage directory.

- Auth: Public
- Body: None
- Use this endpoint to access URLs returned by modules (`image_urls`, `file_urls`).

Example:
- Stored path in data: `uploads/rusun/10/rusun_xxx.jpg`
- Access URL: `/api/v1/uploads/rusun/10/rusun_xxx.jpg`

## 14. File Upload Constraints

These constraints apply to modules using upload service.

### 14.1 Image Validation
- Max file size per image: `2 MB`
- Allowed image mime types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`, `image/x-icon`, `image/svg+xml`
- Allowed image extensions: `.jpeg`, `.jpg`, `.png`, `.gif`, `.webp`

### 14.2 PDF Validation
- Max file size per PDF: `10 MB`
- Allowed mime type: `application/pdf`
- Allowed extension: `.pdf`

### 14.3 Effective Body Limit
- Application body limit is configured at `4 MB`.
- Practically, requests larger than this may be rejected before per-file validation runs.

## 15. Common Error Scenarios

- `400 Bad Request`
  - Invalid path param format (non-numeric ID / invalid UUID)
  - Invalid query values (`page`, `limit`, filters)
  - Invalid JSON or multipart form structure
  - Validation failures (`required`, null-like text, etc.)

- `401 Unauthorized`
  - Missing/invalid bearer token on protected user routes
  - Missing/invalid refresh cookie on token refresh

- `403 Forbidden`
  - Role mismatch for admin-only user endpoints
  - Non-owner trying to read/update another user profile

- `404 Not Found`
  - Record not found by ID

- `500 Internal Server Error`
  - Database errors, upload failures, parsing/storage failures
