# Database

## Overview

Baza danych przechowuje administratorow, urzadzenia, polityki USB, whitelist
pendrive'ow oraz logi zdarzen.

## ERD Diagram

```mermaid
erDiagram
    users {
        uuid id
        string email
        string password_hash
        string role
        datetime created_at
    }

    devices {
        uuid id
        string hostname
        string agent_token
        string status
        datetime last_seen_at
        string usb_policy_mode
        datetime created_at
    }

    usb_whitelist {
        uuid id
        string serial_number
        string vendor
        string product_name
        string description
        datetime created_at
    }

    device_usb_assignments {
        uuid id
        uuid device_id
        uuid usb_whitelist_id
        datetime created_at
    }

    events {
        uuid id
        uuid device_id
        string event_type
        string payload
        datetime created_at
    }

    devices ||--o{ events : generates
    devices ||--o{ device_usb_assignments : has
    usb_whitelist ||--o{ device_usb_assignments : assigned_to
```

## Initial Entities

### `users`

- `id`
- `email`
- `password_hash`
- `role`
- `created_at`

### `devices`

- `id`
- `hostname`
- `agent_token`
- `status`
- `last_seen_at`
- `usb_policy_mode`
- `created_at`

### `usb_whitelist`

- `id`
- `serial_number`
- `vendor`
- `product_name`
- `description`
- `created_at`

### `device_usb_assignments`

- `id`
- `device_id`
- `usb_whitelist_id`
- `created_at`

### `events`

- `id`
- `device_id`
- `event_type`
- `payload`
- `created_at`

## Notes

- PostgreSQL bedzie glowna baza danych projektu.
- Finalny schemat powinien zostac dopracowany przed implementacja migracji.
- W kolejnych iteracjach mozna dodac tabele organizacji lub tenantow.
