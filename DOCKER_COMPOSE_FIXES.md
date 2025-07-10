# 🔧 Krytyczne Poprawki - Konfiguracja Docker Compose

## ✅ Wprowadzone Poprawki

### 1. Rozwiązanie Konfliktów Portów

**Problem:** `workshop-service` i `api-gateway` używały tego samego portu 5000

**Rozwiązanie:**
- `workshop-service`: zmieniono z portu 5000 na **5100**
- `api-gateway`: pozostawiono na porcie **5000** (główny punkt wejścia)

### 2. Ujednolicenie Konfiguracji Serwisów

**Wszystkie serwisy .NET używają teraz:**
- Port wewnętrzny: **80** (w kontenerze)
- Obraz: `mcr.microsoft.com/dotnet/sdk:8.0`
- Komenda: `dotnet run --urls http://0.0.0.0:80`

### 3. Poprawiona Konfiguracja Emergency Service

**Dodano:**
- Własna baza danych: `emergency-db` (port 5434)
- Healthcheck dla bazy danych
- Poprawne zależności między serwisami

### 4. Zaktualizowana Konfiguracja Ocelot

**Plik:** `src/Gateway/WorkshopBooker.Gateway/ocelot.json`
- Wszystkie serwisy używają portu 80 wewnętrznie
- Poprawione routing dla wszystkich mikroserwisów

### 5. Poprawiona Konfiguracja Override

**Plik:** `docker-compose.override.yml`
- Poprawione ścieżki projektów dla wszystkich serwisów
- Dodane brakujące serwisy (insurance, legal, api-gateway)
- Zaktualizowany URL API dla web-app

### 6. Zaktualizowana Konfiguracja Prometheus

**Plik:** `prometheus.yml`
- Wszystkie serwisy używają portu 80
- Dodany monitoring dla api-gateway

## 📋 Mapowanie Portów

| Serwis | Port Zewnętrzny | Port Wewnętrzny | Opis |
|--------|----------------|-----------------|------|
| api-gateway | 5000 | 80 | Główny punkt wejścia |
| workshop-service | 5100 | 80 | Główny serwis warsztatów |
| emergency-service | 5001 | 80 | Serwis awaryjny |
| insurance-service | 5002 | 80 | Serwis ubezpieczeń |
| legal-service | 5003 | 80 | Serwis prawny |
| web-app | 3000 | 3000 | Frontend aplikacji |
| postgres | 5433 | 5432 | Główna baza danych |
| emergency-db | 5434 | 5432 | Baza danych emergency |
| pgadmin | 8080 | 80 | Panel administracyjny bazy |
| prometheus | 9090 | 9090 | Monitoring |

## 🚀 Uruchomienie

```bash
# Uruchom wszystkie serwisy
docker-compose up -d

# Sprawdź status
docker-compose ps

# Logi
docker-compose logs -f
```

## 🔍 Testowanie

1. **API Gateway:** http://localhost:5000
2. **Workshop Service:** http://localhost:5100
3. **Emergency Service:** http://localhost:5001
4. **Insurance Service:** http://localhost:5002
5. **Legal Service:** http://localhost:5003
6. **Web App:** http://localhost:3000
7. **PgAdmin:** http://localhost:8080
8. **Prometheus:** http://localhost:9090

## ⚠️ Ważne Uwagi

1. **Baza danych emergency** ma własną instancję PostgreSQL
2. **Wszystkie serwisy** używają `dotnet watch` w trybie development
3. **API Gateway** jest głównym punktem wejścia dla wszystkich żądań
4. **Frontend** komunikuje się przez API Gateway na porcie 5000

## 🔧 Rozwiązywanie Problemów

### Jeśli serwisy nie startują:
```bash
# Sprawdź logi
docker-compose logs [nazwa-serwisu]

# Restartuj konkretny serwis
docker-compose restart [nazwa-serwisu]

# Usuń wszystkie kontenery i uruchom ponownie
docker-compose down
docker-compose up -d
```

### Jeśli baza danych nie łączy się:
```bash
# Sprawdź czy PostgreSQL działa
docker-compose logs postgres

# Sprawdź połączenie
docker exec -it postgres-workshop psql -U postgres
``` 