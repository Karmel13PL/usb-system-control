# API

## Purpose

Dokument opisuje planowane endpointy panelu administracyjnego oraz komunikacji z
agentem Windows.

## Authentication

### `POST /auth/login`

Logowanie administratora i pobranie tokenu JWT.

### `GET /auth/me`

Pobranie danych zalogowanego uzytkownika.

## Devices

### `GET /devices`

Lista zarejestrowanych urzadzen.

### `GET /devices/:id`

Szczegoly konkretnego urzadzenia.

### `PATCH /devices/:id/policy`

Aktualizacja polityki USB dla urzadzenia.

## USB Whitelist

### `GET /usb-devices`

Lista dozwolonych urzadzen USB.

### `POST /usb-devices`

Dodanie urzadzenia USB do whitelisty.

### `DELETE /usb-devices/:id`

Usuniecie urzadzenia USB z whitelisty.

## Agent

### `POST /agent/register`

Rejestracja nowego agenta.

### `POST /agent/heartbeat`

Wysylanie heartbeat i aktualnego statusu urzadzenia.

### `POST /agent/events`

Przesylanie zdarzen, np. USB inserted, USB blocked, USB allowed.

### `GET /agent/policy`

Pobranie aktualnej polityki i whitelisty przez agenta.

## Status

Zakres endpointow jest wersja startowa i bedzie dopracowywany po zaprojektowaniu
modelu danych.
