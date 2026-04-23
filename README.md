# InstantPoll

Aplikacja webowa do tworzenia i udostępniania ankiet online.  
Użytkownik będzie mógł stworzyć głosowanie i udostępnić je innym poprzez link, bez potrzeby zakładania konta.

Autorzy:
- Mateusz Rudnik
- Dawid Mielczarek

---

## Temat projektu

Celem projektu jest zaprojektowanie i implementacja aplikacji umożliwiającej szybkie tworzenie anonimowych ankiet internetowych oraz zbieranie odpowiedzi poprzez udostępniony link.

Planowane funkcjonalności:
- tworzenie ankiet z pytaniami jedno- i wielokrotnego wyboru,
- generowanie linku publicznego do głosowania,
- generowanie linku właściciela do zarządzania ankietą,
- anonimowe głosowanie bez logowania,
- ograniczenie wielokrotnego głosowania (na podstawie IP lub identyfikatora przeglądarki),
- podgląd wyników.

---

## Używane technologie

Projekt planowany jest w oparciu o architekturę mikroserwisową oraz konteneryzację.

### Backend i infrastruktura
- Docker Compose – uruchamianie usług
- PostgreSQL – główna baza danych
- Redis – kolejka zdarzeń oraz cache
- Nginx reverse proxy – obsługa ruchu

### Planowane mikroserwisy
- poll-service – zarządzanie ankietami
- vote-service – obsługa oddawania głosów
- results-service – agregacja wyników
- worker – przetwarzanie zdarzeń asynchronicznych

### Frontend i warstwa API
- Next.js – aplikacja frontendowa
- Next.js Route Handlers – API Gateway

### Backend (mikroserwisy)
- Express.js – implementacja mikroserwisów REST API

### CI/CD
- Jenkins – automatyzacja buildów i wdrożeń

### Monitoring i logi
- Grafana + Loki lub Prometheus

---

## Plan realizacji

Aplikacja będzie projektowana jako zestaw mikroserwisów komunikujących się przez REST API oraz mechanizmy asynchroniczne.

### Tworzenie ankiety
Frontend będzie komunikował się z `poll-service`, który:
- zapisze konfigurację ankiety,
- wygeneruje link publiczny,
- wygeneruje link właściciela.

### Oddawanie głosu
Za obsługę głosowania będzie odpowiadał `vote-service`, który:
- zweryfikuje poprawność danych,
- sprawdzi status ankiety,
- zastosuje mechanizm blokady (IP lub identyfikator przeglądarki),
- zapisze głos w bazie danych.

### Przetwarzanie wyników
Po zapisaniu głosu generowane będzie zdarzenie, które trafi do Redisa.  
Worker będzie odbierał zdarzenia i aktualizował dane dotyczące wyników.

### Pobieranie wyników
`results-service` będzie odpowiadał za:
- udostępnianie wyników,
- agregację danych,
- ewentualny eksport wyników.

### CI/CD
Pipeline w Jenkinsie będzie odpowiedzialny za:
- budowanie obrazów Dockera,
- uruchamianie testów,
- wdrażanie aplikacji na środowisko.
