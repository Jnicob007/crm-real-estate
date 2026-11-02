# Architektura

## Założenia

Repozytorium jest monorepo npm workspaces z dwiema aplikacjami i trzema pakietami współdzielonymi. Frontend i backend mają osobne zależności, konfiguracje TypeScript i procesy uruchomieniowe. Współdzielenie odbywa się przez jawne pakiety workspace, a nie przez importy plików źródłowych drugiej aplikacji.

## Struktura

```text
apps/
  web/
    src/
      app/          # przyszłe składanie aplikacji i konfiguracja startowa
      features/     # niezależne obszary auth, users, tasks, dashboard, companies
      components/   # współdzielone elementy interfejsu
      layouts/      # układy stron
      pages/        # widoki stron
      hooks/        # współdzielone hooki React
      services/     # komunikacja HTTP/API oddzielona od UI
      config/       # konfiguracja frontendu
      types/        # typy lokalne frontendowi
      utils/        # funkcje pomocnicze frontendu
  api/
    src/
      app/          # składanie aplikacji Express
      config/       # konfiguracja środowiska i serwera
      modules/      # users, companies, tasks, auth, permissions
      middleware/   # middleware HTTP i obsługa błędów
      database/     # przyszła konfiguracja Prisma i połączenia
      shared/       # wspólne elementy wewnętrzne backendu
      utils/        # funkcje pomocnicze backendu
packages/
  shared-types/     # współdzielone typy i kontrakty
  validation/       # współdzielone schematy Zod
  config/           # przyszłe współdzielone ustawienia narzędzi
apps/api/prisma/    # schemat PostgreSQL/Prisma
```

## Warstwy i odpowiedzialności

Backendowy `app` składa Express i middleware. Przyszłe moduły domenowe są właścicielami własnych tras, walidacji, typów i logiki; wewnątrz modułu można dodawać `controllers/`, `services/`, `repositories/`, `routes/`, `validators/` i `types/`, gdy pojawią się konkretne potrzeby. Nie należy tworzyć pustych warstw ani przenosić logiki domenowej do konfiguracji serwera. `database` będzie izolować Prisma i dostęp do PostgreSQL. Middleware obsłuży przekrojowe zachowania HTTP, w tym globalną obsługę błędów.

Frontend jest feature-based: kod specyficzny dla funkcji należy do jej katalogu w `features`; elementy używane w wielu funkcjach trafiają do wspólnych katalogów. `services` obsługuje transport i integrację z API, a komponenty prezentują dane.

### Backendowy moduł `users`

`apps/api/src/modules/users/` zawiera:

- `routes/` — `POST /api/users`, podłączający uwierzytelnienie i permission guard;
- `controllers/` — mapowanie HTTP na wywołanie serwisu i format odpowiedzi;
- `services/` — reguły tworzenia konta, hashowanie i przypisanie firmy z kontekstu aktora;
- `repositories/` — dostęp Prisma do `User` i `Company` oraz mapowanie błędów bazy;
- `validators/` — granica wejścia oparta na wspólnym schemacie Zod;
- `types/` — port repozytorium używany przez moduły i testy.

Przepływ: router weryfikuje podpis tokenu i odczytuje aktualne konto z bazy → sprawdza `users:create` → walidator parsuje body → serwis sprawdza firmę aktora i hashuje hasło → repozytorium tworzy rekord przez Prisma → kontroler zwraca bezpieczny widok użytkownika. Firma i rola aktora pochodzą z rekordu użytkownika pobranego w middleware, nigdy z nagłówka ani body.

`apps/api/src/modules/auth/` zawiera minimalne logowanie wymagane do wydania tokenu dostępowego. Token HS256 zawiera tylko `sub`; przy każdym żądaniu rola, firma i stan aktywności są ponownie pobierane z bazy. Hasher Argon2id jest współdzieloną infrastrukturą w `apps/api/src/shared/passwordHasher.ts`. `middleware/errorHandler.ts` zapewnia jednolity format błędów.

## Dodawanie modułów

1. Sprawdź istniejące katalogi i reguły w `DEVELOPMENT_RULES.md`.
2. Rozwijaj funkcję w istniejącym module; dodaj warstwę tylko wtedy, gdy ma konkretną odpowiedzialność.
3. Utrzymuj zależności między modułami jawne i kieruj wywołania przez stabilne eksporty modułu.
4. Unikaj zależności modułu backendowego od szczegółów React i odwrotnie.

Moduły API przewidziane na dalsze etapy: `users`, `companies`, `tasks`, `auth`, `permissions`. Moduły frontendowe: `auth`, `users`, `tasks`, `dashboard`, `companies`.

## Współdzielenie i zależności

`shared-types` publikuje typy kontraktów, role, uprawnienia, reguły dostępu do zasobów i przejść statusu; nie zależy od Prisma ani React. `validation` publikuje schematy Zod i zależy od `shared-types`, aby nie duplikować definicji ról i statusów. `apps/api/prisma/schema.prisma` definiuje relacyjny model przechowywania i jest oddzielony od publicznych typów TypeScript. Zależności aplikacji na pakiety są deklarowane w ich `package.json`; pakiety nie importują kodu aplikacji. `config` pozostaje granicą dla współdzielonych ustawień narzędzi.

Docelowy kierunek zależności:

```text
apps/web ──> shared-types, validation
apps/api ──> shared-types, validation, Prisma ORM
validation ──> shared-types, Zod
shared-types ──> brak zależności runtime
```

Modele domenowe, kontrakty, walidacja Zod, uprawnienia i schemat Prisma pochodzą z etapu 2. Etap 3.1 dodaje minimalne logowanie, chroniony endpoint tworzenia kont przez ADMIN oraz wspólną obsługę błędów. Nie ma publicznej rejestracji, odświeżania tokenów ani frontendowego panelu. Schemat Prisma nie został zmigrowany do bazy; klient jest generowany ze schematu podczas skryptów API.

Szczegóły encji są w `DOMAIN_MODEL.md`, reguł w `BUSINESS_RULES.md`, macierz uprawnień w `PERMISSIONS.md`, a rejestracji w `USER_REGISTRATION.md`.
