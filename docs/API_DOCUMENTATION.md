# Klinik PKP Sumatera Utara API Documentation

> **Base URL:** `/api/v1`
> **Framework:** Go Fiber
> **Max Body Size:** 4 MB
> **Version:** 1.0.0

---

## Table of Contents

1. [General Information](#1-general-information)
2. [Response Format](#2-response-format)
3. [Root & Health Endpoints](#3-root--health-endpoints)
4. [Users](#4-users)
5. [Provinces](#5-provinces)
6. [Regions](#6-regions)
7. [Districts](#7-districts)
8. [Villages](#8-villages)
9. [BSPS (Bantuan Stimulan Perumahan Swadaya)](#9-bsps-bantuan-stimulan-perumahan-swadaya)
10. [Kawasan Kumuh (Slum Areas)](#10-kawasan-kumuh-slum-areas)
11. [Rusun (Rumah Susun)](#11-rusun-rumah-susun)
12. [Bank Desain](#12-bank-desain)
13. [Sosialisasi](#13-sosialisasi)
14. [Static File Uploads](#14-static-file-uploads)

---

## 1. General Information

### Location Hierarchy

The API follows an administrative location hierarchy:

```
Province → Region → District → Village
```

Many resources (BSPS, Kawasan Kumuh, Rusun, Sosialisasi) reference this hierarchy via foreign keys.

### Coordinate Object

Several resources use a coordinate object:

```json
{
  "latitude": -3.5952,
  "longitude": 98.6722
}
```

| Field       | Type    | Constraints               |
|-------------|---------|---------------------------|
| `latitude`  | float64 | Range: -90 to 90          |
| `longitude` | float64 | Range: -180 to 180        |

### Soft Deletes

All resources use GORM soft deletes. When a record is deleted, it is not physically removed from the database — a `deleted_at` timestamp is set instead. Soft-deleted records are excluded from normal queries.

---

## 2. Response Format

All endpoints return a standardized JSON response:

### Success Response

```json
{
  "success": true,
  "message": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "error message description"
}
```

### Common HTTP Status Codes

| Code | Meaning               |
|------|-----------------------|
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## 3. Root & Health Endpoints

### `GET /api/v1/`

Returns basic API information.

**Response:**

```json
{
  "docs": "/api/docs",
  "env": "development",
  "message": "Welcome to Klinik PKP Sumatera II API",
  "version": "1.0.0"
}
```

---

### `GET /api/v1/health`

Health check endpoint to verify the server and database status.

**Response:**

```json
{
  "status": "healthy",
  "database": "connected",
  "env": "development"
}
```

---

## 4. Users

### User Object

| Field       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| `id`        | UUID    | Unique user identifier               |
| `name`      | string  | Full name (max 255 chars)            |
| `email`     | string  | Unique email address (max 255 chars) |
| `phone`     | string  | Unique phone number (max 20 chars)   |
| `role`      | string  | User role: `"admin"` or `"User"`     |
| `is_active` | boolean | Whether the account is active        |

> **Note:** The `password` field is never returned in JSON responses.

---

### `GET /api/v1/users`

Retrieve all users.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08123456789",
      "role": "admin",
      "is_active": true
    }
  ]
}
```

---

## 5. Provinces

### Province Object

| Field  | Type   | Description                  |
|--------|--------|------------------------------|
| `id`   | string | Numeric ID (serialized as string) |
| `name` | string | Province name                |

---

### `GET /api/v1/provinces`

Retrieve all provinces.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "12",
      "name": "Sumatera Utara"
    }
  ]
}
```

---

### `GET /api/v1/provinces/:id`

Retrieve a single province by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Province ID |

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": {
    "id": "12",
    "name": "Sumatera Utara"
  }
}
```

**Error Responses:**

| Code | Condition                |
|------|--------------------------|
| 400  | Invalid province ID      |
| 404  | Province not found       |

---

### `POST /api/v1/provinces`

Create a new province.

**Content-Type:** `application/json`

**Request Body:**

| Field  | Type   | Required | Validation                     |
|--------|--------|----------|--------------------------------|
| `name` | string | Yes      | Cannot be `null`/`NULL`/`Null` |

**Example Request:**

```json
{
  "name": "Sumatera Utara"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "province created",
  "data": {
    "id": "12"
  }
}
```

---

### `PUT /api/v1/provinces/:id`

Update an existing province.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Province ID |

**Content-Type:** `application/json`

**Request Body:**

| Field  | Type   | Required | Validation                     |
|--------|--------|----------|--------------------------------|
| `name` | string | Yes      | Cannot be `null`/`NULL`/`Null` |

**Example Request:**

```json
{
  "name": "Sumatera Utara Updated"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "province updated"
}
```

**Error Responses:**

| Code | Condition                |
|------|--------------------------|
| 400  | Invalid ID or payload    |
| 404  | Province not found       |

---

### `DELETE /api/v1/provinces/:id`

Soft-delete a province.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Province ID |

**Response (200):**

```json
{
  "success": true,
  "message": "province deleted"
}
```

**Error Responses:**

| Code | Condition                |
|------|--------------------------|
| 400  | Invalid province ID      |
| 404  | Province not found       |

---

## 6. Regions

### Region Object

| Field         | Type   | Description                                  |
|---------------|--------|----------------------------------------------|
| `id`          | string | Numeric ID (serialized as string)            |
| `province_id` | string | Foreign key to Province                      |
| `name`        | string | Region name                                  |
| `province`    | object | Nested Province object (loaded on GET)       |

---

### `GET /api/v1/regions`

Retrieve all regions with their associated province.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1201",
      "province_id": "12",
      "name": "Kab. Tapanuli Tengah",
      "province": {
        "id": "12",
        "name": "Sumatera Utara"
      }
    }
  ]
}
```

---

### `GET /api/v1/regions/:id`

Retrieve a single region by ID (includes province data).

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Region ID   |

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": {
    "id": "1201",
    "province_id": "12",
    "name": "Kab. Tapanuli Tengah",
    "province": {
      "id": "12",
      "name": "Sumatera Utara"
    }
  }
}
```

**Error Responses:**

| Code | Condition             |
|------|-----------------------|
| 400  | Invalid region ID     |
| 404  | Region not found      |

---

### `POST /api/v1/regions`

Create a new region.

**Content-Type:** `application/json`

**Request Body:**

| Field         | Type   | Required | Validation                     |
|---------------|--------|----------|--------------------------------|
| `name`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `province_id` | string | Yes      | Must be a valid province ID    |

**Example Request:**

```json
{
  "name": "Kab. Tapanuli Tengah",
  "province_id": "12"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "region created",
  "data": {
    "id": "1201"
  }
}
```

---

### `PUT /api/v1/regions/:id`

Update an existing region.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Region ID   |

**Content-Type:** `application/json`

**Request Body:**

| Field         | Type   | Required | Validation                     |
|---------------|--------|----------|--------------------------------|
| `name`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `province_id` | string | Yes      | Must be a valid province ID    |

**Response (200):**

```json
{
  "success": true,
  "message": "region updated"
}
```

**Error Responses:**

| Code | Condition             |
|------|-----------------------|
| 400  | Invalid ID or payload |
| 404  | Region not found      |

---

### `DELETE /api/v1/regions/:id`

Soft-delete a region.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Region ID   |

**Response (200):**

```json
{
  "success": true,
  "message": "region deleted"
}
```

---

## 7. Districts

### District Object

| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `id`        | string | Numeric ID (serialized as string)         |
| `region_id` | string | Foreign key to Region                     |
| `name`      | string | District name                             |
| `region`    | object | Nested Region → Province (loaded on GET)  |

---

### `GET /api/v1/districts`

Retrieve all districts with nested Region → Province data.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "120101",
      "region_id": "1201",
      "name": "Kec. Badiri",
      "region": {
        "id": "1201",
        "province_id": "12",
        "name": "Kab. Tapanuli Tengah",
        "province": {
          "id": "12",
          "name": "Sumatera Utara"
        }
      }
    }
  ]
}
```

---

### `GET /api/v1/districts/:id`

Retrieve a single district by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
|-----------|--------|----------|--------------|
| `id`      | uint64 | Yes      | District ID  |

**Response (200):** Same structure as list item above.

**Error Responses:**

| Code | Condition              |
|------|------------------------|
| 400  | Invalid district ID    |
| 404  | District not found     |

---

### `POST /api/v1/districts`

Create a new district.

**Content-Type:** `application/json`

**Request Body:**

| Field       | Type   | Required | Validation                     |
|-------------|--------|----------|--------------------------------|
| `name`      | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `region_id` | string | Yes      | Must be a valid region ID      |

**Example Request:**

```json
{
  "name": "Kec. Badiri",
  "region_id": "1201"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "district created",
  "data": {
    "id": "120101"
  }
}
```

---

### `PUT /api/v1/districts/:id`

Update an existing district.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
|-----------|--------|----------|--------------|
| `id`      | uint64 | Yes      | District ID  |

**Content-Type:** `application/json`

**Request Body:**

| Field       | Type   | Required | Validation                     |
|-------------|--------|----------|--------------------------------|
| `name`      | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `region_id` | string | Yes      | Must be a valid region ID      |

**Response (200):**

```json
{
  "success": true,
  "message": "district updated"
}
```

---

### `DELETE /api/v1/districts/:id`

Soft-delete a district.

**Path Parameters:**

| Parameter | Type   | Required | Description  |
|-----------|--------|----------|--------------|
| `id`      | uint64 | Yes      | District ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "district deleted"
}
```

---

## 8. Villages

### Village Object

| Field         | Type   | Description                                          |
|---------------|--------|------------------------------------------------------|
| `id`          | string | Numeric ID (serialized as string)                    |
| `district_id` | string | Foreign key to District                              |
| `name`        | string | Village name                                         |
| `district`    | object | Nested District → Region → Province (loaded on GET)  |

---

### `GET /api/v1/villages`

Retrieve all villages with full nested location hierarchy (District → Region → Province).

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1201010001",
      "district_id": "120101",
      "name": "Desa Aek Horsik",
      "district": {
        "id": "120101",
        "region_id": "1201",
        "name": "Kec. Badiri",
        "region": {
          "id": "1201",
          "province_id": "12",
          "name": "Kab. Tapanuli Tengah",
          "province": {
            "id": "12",
            "name": "Sumatera Utara"
          }
        }
      }
    }
  ]
}
```

---

### `GET /api/v1/villages/:id`

Retrieve a single village by ID with full hierarchy.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Village ID  |

**Error Responses:**

| Code | Condition             |
|------|-----------------------|
| 400  | Invalid village ID    |
| 404  | Village not found     |

---

### `POST /api/v1/villages`

Create a new village.

**Content-Type:** `application/json`

**Request Body:**

| Field         | Type   | Required | Validation                     |
|---------------|--------|----------|--------------------------------|
| `name`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `district_id` | string | Yes      | Must be a valid district ID    |

**Example Request:**

```json
{
  "name": "Desa Aek Horsik",
  "district_id": "120101"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "village created",
  "data": {
    "id": "1201010001"
  }
}
```

---

### `PUT /api/v1/villages/:id`

Update an existing village.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Village ID  |

**Content-Type:** `application/json`

**Request Body:**

| Field         | Type   | Required | Validation                     |
|---------------|--------|----------|--------------------------------|
| `name`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `district_id` | string | Yes      | Must be a valid district ID    |

**Response (200):**

```json
{
  "success": true,
  "message": "village updated"
}
```

---

### `DELETE /api/v1/villages/:id`

Soft-delete a village.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Village ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "village deleted"
}
```

---

## 9. BSPS (Bantuan Stimulan Perumahan Swadaya)

### BSPS Object

| Field         | Type   | Description                                    |
|---------------|--------|------------------------------------------------|
| `id`          | string | Numeric ID (serialized as string)              |
| `village_id`  | string | Foreign key to Village                         |
| `district_id` | string | Foreign key to District                        |
| `region_id`   | string | Foreign key to Region                          |
| `unit_count`  | uint64 | Number of housing units                        |
| `year_given`  | uint64 | Year the assistance was given                  |
| `status`      | string | `"Rencana"`, `"Dalam Proses"`, or `"Selesai"` |
| `coordinate`  | object | `{ latitude, longitude }`                      |
| `village`     | object | Nested Village (loaded on GET)                 |
| `district`    | object | Nested District (loaded on GET)                |
| `region`      | object | Nested Region (loaded on GET)                  |

### Status Values

| Value           | Meaning                              |
|-----------------|--------------------------------------|
| `Rencana`       | Planned                              |
| `Dalam Proses`  | In Progress                          |
| `Selesai`       | Completed                            |

---

### `GET /api/v1/bsps`

Retrieve all BSPS records with nested Village, District, and Region data.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1",
      "village_id": "1201010001",
      "district_id": "120101",
      "region_id": "1201",
      "unit_count": 50,
      "year_given": 2024,
      "status": "Selesai",
      "coordinate": {
        "latitude": 2.0154,
        "longitude": 98.9309
      },
      "village": { ... },
      "district": { ... },
      "region": { ... }
    }
  ]
}
```

---

### `GET /api/v1/bsps/:id`

Retrieve a single BSPS record by ID (includes Village, District, Region → Province).

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | BSPS ID     |

**Error Responses:**

| Code | Condition          |
|------|--------------------|
| 400  | Invalid BSPS ID   |
| 404  | BSPS not found    |

---

### `POST /api/v1/bsps`

Create a new BSPS record.

**Content-Type:** `application/json`

**Request Body:**

| Field         | Type   | Required | Validation                                            |
|---------------|--------|----------|-------------------------------------------------------|
| `village_id`  | string | Yes      | Valid village ID                                      |
| `district_id` | string | Yes      | Valid district ID                                     |
| `region_id`   | string | Yes      | Valid region ID                                       |
| `unit_count`  | uint64 | No       | Number of housing units                               |
| `year_given`  | uint64 | No       | Year assistance was given                             |
| `status`      | string | Yes      | One of: `"Rencana"`, `"Dalam Proses"`, `"Selesai"`. Cannot be `null`. |
| `coordinate`  | object | Yes      | `{ "latitude": float, "longitude": float }`           |

**Example Request:**

```json
{
  "village_id": "1201010001",
  "district_id": "120101",
  "region_id": "1201",
  "unit_count": 50,
  "year_given": 2024,
  "status": "Rencana",
  "coordinate": {
    "latitude": 2.0154,
    "longitude": 98.9309
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "BSPS created",
  "data": {
    "id": "1"
  }
}
```

---

### `PUT /api/v1/bsps/:id`

Update an existing BSPS record.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | BSPS ID     |

**Content-Type:** `application/json`

**Request Body:** Same as POST.

**Response (200):**

```json
{
  "success": true,
  "message": "BSPS updated"
}
```

---

### `DELETE /api/v1/bsps/:id`

Soft-delete a BSPS record.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | BSPS ID     |

**Response (200):**

```json
{
  "success": true,
  "message": "BSPS deleted"
}
```

---

## 10. Kawasan Kumuh (Slum Areas)

### Kawasan Kumuh Object

| Field              | Type    | Description                              |
|--------------------|---------|------------------------------------------|
| `id`               | string  | Numeric ID (serialized as string)        |
| `district_id`      | string  | Foreign key to District                  |
| `region_id`        | string  | Foreign key to Region                    |
| `area_name`        | string  | Name of the slum area (max 255 chars)    |
| `environments`     | string  | Environments description (max 255 chars) |
| `villages`         | string  | Comma-separated village names (text)     |
| `total_area`       | float64 | Total area in hectares                   |
| `total_population` | uint64  | Total population count                   |
| `slum_value`       | uint64  | Slum assessment value                    |
| `coordinate`       | object  | `{ latitude, longitude }`                |
| `district`         | object  | Nested District (loaded on GET)          |
| `region`           | object  | Nested Region (loaded on GET)            |

---

### `GET /api/v1/kumuh`

Retrieve all kawasan kumuh records. Supports optional filtering via query parameters.

**Query Parameters (all optional):**

| Parameter     | Type   | Description                                                           |
|---------------|--------|-----------------------------------------------------------------------|
| `province_id` | uint64 | Filter by province (via region join)                                  |
| `region_id`   | uint64 | Filter by region                                                      |
| `district_id` | uint64 | Filter by district                                                    |
| `village_id`  | uint64 | Filter by village (does LIKE match on `villages` text field by name)  |

**Example Request:**

```
GET /api/v1/kumuh?region_id=1201&district_id=120101
```

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1",
      "district_id": "120101",
      "region_id": "1201",
      "area_name": "Kawasan Kumuh A",
      "environments": "Lingkungan 1, Lingkungan 2",
      "villages": "Desa A, Desa B",
      "total_area": 12.5,
      "total_population": 1500,
      "slum_value": 75,
      "coordinate": {
        "latitude": 2.0154,
        "longitude": 98.9309
      },
      "district": { ... },
      "region": { ... }
    }
  ]
}
```

---

### `GET /api/v1/kumuh/:id`

Retrieve a single kawasan kumuh record by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | uint64 | Yes      | Kawasan Kumuh ID  |

**Error Responses:**

| Code | Condition                 |
|------|---------------------------|
| 400  | Invalid kawasan kumuh ID  |
| 404  | Kawasan kumuh not found   |

---

### `POST /api/v1/kumuh`

Create a new kawasan kumuh record.

**Content-Type:** `application/json`

**Request Body:**

| Field              | Type    | Required | Validation                     |
|--------------------|---------|----------|--------------------------------|
| `district_id`      | string  | Yes      | Valid district ID              |
| `region_id`        | string  | Yes      | Valid region ID                |
| `area_name`        | string  | Yes      | Cannot be `null`/`NULL`/`Null` |
| `environments`     | string  | Yes      | Cannot be `null`/`NULL`/`Null` |
| `villages`         | string  | Yes      | Comma-separated village names  |
| `total_area`       | float64 | Yes      | Total area value               |
| `total_population` | uint64  | Yes      | Population count               |
| `slum_value`       | uint64  | Yes      | Slum assessment value          |
| `coordinate`       | object  | Yes      | `{ "latitude": float, "longitude": float }` |

**Example Request:**

```json
{
  "district_id": "120101",
  "region_id": "1201",
  "area_name": "Kawasan Kumuh Baru",
  "environments": "Lingkungan 1",
  "villages": "Desa A, Desa B, Desa C",
  "total_area": 15.75,
  "total_population": 2000,
  "slum_value": 80,
  "coordinate": {
    "latitude": 2.0154,
    "longitude": 98.9309
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "kawasan kumuh created",
  "data": {
    "id": "1"
  }
}
```

---

### `PUT /api/v1/kumuh/:id`

Update an existing kawasan kumuh record.

**Path Parameters:**

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | uint64 | Yes      | Kawasan Kumuh ID  |

**Content-Type:** `application/json`

**Request Body:** Same as POST.

**Response (200):**

```json
{
  "success": true,
  "message": "kawasan kumuh updated"
}
```

---

### `DELETE /api/v1/kumuh/:id`

Soft-delete a kawasan kumuh record.

**Path Parameters:**

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| `id`      | uint64 | Yes      | Kawasan Kumuh ID  |

**Response (200):**

```json
{
  "success": true,
  "message": "kawasan kumuh deleted"
}
```

---

## 11. Rusun (Rumah Susun)

### Rusun Object

| Field         | Type     | Description                           |
|---------------|----------|---------------------------------------|
| `id`          | string   | Numeric ID (serialized as string)     |
| `village_id`  | string   | Foreign key to Village                |
| `district_id` | string   | Foreign key to District               |
| `region_id`   | string   | Foreign key to Region                 |
| `name`        | string   | Rusun name (max 255 chars)            |
| `address`     | string   | Full address (max 500 chars)          |
| `tower`       | uint64   | Number of towers                      |
| `unit_type`   | string   | Unit type description (max 150 chars) |
| `floor`       | uint64   | Number of floors                      |
| `unit_count`  | uint64   | Total number of units                 |
| `year_given`  | uint64   | Year the rusun was given/built        |
| `image_urls`  | string[] | Array of image URLs                   |
| `coordinate`  | object   | `{ latitude, longitude }`             |
| `village`     | object   | Nested Village (loaded on GET)        |
| `district`    | object   | Nested District (loaded on GET)       |
| `region`      | object   | Nested Region (loaded on GET)         |

---

### `GET /api/v1/rusun`

Retrieve all rusun records with nested Village, District, and Region.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1",
      "village_id": "1201010001",
      "district_id": "120101",
      "region_id": "1201",
      "name": "Rusun Kelapa Gading",
      "address": "Jl. Kelapa Gading No. 1",
      "tower": 2,
      "unit_type": "Tipe 36",
      "floor": 5,
      "unit_count": 100,
      "year_given": 2023,
      "image_urls": [
        "rusun/1/rusun_abc123.jpg"
      ],
      "coordinate": {
        "latitude": 2.0154,
        "longitude": 98.9309
      },
      "village": { ... },
      "district": { ... },
      "region": { ... }
    }
  ]
}
```

---

### `GET /api/v1/rusun/:id`

Retrieve a single rusun record by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Rusun ID    |

**Error Responses:**

| Code | Condition          |
|------|--------------------|
| 400  | Invalid rusun ID   |
| 404  | Rusun not found    |

---

### `POST /api/v1/rusun`

Create a new rusun record with image uploads.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field         | Type   | Required | Validation                     |
|---------------|--------|----------|--------------------------------|
| `village_id`  | string | Yes      | Valid village ID               |
| `district_id` | string | Yes      | Valid district ID              |
| `region_id`   | string | Yes      | Valid region ID                |
| `name`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `address`     | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `tower`       | uint64 | Yes      | Number of towers               |
| `unit_type`   | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `floor`       | uint64 | Yes      | Number of floors               |
| `unit_count`  | uint64 | Yes      | Total units                    |
| `year_given`  | uint64 | Yes      | Year given                     |
| `coordinate`  | string | Yes      | JSON string: `{"latitude":2.0,"longitude":98.9}` |
| `images`      | file[] | Yes      | Image files (max 4, validated) |

> **Note:** The `coordinate` field must be sent as a raw JSON string in the form data. It is parsed server-side.

**Response (201):**

```json
{
  "success": true,
  "message": "rusun created",
  "data": {
    "id": "1",
    "image_urls": [
      "rusun/1/rusun_abc123.jpg"
    ]
  }
}
```

---

### `PUT /api/v1/rusun/:id`

Update an existing rusun record. If new images are provided, old images are deleted and replaced.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Rusun ID    |

**Content-Type:** `multipart/form-data`

**Form Fields:** Same as POST.

**Response (200):**

```json
{
  "success": true,
  "message": "rusun updated"
}
```

---

### `DELETE /api/v1/rusun/:id`

Soft-delete a rusun record and remove associated image files from storage.

**Path Parameters:**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | uint64 | Yes      | Rusun ID    |

**Response (200):**

```json
{
  "success": true,
  "message": "rusun deleted"
}
```

---

## 12. Bank Desain

### Bank Desain Object

| Field            | Type     | Description                                              |
|------------------|----------|----------------------------------------------------------|
| `id`             | string   | Numeric ID (serialized as string)                        |
| `name`           | string   | Design name (max 255 chars)                              |
| `type`           | string   | One of: `"Tipe 36"`, `"Tipe 45"`, `"Tipe 54"`, `"Rusun"` |
| `bedroom_count`  | uint64   | Number of bedrooms                                       |
| `bathroom_count` | uint64   | Number of bathrooms                                      |
| `total_area`     | uint64   | Total area in square meters                              |
| `has_garage`     | boolean  | Whether the design includes a garage                     |
| `image_urls`     | string[] | Array of image file URLs                                 |
| `file_urls`      | string[] | Array of document file URLs (e.g., blueprints)           |

### Type Values

| Value      | Description          |
|------------|----------------------|
| `Tipe 36`  | Type 36 house design |
| `Tipe 45`  | Type 45 house design |
| `Tipe 54`  | Type 54 house design |
| `Rusun`    | Apartment design     |

---

### `GET /api/v1/bank-desain`

Retrieve all bank desain records.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1",
      "name": "Desain Rumah Tipe 36 Modern",
      "type": "Tipe 36",
      "bedroom_count": 2,
      "bathroom_count": 1,
      "total_area": 36,
      "has_garage": false,
      "image_urls": [
        "bank_desain/1/bank_desain_abc123.jpg"
      ],
      "file_urls": [
        "bank_desain/1/bank_desain_abc123.pdf"
      ]
    }
  ]
}
```

---

### `GET /api/v1/bank-desain/:id`

Retrieve a single bank desain record by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `id`      | uint64 | Yes      | Bank Desain ID |

**Error Responses:**

| Code | Condition              |
|------|------------------------|
| 400  | Invalid bank desain ID |
| 404  | Bank desain not found  |

---

### `POST /api/v1/bank-desain`

Create a new bank desain record with image and file uploads.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field            | Type    | Required | Validation                                              |
|------------------|---------|----------|---------------------------------------------------------|
| `name`           | string  | Yes      | Cannot be `null`/`NULL`/`Null`                          |
| `type`           | string  | Yes      | One of: `"Tipe 36"`, `"Tipe 45"`, `"Tipe 54"`, `"Rusun"`. Cannot be `null`. |
| `bedroom_count`  | uint64  | Yes      | Number of bedrooms                                      |
| `bathroom_count` | uint64  | Yes      | Number of bathrooms                                     |
| `total_area`     | uint64  | Yes      | Total area in sqm                                       |
| `has_garage`     | boolean | Yes      | `true` or `false`                                       |
| `images`         | file[]  | Yes      | Image files (max 4, validated for type/size)            |
| `files`          | file[]  | Yes      | Document files (e.g., PDF blueprints)                   |

**Response (201):**

```json
{
  "success": true,
  "message": "bank desain created",
  "data": {
    "id": "1",
    "image_urls": [
      "bank_desain/1/bank_desain_abc123.jpg"
    ],
    "file_urls": [
      "bank_desain/1/bank_desain_def456.pdf"
    ]
  }
}
```

---

### `PUT /api/v1/bank-desain/:id`

Update an existing bank desain record. If new images/files are provided, old ones are deleted and replaced.

**Path Parameters:**

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `id`      | uint64 | Yes      | Bank Desain ID |

**Content-Type:** `multipart/form-data`

**Form Fields:** Same as POST.

**Response (200):**

```json
{
  "success": true,
  "message": "bank desain updated"
}
```

---

### `DELETE /api/v1/bank-desain/:id`

Soft-delete a bank desain record and remove associated image files from storage.

**Path Parameters:**

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `id`      | uint64 | Yes      | Bank Desain ID |

**Response (200):**

```json
{
  "success": true,
  "message": "bank desain deleted"
}
```

---

## 13. Sosialisasi

### Sosialisasi Object

| Field                | Type     | Description                               |
|----------------------|----------|-------------------------------------------|
| `id`                 | string   | Numeric ID (serialized as string)         |
| `village_id`         | string   | Foreign key to Village                    |
| `district_id`        | string   | Foreign key to District                   |
| `region_id`          | string   | Foreign key to Region                     |
| `title`              | string   | Event title                               |
| `location`           | string   | Event location description                |
| `description`        | string   | Full event description                    |
| `image_urls`         | string[] | Array of image URLs                       |
| `coordinate`         | object   | `{ latitude, longitude }`                 |
| `scheduled_at_start` | string   | Event start time (RFC 3339 format)        |
| `scheduled_at_end`   | string   | Event end time (RFC 3339 format)          |
| `village`            | object   | Nested Village (loaded on GET)            |
| `district`           | object   | Nested District (loaded on GET)           |
| `region`             | object   | Nested Region → Province (loaded on GET)  |

---

### `GET /api/v1/sosialisasi`

Retrieve all sosialisasi records with nested Village, District, and Region → Province.

**Request:** No parameters required.

**Response (200):**

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "1",
      "village_id": "1201010001",
      "district_id": "120101",
      "region_id": "1201",
      "title": "Sosialisasi Program PKP",
      "location": "Balai Desa A",
      "description": "Sosialisasi program perumahan dan kawasan permukiman...",
      "image_urls": [
        "sosialisasi/1/sosialisasi_abc123.jpg"
      ],
      "coordinate": {
        "latitude": 2.0154,
        "longitude": 98.9309
      },
      "scheduled_at_start": "2026-03-15T09:00:00Z",
      "scheduled_at_end": "2026-03-15T12:00:00Z",
      "village": { ... },
      "district": { ... },
      "region": { ... }
    }
  ]
}
```

---

### `GET /api/v1/sosialisasi/:id`

Retrieve a single sosialisasi record by ID.

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| `id`      | uint64 | Yes      | Sosialisasi ID   |

**Error Responses:**

| Code | Condition                |
|------|--------------------------|
| 400  | Invalid sosialisasi ID   |
| 404  | Sosialisasi not found    |

---

### `POST /api/v1/sosialisasi`

Create a new sosialisasi record with optional image uploads.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field                | Type   | Required | Validation                     |
|----------------------|--------|----------|--------------------------------|
| `village_id`         | string | Yes      | Valid village ID               |
| `district_id`        | string | Yes      | Valid district ID              |
| `region_id`          | string | Yes      | Valid region ID                |
| `title`              | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `location`           | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `description`        | string | Yes      | Cannot be `null`/`NULL`/`Null` |
| `scheduled_at_start` | string | Yes      | RFC 3339 format (e.g., `2026-03-15T09:00:00Z`) |
| `scheduled_at_end`   | string | Yes      | RFC 3339 format (e.g., `2026-03-15T12:00:00Z`) |
| `coordinate`         | string | Yes      | JSON string: `{"latitude":2.0,"longitude":98.9}` |
| `images`             | file[] | No       | Optional image files (max 4, validated) |

> **Note:** The `coordinate` field must be sent as a raw JSON string in the form data. The `images` field is optional for sosialisasi.

**Response (201):**

```json
{
  "success": true,
  "message": "sosialisasi created",
  "data": {
    "id": "1",
    "image_urls": [
      "sosialisasi/1/sosialisasi_abc123.jpg"
    ]
  }
}
```

---

### `PUT /api/v1/sosialisasi/:id`

Update an existing sosialisasi record. If new images are provided, old images are deleted and replaced.

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| `id`      | uint64 | Yes      | Sosialisasi ID   |

**Content-Type:** `multipart/form-data`

**Form Fields:** Same as POST.

**Response (200):**

```json
{
  "success": true,
  "message": "sosialisasi updated"
}
```

---

### `DELETE /api/v1/sosialisasi/:id`

Soft-delete a sosialisasi record and remove associated image files from storage.

**Path Parameters:**

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| `id`      | uint64 | Yes      | Sosialisasi ID   |

**Response (200):**

```json
{
  "success": true,
  "message": "sosialisasi deleted"
}
```

---

## 14. Static File Uploads

### `GET /api/v1/uploads/*`

Serves static files from the `./storage` directory. Used to access uploaded images and documents.

**URL Pattern:**

```
GET /api/v1/uploads/{category}/{record_id}/{filename}
```

**Examples:**

```
GET /api/v1/uploads/rusun/1/rusun_abc123.jpg
GET /api/v1/uploads/bank_desain/3/bank_desain_def456.pdf
GET /api/v1/uploads/sosialisasi/2/sosialisasi_ghi789.png
```

**File Categories:**

| Category       | Content Type | Description                    |
|----------------|--------------|--------------------------------|
| `rusun`        | Images       | Rusun photos                   |
| `bank_desain`  | Images/Files | Design images and blueprints   |
| `sosialisasi`  | Images       | Sosialisasi event photos       |
| `kawasan_kumuh`| Images       | Slum area photos               |

**Image Constraints:**
- Maximum 4 images per record
- Images are validated for type and size on upload
- Maximum request body size: 4 MB

---

## Endpoint Summary Table

| Method   | Endpoint                    | Content-Type       | Description                           |
|----------|-----------------------------|--------------------|---------------------------------------|
| `GET`    | `/api/v1/`                  | —                  | API info                              |
| `GET`    | `/api/v1/health`            | —                  | Health check                          |
| `GET`    | `/api/v1/users`             | —                  | List all users                        |
| `GET`    | `/api/v1/provinces`         | —                  | List all provinces                    |
| `GET`    | `/api/v1/provinces/:id`     | —                  | Get province by ID                    |
| `POST`   | `/api/v1/provinces`         | `application/json` | Create province                       |
| `PUT`    | `/api/v1/provinces/:id`     | `application/json` | Update province                       |
| `DELETE` | `/api/v1/provinces/:id`     | —                  | Delete province                       |
| `GET`    | `/api/v1/regions`           | —                  | List all regions                      |
| `GET`    | `/api/v1/regions/:id`       | —                  | Get region by ID                      |
| `POST`   | `/api/v1/regions`           | `application/json` | Create region                         |
| `PUT`    | `/api/v1/regions/:id`       | `application/json` | Update region                         |
| `DELETE` | `/api/v1/regions/:id`       | —                  | Delete region                         |
| `GET`    | `/api/v1/districts`         | —                  | List all districts                    |
| `GET`    | `/api/v1/districts/:id`     | —                  | Get district by ID                    |
| `POST`   | `/api/v1/districts`         | `application/json` | Create district                       |
| `PUT`    | `/api/v1/districts/:id`     | `application/json` | Update district                       |
| `DELETE` | `/api/v1/districts/:id`     | —                  | Delete district                       |
| `GET`    | `/api/v1/villages`          | —                  | List all villages                     |
| `GET`    | `/api/v1/villages/:id`      | —                  | Get village by ID                     |
| `POST`   | `/api/v1/villages`          | `application/json` | Create village                        |
| `PUT`    | `/api/v1/villages/:id`      | `application/json` | Update village                        |
| `DELETE` | `/api/v1/villages/:id`      | —                  | Delete village                        |
| `GET`    | `/api/v1/bsps`              | —                  | List all BSPS records                 |
| `GET`    | `/api/v1/bsps/:id`          | —                  | Get BSPS by ID                        |
| `POST`   | `/api/v1/bsps`              | `application/json` | Create BSPS record                    |
| `PUT`    | `/api/v1/bsps/:id`          | `application/json` | Update BSPS record                    |
| `DELETE` | `/api/v1/bsps/:id`          | —                  | Delete BSPS record                    |
| `GET`    | `/api/v1/kumuh`             | —                  | List all kawasan kumuh (filterable)    |
| `GET`    | `/api/v1/kumuh/:id`         | —                  | Get kawasan kumuh by ID               |
| `POST`   | `/api/v1/kumuh`             | `application/json` | Create kawasan kumuh                   |
| `PUT`    | `/api/v1/kumuh/:id`         | `application/json` | Update kawasan kumuh                   |
| `DELETE` | `/api/v1/kumuh/:id`         | —                  | Delete kawasan kumuh                   |
| `GET`    | `/api/v1/rusun`             | —                  | List all rusun                         |
| `GET`    | `/api/v1/rusun/:id`         | —                  | Get rusun by ID                        |
| `POST`   | `/api/v1/rusun`             | `multipart/form-data` | Create rusun (with images)          |
| `PUT`    | `/api/v1/rusun/:id`         | `multipart/form-data` | Update rusun (with images)          |
| `DELETE` | `/api/v1/rusun/:id`         | —                  | Delete rusun                           |
| `GET`    | `/api/v1/bank-desain`       | —                  | List all bank desain                   |
| `GET`    | `/api/v1/bank-desain/:id`   | —                  | Get bank desain by ID                  |
| `POST`   | `/api/v1/bank-desain`       | `multipart/form-data` | Create bank desain (with images/files) |
| `PUT`    | `/api/v1/bank-desain/:id`   | `multipart/form-data` | Update bank desain (with images/files) |
| `DELETE` | `/api/v1/bank-desain/:id`   | —                  | Delete bank desain                     |
| `GET`    | `/api/v1/sosialisasi`       | —                  | List all sosialisasi                   |
| `GET`    | `/api/v1/sosialisasi/:id`   | —                  | Get sosialisasi by ID                  |
| `POST`   | `/api/v1/sosialisasi`       | `multipart/form-data` | Create sosialisasi (with images)    |
| `PUT`    | `/api/v1/sosialisasi/:id`   | `multipart/form-data` | Update sosialisasi (with images)    |
| `DELETE` | `/api/v1/sosialisasi/:id`   | —                  | Delete sosialisasi                     |
| `GET`    | `/api/v1/uploads/*`         | —                  | Serve static files from storage        |

**Total: 47 endpoints**
