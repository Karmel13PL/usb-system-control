# USB System Control

System do zarzadzania dostepem do urzadzen USB na komputerach klienckich.
Projekt jest budowany jako aplikacja SaaS z panelem administracyjnym, backendem
opartym o uslugi oraz agentem Windows do egzekwowania polityk USB.

## Goals

- blokowanie i odblokowywanie urzadzen USB
- whitelist pendrive'ow po numerze seryjnym
- monitoring agentow i heartbeat urzadzen
- logi zdarzen bezpieczenstwa
- architektura nadajaca sie do portfolio

## Planned Tech Stack

- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- Database: PostgreSQL
- Messaging: RabbitMQ
- Infrastructure: Docker Compose + Nginx
- Agent: .NET / Windows Service

## Project Structure

- `docs` - dokumentacja projektu, architektury, API i bazy danych
- `infrastructure` - pliki infrastruktury lokalnej, Docker i Nginx
- `frontend/admin-panel` - panel administracyjny
- `backend` - backend services
- `database` - migracje i seed danych
- `agent/windows-agent` - agent Windows

## Diagrams

- [System Architecture](docs/diagrams/system-architecture.md)
- [Policy Flow](docs/diagrams/policy-flow.md)
- [Database ERD](docs/diagrams/database-erd.md)
- [Agent Workflow](docs/diagrams/agent-workflow.md)

## Git Workflow

Projekt nie powinien byc rozwijany bezposrednio na `main`.

Przyjeta strategia branchy:

- `production` - stabilna galaz produkcyjna, tylko sprawdzone zmiany
- `develop` - glowna galaz developerska
- `feature/*` - nowe funkcje rozwijane od `develop`
- `fix/*` - poprawki bledow rozwijane od `develop`

Zalecany przeplyw pracy:

1. Tworzymy branch `feature/*` lub `fix/*` od `develop`.
2. Implementujemy zmiane razem z testami jednostkowymi.
3. Scalmy zmiane do `develop`.
4. Po zebraniu stabilnego zestawu zmian scalmy `develop` do `production`.

Przyklady nazw branchy:

- `feature/prisma-schema`
- `feature/auth-service-bootstrap`
- `feature/device-heartbeat-contract`
- `fix/api-validation`

## Testing Policy

Testy jednostkowe piszemy od poczatku projektu i traktujemy jako czesc kazdej
zmiany.

Minimalne zasady:

- kazda logika biznesowa powinna miec testy jednostkowe
- walidacja danych wejsciowych powinna byc testowana
- zmiany w kontraktach API powinny miec testy
- poprawki bledow powinny dostawac test regresyjny

Preferowany kierunek:

- backend Node.js: `Vitest` lub `Jest`
- frontend React: `Vitest` + `React Testing Library`
- agent .NET: `xUnit`

## Initial Scope

Pierwsza wersja projektu obejmuje:

- logowanie administratora
- rejestracje i monitoring urzadzen
- polityke blokowania USB
- whitelist urzadzen USB
- logi zdarzen z agentow

## Run Plan

Na tym etapie repozytorium zawiera strukture startowa i dokumentacje techniczna.
Kolejne kroki:

1. dopracowanie modelu danych
2. zaprojektowanie API
3. przygotowanie kontenerow developerskich
4. implementacja backendu
5. implementacja panelu administracyjnego
6. implementacja agenta Windows
