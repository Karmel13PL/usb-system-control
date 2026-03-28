# Database Specification

## Overview

Glowna baza danych projektu to PostgreSQL. Model danych ma obslugiwac:

- administratorow systemu
- zarzadzane komputery
- polityki USB
- whitelist urzadzen USB
- zdarzenia bezpieczenstwa i audit log

Na poziomie MVP zakladamy pojedynczy tenant logiczny. W przyszlosci model mozna
rozszerzyc o `organizations`.

## Design Principles

- wszystkie tabele korzystaja z UUID jako klucza glownego
- wszystkie daty sa zapisywane jako `timestamptz`
- dane historyczne nie powinny byc fizycznie usuwane, jesli sa potrzebne do logow
- relacje i ograniczenia maja pilnowac spojnosc modelu
- whitelist USB ma opierac sie przede wszystkim o `serial_number`

## Entity Relationship Summary

Najwazniejsze zaleznosci:

- jeden administrator moze zmienic polityke wielu urzadzen
- jedno urzadzenie moze generowac wiele zdarzen
- jedno urzadzenie moze miec wiele przypisanych wpisow whitelisty
- jeden wpis whitelisty moze byc przypisany do wielu urzadzen

## Enumerations

### Device Status

Dozwolone wartosci:

- `online`
- `offline`
- `unknown`

### USB Policy Mode

Dozwolone wartosci:

- `allow_all`
- `block_all`
- `whitelist_only`

### User Role

Dozwolone wartosci:

- `admin`

### Event Type

Dozwolone wartosci MVP:

- `device_registered`
- `heartbeat_received`
- `usb_inserted`
- `usb_allowed`
- `usb_blocked`
- `policy_changed`
- `policy_applied`

## Tables

### `users`

Przechowuje konta administratorow systemu.

Columns:

- `id` - UUID, PK
- `email` - varchar(255), unique, not null
- `password_hash` - varchar(255), not null
- `role` - varchar(50), not null, default `admin`
- `created_at` - timestamptz, not null, default now()
- `updated_at` - timestamptz, not null, default now()

Constraints:

- unique index na `email`
- `role` ograniczone do dozwolonych wartosci

Suggested indexes:

- unique `users_email_uq(email)`

### `devices`

Glowna tabela zarzadzanych komputerow.

Columns:

- `id` - UUID, PK
- `hostname` - varchar(255), not null
- `agent_token` - varchar(255), unique, not null
- `status` - varchar(50), not null, default `unknown`
- `policy_mode` - varchar(50), not null, default `whitelist_only`
- `agent_version` - varchar(50), null
- `os_version` - varchar(100), null
- `last_ip_address` - varchar(45), null
- `last_mac_address` - varchar(17), null
- `last_logged_in_user` - varchar(255), null
- `last_domain` - varchar(255), null
- `last_reported_usb_blocked` - boolean, not null, default false
- `device_fingerprint` - varchar(255), null
- `last_seen_at` - timestamptz, null
- `created_at` - timestamptz, not null, default now()
- `updated_at` - timestamptz, not null, default now()


Constraints:

- unique index na `agent_token`
- `status` ograniczone do dozwolonych wartosci
- `policy_mode` ograniczone do dozwolonych wartosci

Suggested indexes:

- unique `devices_agent_token_uq(agent_token)`
- index `devices_status_idx(status)`
- index `devices_last_seen_at_idx(last_seen_at)`
- index `devices_hostname_idx(hostname)`
- index `devices_device_fingerprint_idx(device_fingerprint)`

### `usb_whitelist`

Lista dozwolonych urzadzen USB.

Columns:

- `id` - UUID, PK
- `serial_number` - varchar(255), unique, not null
- `vendor` - varchar(255), null
- `product_name` - varchar(255), null
- `description` - text, null
- `created_at` - timestamptz, not null, default now()
- `updated_at` - timestamptz, not null, default now()

Constraints:

- unique index na `serial_number`

Suggested indexes:

- unique `usb_whitelist_serial_number_uq(serial_number)`
- index `usb_whitelist_vendor_idx(vendor)`

### `device_usb_assignments`

Tabela laczaca urzadzenia z dozwolonymi wpisami whitelisty.

Uwaga:

Jesli na etapie MVP chcesz prostszy system globalnej whitelisty, ta tabela moze
zostac na razie pomieta. Wtedy agent dostaje cala whitelist z `usb_whitelist`.

Columns:

- `id` - UUID, PK
- `device_id` - UUID, FK -> `devices.id`, not null
- `usb_whitelist_id` - UUID, FK -> `usb_whitelist.id`, not null
- `created_at` - timestamptz, not null, default now()

Constraints:

- unikalna para `device_id`, `usb_whitelist_id`

Suggested indexes:

- unique `device_usb_assignments_device_usb_uq(device_id, usb_whitelist_id)`
- index `device_usb_assignments_device_idx(device_id)`
- index `device_usb_assignments_usb_idx(usb_whitelist_id)`

### `events`

Zdarzenia techniczne i bezpieczenstwa pochodzace glownie od agentow.

Columns:

- `id` - UUID, PK
- `device_id` - UUID, FK -> `devices.id`, not null
- `event_type` - varchar(100), not null
- `payload` - jsonb, not null, default `'{}'::jsonb`
- `occurred_at` - timestamptz, not null
- `created_at` - timestamptz, not null, default now()

Constraints:

- `event_type` ograniczone do znanych typow zdarzen

Suggested indexes:

- index `events_device_id_idx(device_id)`
- index `events_event_type_idx(event_type)`
- index `events_occurred_at_idx(occurred_at desc)`
- gin index `events_payload_gin_idx(payload)`

### `audit_logs`

Audit log dla operacji administratora wykonywanych w panelu.

Columns:

- `id` - UUID, PK
- `user_id` - UUID, FK -> `users.id`, not null
- `action` - varchar(100), not null
- `entity_type` - varchar(100), not null
- `entity_id` - UUID, null
- `payload` - jsonb, not null, default `'{}'::jsonb`
- `created_at` - timestamptz, not null, default now()

Suggested indexes:

- index `audit_logs_user_id_idx(user_id)`
- index `audit_logs_entity_type_entity_id_idx(entity_type, entity_id)`
- index `audit_logs_created_at_idx(created_at desc)`

## Relationships

### `users` -> `audit_logs`

- one-to-many

### `devices` -> `events`

- one-to-many

### `devices` -> `device_usb_assignments`

- one-to-many

### `usb_whitelist` -> `device_usb_assignments`

- one-to-many

## Data Integrity Rules

- `users.email` musi byc unikalny
- `devices.agent_token` musi byc unikalny
- `usb_whitelist.serial_number` musi byc unikalny
- `device_usb_assignments` nie moze zawierac duplikatow tej samej pary
- `events.device_id` musi wskazywac istniejace urzadzenie
- `last_reported_usb_blocked` musi byc wartoscia boolean
- `device_fingerprint` powinien byc stabilny dla jednego komputera, jesli mechanizm zostanie wdrozony
- usuniecie `devices` lub `usb_whitelist` powinno byc ograniczone lub realizowane ostroznie

## Deletion Strategy

Rekomendacja MVP:

- `users` - bez twardego usuwania
- `devices` - preferowane soft delete lub status `inactive` w przyszlosci
- `usb_whitelist` - mozna usuwac, ale bez naruszania logow historycznych
- `events` - nie usuwac w MVP
- `audit_logs` - nie usuwac w MVP

## Suggested Migration Order

1. `users`
2. `devices`
3. `usb_whitelist`
4. `device_usb_assignments`
5. `events`
6. `audit_logs`

## Prisma / ORM Notes

Jesli wybierzemy Prisma, warto od razu odwzorowac:

- enumy dla `role`, `status`, `policy_mode`, `event_type`
- `payload` jako `Json`
- relacje z nazwanymi indeksami

## Testing Recommendations

Minimalny zakres testow jednostkowych i integracyjnych dla warstwy danych:

- unikalnosc `email`
- unikalnosc `agent_token`
- unikalnosc `serial_number`
- blokada duplikatu w `device_usb_assignments`
- filtrowanie `events` po `device_id`, `event_type`, `occurred_at`
- poprawne mapowanie `policy_mode`




