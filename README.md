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
