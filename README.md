# InstantPoll

InstantPoll to aplikacja do tworzenia i obsługi anonimowych ankiet online oparta o architekturę mikroserwisową.

Projekt został przygotowany jako aplikacja developerska uruchamiana w homelabie z pełnym pipeline CI/CD opartym o Jenkins, Docker Registry, Liquibase oraz selektywne deploymenty kontenerów.

Aplikacja działa w środowisku Docker Compose i jest wdrażana na dedykowany serwer aplikacyjny.

Autorzy:
- Mateusz Rudnik
- Dawid Mielczarek

---

# Funkcjonalności

- tworzenie anonimowych ankiet
- obsługa pytań single-choice i multiple-choice
- publiczny link do głosowania
- prywatny link administracyjny
- zapisywanie głosów
- agregacja wyników
- architektura mikroserwisowa
- pipeline CI/CD
- automatyczne healthchecki po buildzie
- wersjonowanie obrazów Docker
- selektywne wdrażanie usług
- migracje bazy danych Liquibase
- skanowanie bezpieczeństwa Trivy
- reverse proxy Nginx
- dostęp przez WireGuard VPN
- wildcard DNS dla środowiska guest.lab.lan

---

# Architektura

## Mikroserwisy

Projekt składa się z pięciu głównych modułów:

| Moduł | Opis |
|---|---|
| frontend | Interfejs użytkownika Next.js |
| poll-service | Zarządzanie ankietami |
| vote-service | Obsługa głosowania |
| results-service | Udostępnianie wyników |
| worker | Zadania asynchroniczne i agregacja |

Dodatkowo wykorzystywane są:

| Komponent | Opis |
|---|---|
| PostgreSQL | główna baza danych |
| Redis | komunikacja i cache |
| Liquibase | migracje schematu bazy |
| Jenkins | CI/CD |
| Docker Registry | prywatny registry obrazów |
| Nginx | reverse proxy i HTTPS |
| dnsmasq | wildcard DNS |
| WireGuard | dostęp VPN |

---

# Architektura infrastruktury

Środowisko zostało uruchomione w homelabie na Proxmox VE. Poszczególne elementy aplikacji i infrastruktury działają na osobnych maszynach wirtualnych, co pozwala rozdzielić role systemów i lepiej odwzorować środowisko produkcyjne.

W projekcie wykorzystano oddzielne VM dla Jenkinsa, serwera aplikacyjnego, reverse proxy, DNS oraz WireGuard VPN.

## Platforma homelab

| Element        | Opis                    |
| -------------- | ----------------------- |
| Hypervisor     | Proxmox VE              |
| Typ środowiska | homelab                 |
| Wirtualizacja  | maszyny VM              |
| Systemy VM     | Debian/Linux            |
| Konteneryzacja | Docker + Docker Compose |
| Dostęp zdalny  | WireGuard VPN           |

## Maszyny wirtualne

| VM            | Adres IP      | Rola                      |
| ------------- | ------------- | ------------------------- |
| Jenkins       | 192.168.1.107 | Jenkins + Docker Registry |
| App-Server    | 192.168.1.108 | deployment aplikacji      |
| proxy-guest   | 192.168.1.105 | reverse proxy Nginx       |
| dnsmasq-guest | 192.168.1.106 | wildcard DNS              |
| WireGuard     | 192.168.1.103 | dostęp VPN                |

## Jenkins

Jenkins działa na osobnej maszynie wirtualnej i odpowiada za budowanie obrazów, skanowanie bezpieczeństwa, publikowanie obrazów do prywatnego registry oraz wdrażanie aplikacji na App-Server.

Pipeline korzysta z Jenkinsfile przechowywanych w repozytorium, dzięki czemu logika CI/CD jest wersjonowana razem z kodem aplikacji.

## Jenkins plugins

W Jenkinsie wykorzystywane są pluginy potrzebne do pracy z GitHubem, pipeline'ami, SSH, credentials oraz dynamicznymi parametrami deploymentu.

| Plugin              | Zastosowanie                                     |
| ------------------- | ------------------------------------------------ |
| Pipeline            | obsługa Jenkinsfile i pipeline stages            |
| Git                 | checkout kodu z GitHub                           |
| Credentials         | przechowywanie sekretów i kluczy                 |
| Credentials Binding | wstrzykiwanie sekretów do pipeline               |
| SSH Agent           | deployment przez SSH na App-Server               |
| Folders             | organizacja jobów w katalogi Build i Deploy      |
| Active Choices      | dynamiczne dropdowny z tagami obrazów z registry |

## Organizacja jobów Jenkins

Joby zostały podzielone logicznie na build i deployment.

```text
Build/
├── frontend
├── poll-service
├── vote-service
├── results-service
└── worker

Deployment/
├── infra
├── db-migrate
└── instantpoll
```

Taki podział pozwala budować i wdrażać każdy moduł niezależnie, bez wymuszania pełnego redeploymentu całej aplikacji.

---

# Stack technologiczny

## Backend

- Node.js
- TypeScript
- PostgreSQL
- Redis

## Frontend

- Next.js
- React
- TypeScript

## DevOps

- Docker
- Docker Compose
- Jenkins
- Liquibase
- Trivy
- Nginx
- WireGuard
- dnsmasq

---

# Struktura repozytorium

```text
instantpoll/
├── app/
│   ├── frontend/
│   ├── poll-service/
│   ├── vote-service/
│   ├── results-service/
│   └── worker/
│
├── infra/
│   ├── compose/
│   │   └── docker-compose.prod.yml
│   │
│   └── db/
│       └── changelog.sql
│
├── jenkins/
│   ├── build-module.Jenkinsfile
│   ├── deploy.Jenkinsfile
│   ├── deploy-infra.Jenkinsfile
│   └── db-migrate.Jenkinsfile
│
└── README.md
```

---

# Docker Registry

Projekt wykorzystuje prywatny Docker Registry uruchomiony na VM Jenkins.

Adres registry:

```text
192.168.1.107:5000
```

Przykładowe obrazy:

```text
192.168.1.107:5000/instantpoll/frontend
192.168.1.107:5000/instantpoll/poll-service
192.168.1.107:5000/instantpoll/vote-service
192.168.1.107:5000/instantpoll/results-service
192.168.1.107:5000/instantpoll/worker
```

---

# Wersjonowanie obrazów

Każdy build tworzy unikalny tag w formacie:

```text
b<BUILD_NUMBER>-<GIT_SHA>
```

Przykład:

```text
b14-a1b2c3d
```

Pipeline dodatkowo publikuje tag:

```text
latest
```

Deployment produkcyjny wykorzystuje konkretne wersje obrazów zamiast latest.

---

# CI/CD Pipeline

## Build pipeline

Każdy mikroserwis posiada osobny job buildujący.

Przykładowe joby:

```text
Build/frontend
Build/poll-service
Build/vote-service
Build/results-service
Build/worker
```

Pipeline wykonuje:

1. checkout kodu z GitHub
2. instalację zależności
3. build aplikacji
4. budowę obrazu Docker
5. smoke test obrazu
6. skan bezpieczeństwa Trivy
7. push obrazu do registry
8. cleanup lokalnych obrazów i tymczasowych kontenerów
---

# Trivy Security Scan

Przed pushowaniem obrazów wykonywany jest skan bezpieczeństwa Trivy.

Pipeline blokuje deployment przy wykryciu podatności HIGH lub CRITICAL.

Przykład:

```text
trivy image --severity HIGH,CRITICAL
```

---

# Deployment pipeline

Deployment realizowany jest przez dedykowany Jenkins pipeline.

Job:

```text
Deploy/instantpoll
```

Pipeline umożliwia:

- selektywny deployment usług
- wybór konkretnej wersji obrazu
- dynamiczne dropdowny z tagami obrazów
- aktualizację tylko wybranych kontenerów

Przykład:

```text
frontend -> b14-a1b2c3d
vote-service -> b8-e9f8a7b
```

---

# Deploy infrastruktury

Job:

```text
Deploy/infra
```

Odpowiada za:

- upload docker-compose
- tworzenie pliku .env
- uruchomienie PostgreSQL
- uruchomienie Redis

---

# Migracje bazy danych

Migracje wykonywane są przez Liquibase.

Job:

```text
Deploy/db-migrate
```

Pipeline:

1. upload changelog.sql
2. uruchomienie Liquibase
3. wykonanie migracji PostgreSQL

Wykorzystywany obraz:

```text
liquibase/liquibase:4.26.0-alpine
```

---

# Baza danych

## Główne tabele

| Tabela | Opis |
|---|---|
| polls | ankiety |
| questions | pytania |
| options | opcje odpowiedzi |
| votes | oddane głosy |
| vote_answers | odpowiedzi użytkowników |
| result_counts | zagregowane wyniki |

Schemat bazy zarządzany jest przez Liquibase.

## Tabele

### polls

Przechowuje podstawowe informacje o ankietach.

| Kolumna         | Typ         | Opis                                  |
| --------------- | ----------- | ------------------------------------- |
| id              | UUID        | wewnętrzny identyfikator              |
| public_id       | VARCHAR(12) | publiczny identyfikator ankiety       |
| admin_id        | VARCHAR(32) | prywatny identyfikator administratora |
| title           | TEXT        | tytuł ankiety                         |
| is_active       | BOOLEAN     | status aktywności ankiety             |
| results_visible | BOOLEAN     | widoczność wyników                    |
| created_at      | TIMESTAMPTZ | data utworzenia                       |
| updated_at      | TIMESTAMPTZ | data aktualizacji                     |

---

### questions

Pytania przypisane do ankiety.

| Kolumna  | Typ         | Opis                  |
| -------- | ----------- | --------------------- |
| id       | UUID        | identyfikator pytania |
| poll_id  | UUID        | powiązana ankieta     |
| text     | TEXT        | treść pytania         |
| type     | VARCHAR(10) | single lub multiple   |
| position | SMALLINT    | kolejność pytań       |

---

### options

Możliwe odpowiedzi dla pytania.

| Kolumna     | Typ      | Opis                 |
| ----------- | -------- | -------------------- |
| id          | UUID     | identyfikator opcji  |
| question_id | UUID     | pytanie              |
| text        | TEXT     | treść odpowiedzi     |
| position    | SMALLINT | kolejność odpowiedzi |

---

### votes

Oddane głosy użytkowników.

| Kolumna     | Typ         | Opis                       |
| ----------- | ----------- | -------------------------- |
| id          | UUID        | identyfikator głosu        |
| poll_id     | UUID        | ankieta                    |
| fingerprint | VARCHAR(64) | identyfikator przeglądarki |
| ip_hash     | VARCHAR(64) | opcjonalny hash IP         |
| cast_at     | TIMESTAMPTZ | data oddania głosu         |

---

### vote_answers

Powiązania pomiędzy głosem a wybranymi odpowiedziami.

| Kolumna     | Typ  | Opis          |
| ----------- | ---- | ------------- |
| id          | UUID | identyfikator |
| vote_id     | UUID | oddany głos   |
| question_id | UUID | pytanie       |
| option_id   | UUID | wybrana opcja |

---

### result_counts

Zagregowane wyniki ankiety.

Tabela aktualizowana jest asynchronicznie przez worker.

| Kolumna    | Typ         | Opis                  |
| ---------- | ----------- | --------------------- |
| option_id  | UUID        | opcja odpowiedzi      |
| vote_count | INTEGER     | liczba głosów         |
| updated_at | TIMESTAMPTZ | ostatnia aktualizacja |

## Indeksy

Projekt wykorzystuje indeksy optymalizujące:

* wyszukiwanie ankiet
* pobieranie pytań
* pobieranie odpowiedzi
* sprawdzanie duplikatów głosów

Najważniejsze indeksy:

```text
idx_polls_public_id
idx_polls_admin_id
idx_votes_poll_id
idx_votes_fingerprint
```

## Relacje

```text
polls
 └── questions
      └── options

polls
 └── votes
      └── vote_answers

options
 └── result_counts
```

## API

Frontend komunikuje się z backendem przez Next.js API routes, które pełnią rolę BFF (Backend For Frontend).

System składa się z 4 głównych warstw API:

- frontend → Next.js API routes (`/app/api/*`)
- poll-service → zarządzanie ankietami
- vote-service → obsługa głosów + Redis + worker queue
- results-service → odczyt wyników

### Endpointy aplikacji

| Method | Endpoint                    | Opis                           |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/api/polls`                | tworzenie nowej ankiety        |
| GET    | `/api/polls/:publicId`      | pobranie publicznej ankiety    |
| POST   | `/api/votes`                | oddanie głosu                  |
| GET    | `/api/results/:publicId`    | pobranie wyników ankiety       |
| GET    | `/api/admin/:adminId`       | pobranie panelu administratora |
| PATCH  | `/api/admin/:adminId`       | zmiana ustawień ankiety        |
| DELETE | `/api/admin/:adminId`       | usunięcie ankiety              |
| POST   | `/api/admin/:adminId/reset` | reset wszystkich głosów        |
| GET    | `/api/health`               | healthcheck aplikacji          |

### Healthcheck

Każda usługa udostępnia endpoint:

```text
/health
```

Przykładowa odpowiedź:

```json
{
  "status":"ok",
  "service": "poll-service",
  "uptime":6728.730471533
}
```

---

# Docker Compose

Aplikacja uruchamiana jest przez Docker Compose.

Usługi:

```text
postgres
redis
frontend
poll-service
vote-service
results-service
worker
```

Deployment realizowany jest selektywnie:

```bash
docker compose pull frontend
docker compose up -d frontend
```

---

# Sekrety i konfiguracja

Sekrety przechowywane są w Jenkins Credentials.

Przykładowe sekrety:

```text
instantpoll-postgres-password
app-server-ssh
```

Pipeline dynamicznie generuje plik `.env`.

Przykładowe zmienne:

```env
POSTGRES_DB=instantpoll
POSTGRES_USER=instantpoll
POSTGRES_PASSWORD=***
DATABASE_URL=postgresql://instantpoll:***@postgres:5432/instantpoll
REDIS_URL=redis://redis:6379
```

---

# Reverse Proxy i HTTPS

Reverse proxy działa na VM:

```text
proxy-guest (192.168.1.105)
```

Nginx obsługuje:

- HTTPS
- TLS termination
- proxy_pass do App-Server
- routing po domenie

Przykład:

```text
https://instantpoll.guest.lab.lan
```

proxy_pass:

```text
192.168.1.108:3000
```

---

# Wildcard DNS

Wildcard DNS realizowany jest przez dnsmasq.

VM:

```text
192.168.1.106
```

Konfiguracja:

```conf
address=/.guest.lab.lan/192.168.1.105
```

Wszystkie subdomeny:

```text
*.guest.lab.lan
```

kierowane są na reverse proxy.

---

# Dostęp VPN

Dostęp do środowiska realizowany jest przez WireGuard.

Firewall ogranicza dostęp wyłącznie do:

- DNS
- reverse proxy
- wybranych usług

---

# HTTPS

HTTPS realizowany jest przez Nginx z wykorzystaniem certyfikatów self-signed.

Certyfikaty przechowywane są na proxy-guest.

---

# Deployment flow

## Standardowy flow

1. push kodu na GitHub
2. uruchomienie build pipeline
3. build obrazu Docker
4. smoke test obrazu
5. Trivy scan
6. push do registry
7. cleanup lokalnych obrazów Docker
8. wybór wersji w Deploy/instantpoll
9. deployment wybranych usług
10. healthcheck po wdrożeniu

---

# Uruchomienie lokalne

## Build

```bash
docker compose build
```

## Start

```bash
docker compose up -d
```

## Logi

```bash
docker compose logs -f
```

---

# Status projektu

Projekt jest działającą aplikacją developerską uruchamianą w środowisku homelab.

Aktualnie zaimplementowane:

- architektura mikroserwisowa
- Docker Compose
- CI/CD Jenkins
- prywatny Docker Registry
- Liquibase migrations
- Trivy security scanning
- reverse proxy Nginx
- HTTPS
- WireGuard VPN
- wildcard DNS
- selektywne deploymenty
- wersjonowanie obrazów
- smoke testy kontenerów
- automatyczne healthchecki deploymentów