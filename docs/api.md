# API Specification

## Overview

API obsluguje dwa glowne typy klientow:

- panel administracyjny
- agent Windows zainstalowany na komputerze klienckim

Na poziomie MVP wszystkie endpointy sa wersjonowane prefiksem `/api/v1`.

Przyjeta konwencja:

- JSON jako format request i response
- czas w formacie ISO 8601 UTC
- identyfikatory jako UUID
- autoryzacja administratora przez JWT Bearer
- autoryzacja agenta przez `X-Agent-Token`

## Services Scope

Logicznie API jest podzielone na obszary:

- `auth` - logowanie administratora
- `devices` - urzadzenia zarzadzane
- `usb-devices` - whitelist urzadzen USB
- `policies` - polityki USB
- `events` - logi bezpieczenstwa
- `agent` - komunikacja z agentami

## Authentication Model

### Admin Authentication

Administrator loguje sie przez email i haslo, a backend zwraca JWT.

Naglowek:

```http
Authorization: Bearer <token>
```

### Agent Authentication

Kazde urzadzenie po rejestracji otrzymuje unikalny token agenta.

Naglowek:

```http
X-Agent-Token: <agent-token>
```

## Error Response Format

Wszystkie bledy powinny miec wspolny format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Status Codes

- `200 OK` - odczyt lub poprawna operacja
- `201 Created` - utworzenie zasobu
- `204 No Content` - usuniecie zasobu
- `400 Bad Request` - niepoprawne dane
- `401 Unauthorized` - brak lub niepoprawne uwierzytelnienie
- `403 Forbidden` - brak uprawnien
- `404 Not Found` - zasob nie istnieje
- `409 Conflict` - konflikt danych, np. duplikat serial number
- `422 Unprocessable Entity` - dane formalnie poprawne, ale biznesowo nieprawidlowe
- `500 Internal Server Error` - blad wewnetrzny

## Auth Endpoints

### `POST /api/v1/auth/login`

Logowanie administratora.

Request:

```json
{
  "email": "admin@example.com",
  "password": "StrongPassword123!"
}
```

Response `200 OK`:

```json
{
  "data": {
    "accessToken": "jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "5cf8e6ef-8156-4660-9ac0-2586ed3fd1d6",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

Rules:

- email musi istniec w bazie
- haslo musi zgadzac sie z `password_hash`
- konto moze byc w przyszlosci rozszerzone o status aktywnosci

### `GET /api/v1/auth/me`

Pobranie danych aktualnie zalogowanego administratora.

Response `200 OK`:

```json
{
  "data": {
    "id": "5cf8e6ef-8156-4660-9ac0-2586ed3fd1d6",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-03-28T14:00:00Z"
  }
}
```

## Device Endpoints

### `GET /api/v1/devices`

Lista urzadzen z mozliwoscia filtrowania.

Query params:

- `status` - `online | offline`
- `policyMode` - `allow_all | block_all | whitelist_only`
- `search` - hostname lub fragment hostname
- `page`
- `limit`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
      "hostname": "PC-KOWALSKI",
      "status": "online",
      "policyMode": "whitelist_only",
      "lastSeenAt": "2026-03-28T14:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### `GET /api/v1/devices/:deviceId`

Szczegoly konkretnego urzadzenia.

Response `200 OK`:

```json
{
  "data": {
    "id": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
    "hostname": "PC-KOWALSKI",
    "status": "online",
    "policyMode": "whitelist_only",
    "lastSeenAt": "2026-03-28T14:15:00Z",
    "agentVersion": "0.1.0",
    "osVersion": "Windows 11 Pro",
    "createdAt": "2026-03-28T13:00:00Z"
  }
}
```

### `PATCH /api/v1/devices/:deviceId/policy`

Aktualizacja polityki USB dla urzadzenia.

Request:

```json
{
  "policyMode": "whitelist_only"
}
```

Response `200 OK`:

```json
{
  "data": {
    "deviceId": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
    "policyMode": "whitelist_only",
    "updatedAt": "2026-03-28T14:20:00Z"
  }
}
```

Rules:

- dozwolone wartosci `policyMode`: `allow_all`, `block_all`, `whitelist_only`
- zmiana polityki powinna generowac wpis w audit log

## USB Whitelist Endpoints

### `GET /api/v1/usb-devices`

Lista dozwolonych urzadzen USB.

Query params:

- `search`
- `page`
- `limit`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "8499d8a5-c7a4-437f-a934-e2f7e7bce233",
      "serialNumber": "4C530001230421",
      "vendor": "SanDisk",
      "productName": "Ultra",
      "description": "Pendrive testowy",
      "createdAt": "2026-03-28T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### `POST /api/v1/usb-devices`

Dodanie urzadzenia USB do whitelisty.

Request:

```json
{
  "serialNumber": "4C530001230421",
  "vendor": "SanDisk",
  "productName": "Ultra",
  "description": "Pendrive testowy"
}
```

Response `201 Created`:

```json
{
  "data": {
    "id": "8499d8a5-c7a4-437f-a934-e2f7e7bce233",
    "serialNumber": "4C530001230421",
    "vendor": "SanDisk",
    "productName": "Ultra",
    "description": "Pendrive testowy",
    "createdAt": "2026-03-28T14:00:00Z"
  }
}
```

Rules:

- `serialNumber` musi byc unikalny
- `serialNumber` jest wymagany
- `vendor`, `productName`, `description` sa opcjonalne, ale zalecane

### `DELETE /api/v1/usb-devices/:usbDeviceId`

Usuniecie urzadzenia z whitelisty.

Response `204 No Content`

Rule:

- usuniecie wpisu nie powinno usuwac historycznych logow

## Device to USB Assignment Endpoints

Opcjonalny obszar dla bardziej szczegolowego modelu uprawnien.

### `POST /api/v1/devices/:deviceId/usb-devices/:usbDeviceId`

Przypisanie wpisu whitelisty do konkretnego urzadzenia.

Response `201 Created`:

```json
{
  "data": {
    "deviceId": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
    "usbDeviceId": "8499d8a5-c7a4-437f-a934-e2f7e7bce233",
    "createdAt": "2026-03-28T14:22:00Z"
  }
}
```

### `DELETE /api/v1/devices/:deviceId/usb-devices/:usbDeviceId`

Usuniecie przypisania.

Response `204 No Content`

## Event Endpoints

### `GET /api/v1/events`

Lista zdarzen bezpieczenstwa.

Query params:

- `deviceId`
- `eventType`
- `from`
- `to`
- `page`
- `limit`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "9b8d808f-5bcc-4ae6-b0d1-f3c5290b4e45",
      "deviceId": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
      "eventType": "usb_blocked",
      "payload": {
        "serialNumber": "123456",
        "vendor": "Unknown"
      },
      "createdAt": "2026-03-28T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

## Agent Endpoints

### `POST /api/v1/agent/register`

Rejestracja agenta przy pierwszym uruchomieniu.

Request:

```json
{
  "hostname": "PC-KOWALSKI",
  "agentVersion": "0.1.0",
  "osVersion": "Windows 11 Pro"
}
```

Response `201 Created`:

```json
{
  "data": {
    "deviceId": "8122c2d4-0e9d-4ac4-9e3d-ff9db9795865",
    "agentToken": "generated-agent-token",
    "policyMode": "whitelist_only",
    "whitelist": [
      {
        "serialNumber": "4C530001230421",
        "vendor": "SanDisk",
        "productName": "Ultra"
      }
    ]
  }
}
```

Rules:

- endpoint moze byc zabezpieczony dodatkowym `registrationKey`
- po rejestracji tworzony jest rekord w `devices`

### `POST /api/v1/agent/heartbeat`

Heartbeat agenta.

Headers:

```http
X-Agent-Token: <agent-token>
```

Request:

```json
{
  "status": "online",
  "hostname": "PC-KOWALSKI",
  "ipAddress": "192.168.1.25",
  "macAddress": "00-1A-2B-3C-4D-5E",
  "currentUser": "kowalski",
  "domain": "CORP-LOCAL",
  "isUsbBlocked": true,
  "deviceFingerprint": "7f4a9a7f5f9d4d1b0d78e4c4d80f56c7c7bb2e8db4f9e4c4dce1a5f91f2d8a11",
  "agentVersion": "0.1.0",
  "osVersion": "Windows 11 Pro"
}
```

Response `200 OK`:

```json
{
  "data": {
    "serverTime": "2026-03-28T14:30:00Z",
    "policyChanged": false
  }
}
```

Rules:

- aktualizuje `lastSeenAt` 
- aktualizuje ostatni znany adres IP urzadzenia
- moze sluzyc do wykrywania urzadzen offline

### `GET /api/v1/agent/policy`

Pobranie aktualnej polityki i whitelisty.

Headers:

```http
X-Agent-Token: <agent-token>
```

Response `200 OK`:

```json
{
  "data": {
    "policyMode": "whitelist_only",
    "whitelist": [
      {
        "serialNumber": "4C530001230421",
        "vendor": "SanDisk",
        "productName": "Ultra"
      }
    ],
    "updatedAt": "2026-03-28T14:20:00Z"
  }
}
```

### `POST /api/v1/agent/events`

Przesylanie zdarzen z agenta.

Headers:

```http
X-Agent-Token: <agent-token>
```

Request:

```json
{
  "events": [
    {
      "eventType": "usb_blocked",
      "occurredAt": "2026-03-28T14:30:00Z",
      "payload": {
        "serialNumber": "123456",
        "vendor": "Unknown",
        "productName": "USB Device"
      }
    }
  ]
}
```

Response `201 Created`:

```json
{
  "data": {
    "accepted": 1
  }
}
```

Dozwolone typy zdarzen MVP:

- `usb_inserted`
- `usb_allowed`
- `usb_blocked`
- `device_registered`
- `policy_applied`

## Validation Rules Summary

- wszystkie identyfikatory zasobow musza byc UUID
- `serialNumber` nie moze byc pusty
- `policyMode` musi nalezec do dozwolonego zbioru
- `eventType` musi nalezec do znanych typow zdarzen
- `ipAddress` powinien byc poprawnym adresem IPv4 lub IPv6
- `macAddress` powinien byc poprawnym adresem MAC
- `isUsbBlocked` musi byc typu boolean
- `deviceFingerprint` nie powinien byc pusty po wdrozeniu mechanizmu identyfikacji urzadzenia
- `deviceFingerprint` powinien byc hashem SHA-256 zapisanym jako hex lowercase
- endpointy administratora wymagaja JWT
- endpointy agenta wymagaja `X-Agent-Token`

## Testing Recommendations

Minimalny zakres testow jednostkowych dla API:

- walidacja loginu
- walidacja unikalnosci `serialNumber`
- zmiana polityki urzadzenia
- mapowanie odpowiedzi dla `GET /agent/policy`
- zapis i walidacja eventow agenta





