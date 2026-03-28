# Agent

## Purpose

Agent Windows odpowiada za egzekwowanie polityki USB na komputerze klienta oraz
komunikacje z backendem.

## Planned Responsibilities

- rejestracja urzadzenia w systemie
- wysylanie heartbeat
- pobieranie polityki USB
- wykrywanie podlaczenia urzadzen USB
- sprawdzanie whitelisty
- blokowanie lub dopuszczanie urzadzenia
- wysylanie logow zdarzen

## Agent Workflow Diagram

```mermaid
flowchart TD
    Start[Agent Start]
    Register[Register Device]
    Sync[Download Policy and Whitelist]
    Detect[Detect USB Device]
    Check{Serial on Whitelist?}
    Allow[Allow USB]
    Block[Block USB]
    Heartbeat[Send Heartbeat]
    Event[Send Event Log]

    Start --> Register
    Register --> Sync
    Sync --> Detect
    Detect --> Check
    Check -->|Yes| Allow
    Check -->|No| Block
    Allow --> Event
    Block --> Event
    Event --> Heartbeat
    Heartbeat --> Detect
```

## Planned Runtime Model

Agent docelowo powinien dzialac jako Windows Service.

## Planned Technical Areas

- identyfikacja hosta
- komunikacja HTTP z backendem
- lokalny cache polityki
- odczyt informacji o urzadzeniach USB
- egzekwowanie polityki systemowej

## Notes

Implementacja mechanizmu blokowania USB wymaga ostroznego podejscia i dobrej
dokumentacji technicznej, zeby rozdzielic logike biznesowa od operacji
systemowych.
