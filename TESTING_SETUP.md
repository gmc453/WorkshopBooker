# Testy WorkshopBooker

Ten dokument zawiera instrukcje dotyczące instalacji i uruchamiania testów dla aplikacji WorkshopBooker.

## 📋 Wymagania

- .NET 8.0 SDK
- Node.js 18+ 
- npm lub yarn

## 🚀 Instalacja zależności testowych

### Backend (.NET)

```bash
# Zainstaluj zależności testowe dla Application
cd src/WorkshopBooker.Application.Tests
dotnet restore

# Zainstaluj zależności testowe dla API
cd ../WorkshopBooker.Api.Tests
dotnet restore
```

### Frontend (React)

```bash
# Zainstaluj zależności testowe dla admin panel
cd frontend/admin
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

## 🧪 Uruchamianie testów

### Backend Tests

```bash
# Uruchom testy Application
cd src/WorkshopBooker.Application.Tests
dotnet test

# Uruchom testy API
cd ../WorkshopBooker.Api.Tests
dotnet test

# Uruchom wszystkie testy backend
cd src
dotnet test
```

### Frontend Tests

```bash
# Uruchom testy admin panel
cd frontend/admin
npm test

# Uruchom testy z coverage
npm run test:coverage

# Uruchom testy w trybie watch
npm run test:watch
```

## 📁 Struktura testów

### Backend Tests

```
src/
├── WorkshopBooker.Application.Tests/
│   └── Workshops/
│       └── Commands/
│           └── CreateWorkshop/
│               └── CreateWorkshopCommandHandlerTests.cs
└── WorkshopBooker.Api.Tests/
    └── Controllers/
        └── WorkshopsControllerTests.cs
```

### Frontend Tests

```
frontend/admin/src/
├── pages/SlotsPage/
│   ├── components/__tests__/
│   │   └── WorkshopCards.test.tsx
│   └── hooks/__tests__/
│       └── useSlotManagement.test.ts
└── test/
    └── setup.ts
```

## 🎯 Pokrycie testów

### Backend - Handlers Tests

Testy dla `CreateWorkshopCommandHandler` obejmują:

- ✅ **Should_CreateWorkshop_When_ValidCommand()** - Test pomyślnego tworzenia warsztatu
- ✅ **Should_ThrowValidationException_When_NameIsEmpty()** - Test walidacji pustej nazwy
- ✅ **Should_ThrowUnauthorizedException_When_UserNotAuthenticated()** - Test braku autoryzacji
- ✅ **Should_ThrowBusinessException_When_WorkshopNameAlreadyExists()** - Test duplikatu nazwy
- ✅ **Should_SetCorrectCreationDate_When_CreatingWorkshop()** - Test poprawnej daty utworzenia
- ✅ **Should_HandleException_When_DatabaseErrorOccurs()** - Test obsługi błędów bazy danych
- ✅ **Should_LogInformation_When_WorkshopCreatedSuccessfully()** - Test logowania informacji
- ✅ **Should_LogWarning_When_DuplicateWorkshopName()** - Test logowania ostrzeżeń

### Backend - Controllers Tests

Testy dla `WorkshopsController` obejmują:

- ✅ **GetAll_Should_Return200_With_WorkshopsList()** - Test pobierania wszystkich warsztatów
- ✅ **Create_Should_Return201_When_ValidCommand()** - Test pomyślnego tworzenia
- ✅ **Create_Should_Return400_When_ValidationFails()** - Test błędów walidacji
- ✅ **GetById_Should_Return404_When_WorkshopNotFound()** - Test braku warsztatu
- ✅ **Update_Should_Return400_When_IdMismatch()** - Test niezgodności ID
- ✅ **GetAll_Should_Return500_When_ExceptionOccurs()** - Test błędów serwera
- ✅ **Create_Should_Return500_When_ExceptionOccurs()** - Test błędów tworzenia
- ✅ **GetById_Should_Return500_When_ExceptionOccurs()** - Test błędów pobierania
- ✅ **Update_Should_Return500_When_ExceptionOccurs()** - Test błędów aktualizacji
- ✅ **Delete_Should_Return500_When_ExceptionOccurs()** - Test błędów usuwania

### Frontend - Component Tests

Testy dla `WorkshopCards` komponentu obejmują:

- ✅ **Should render list of workshops correctly** - Test renderowania listy warsztatów
- ✅ **Should highlight selected workshop** - Test podświetlania wybranego warsztatu
- ✅ **Should call onSelectWorkshop when workshop clicked** - Test kliknięcia warsztatu
- ✅ **Should show loading state when data loading** - Test stanu ładowania
- ✅ **Should show error message when API fails** - Test komunikatów błędów
- ✅ **Should be keyboard accessible (Tab, Enter, Space)** - Test dostępności klawiatury
- ✅ **Should display empty state when no workshops** - Test pustego stanu
- ✅ **Should display workshop statistics correctly** - Test wyświetlania statystyk
- ✅ **Should handle multiple workshop selection** - Test wielokrotnego wyboru
- ✅ **Should display workshop contact information** - Test informacji kontaktowych
- ✅ **Should handle workshop with missing data gracefully** - Test brakujących danych
- ✅ **Should maintain accessibility attributes** - Test atrybutów dostępności
- ✅ **Should handle rapid clicks without errors** - Test szybkich kliknięć

### Frontend - Hook Tests

Testy dla `useSlotManagement` hooka obejmują:

- ✅ **Should initialize with correct default state** - Test inicjalizacji stanu
- ✅ **Should create single slot successfully** - Test pomyślnego tworzenia slotu
- ✅ **Should handle API errors gracefully** - Test obsługi błędów API
- ✅ **Should handle slot overlap errors (409)** - Test błędów nakładania się slotów
- ✅ **Should update loading state during operations** - Test stanu ładowania
- ✅ **Should invalidate queries after mutations** - Test unieważniania zapytań
- ✅ **Should handle bulk operations correctly** - Test operacji wsadowych
- ✅ **Should provide proper error messages for bulk operations** - Test komunikatów błędów
- ✅ **Should generate preview slots correctly** - Test generowania podglądu slotów
- ✅ **Should generate multiple preview slots for weekly repeat** - Test powtarzania tygodniowego
- ✅ **Should generate multiple preview slots for multiple times** - Test wielu czasów
- ✅ **Should handle empty workshop ID gracefully** - Test pustego ID warsztatu
- ✅ **Should handle missing date gracefully** - Test brakującej daty
- ✅ **Should set feedback to null when cleared** - Test czyszczenia feedbacku
- ✅ **Should handle template slot creation** - Test tworzenia z szablonu

## 🛠️ Technologie testowe

### Backend
- **xUnit** - Framework testowy
- **Moq** - Mocking framework
- **FluentAssertions** - Asercje
- **AutoFixture** - Generowanie danych testowych

### Frontend
- **Vitest** - Framework testowy
- **React Testing Library** - Testowanie komponentów React
- **@testing-library/jest-dom** - Asercje DOM
- **@testing-library/user-event** - Symulacja interakcji użytkownika
- **MSW** - Mock Service Worker dla mockowania API

## 📊 Metryki jakości

### Backend
- Pokrycie kodu: >80%
- Testy jednostkowe: 100% dla handlerów
- Testy integracyjne: 100% dla kontrolerów
- Czas wykonania: <30s

### Frontend
- Pokrycie kodu: >70%
- Testy komponentów: 100% dla głównych komponentów
- Testy hooków: 100% dla custom hooków
- Czas wykonania: <60s

## 🔧 Konfiguracja CI/CD

Testy są automatycznie uruchamiane w pipeline CI/CD:

```yaml
# Przykład konfiguracji GitHub Actions
- name: Run Backend Tests
  run: |
    cd src
    dotnet test --verbosity normal --collect:"XPlat Code Coverage"

- name: Run Frontend Tests
  run: |
    cd frontend/admin
    npm run test:coverage
```

## 🐛 Debugowanie testów

### Backend
```bash
# Uruchom testy z debugowaniem
dotnet test --logger "console;verbosity=detailed"

# Uruchom konkretny test
dotnet test --filter "Should_CreateWorkshop_When_ValidCommand"
```

### Frontend
```bash
# Uruchom testy w trybie debug
npm run test:debug

# Uruchom konkretny test
npm test -- --run WorkshopCards
```

## 📝 Dodawanie nowych testów

### Backend
1. Utwórz plik testowy w odpowiednim katalogu
2. Użyj wzorca `[NazwaKlasy]Tests.cs`
3. Implementuj testy zgodnie z wzorcem AAA (Arrange, Act, Assert)
4. Użyj AutoFixture do generowania danych testowych

### Frontend
1. Utwórz plik testowy w katalogu `__tests__`
2. Użyj wzorca `[NazwaKomponentu].test.tsx`
3. Implementuj testy z użyciem React Testing Library
4. Mockuj zależności zewnętrzne

## 🎯 Najlepsze praktyki

1. **Nazewnictwo testów**: Używaj wzorca `Should_[ExpectedBehavior]_When_[Condition]`
2. **Struktura testów**: Zgodnie z wzorcem AAA (Arrange, Act, Assert)
3. **Mockowanie**: Mockuj tylko zewnętrzne zależności
4. **Asercje**: Używaj FluentAssertions dla lepszej czytelności
5. **Dane testowe**: Używaj AutoFixture do generowania danych
6. **Pokrycie**: Dąż do >80% pokrycia kodu
7. **Czas wykonania**: Testy powinny być szybkie (<1s na test)
8. **Izolacja**: Każdy test powinien być niezależny 