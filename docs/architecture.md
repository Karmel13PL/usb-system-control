# Architecture

## Overview

USB System Control to system do centralnego zarzadzania politykami USB na
komputerach klienckich. Administrator korzysta z panelu webowego, backend
udostepnia API i przechowuje konfiguracje, a agent Windows egzekwuje polityki
na stacjach roboczych.

## Main Components

- `frontend/admin-panel` - panel administracyjny dla operatora
- `backend/api-gateway` - pojedynczy punkt wejscia dla frontendu i integracji
- `backend/auth-service` - logowanie, JWT, konta administratorow
- `backend/device-service` - urzadzenia, statusy, whitelist USB, polityki
- `backend/agent-service` - komunikacja z agentami, heartbeat, zdarzenia
- `database` - PostgreSQL jako glowna baza danych
- `rabbitmq` - komunikacja asynchroniczna i eventy
- `agent/windows-agent` - aplikacja dzialajaca na komputerach klienta

## System Diagram

```mermaid
flowchart TD
    Admin[Administrator]
    Browser[Browser / Admin Panel]
    Gateway[API Gateway]
    Auth[Auth Service]
    Device[Device Service]
    AgentService[Agent Service]
    DB[(PostgreSQL)]
    MQ[(RabbitMQ)]
    WinAgent[Windows Agent]
    OS[Windows USB Control]

    Admin --> Browser
    Browser --> Gateway
    Gateway --> Auth
    Gateway --> Device
    Gateway --> AgentService

    Auth --> DB
    Device --> DB
    AgentService --> DB
    AgentService --> MQ

    WinAgent --> AgentService
    WinAgent --> OS
```

## Policy Flow Diagram

```mermaid
sequenceDiagram
    participant Admin as Administrator
    participant Frontend as React Admin Panel
    participant Gateway as API Gateway
    participant Device as Device Service
    participant DB as PostgreSQL
    participant Agent as Windows Agent

    Admin->>Frontend: Change USB policy
    Frontend->>Gateway: PATCH /devices/:id/policy
    Gateway->>Device: Forward request
    Device->>DB: Save policy
    DB-->>Device: Policy saved
    Device-->>Gateway: Success
    Gateway-->>Frontend: Updated policy
    Agent->>Gateway: GET /agent/policy
    Gateway->>Device: Read current policy
    Device->>DB: Fetch policy and whitelist
    DB-->>Device: Policy data
    Device-->>Gateway: Policy response
    Gateway-->>Agent: Current policy
    Agent->>Agent: Allow or block USB
```

## High-Level Flow

1. Administrator loguje sie do panelu.
2. Frontend komunikuje sie z API Gateway.
3. Backend zapisuje polityki i konfiguracje w PostgreSQL.
4. Agent cyklicznie pobiera polityke oraz wysyla heartbeat.
5. Agent sprawdza podlaczone USB i podejmuje decyzje lokalnie lub z pomoca API.
6. Zdarzenia trafiaja do logow systemowych.

## Initial Architecture Decision

Na start projekt ma strukture mikroserwisowa w repozytorium, ale implementacja
powinna pozostac pragmatyczna. Najwazniejsze jest stworzenie dzialajacego,
spojnego systemu, a nie maksymalna liczba uslug.
