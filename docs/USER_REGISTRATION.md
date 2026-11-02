# Rejestracja kont użytkowników

## Dostęp

Nowe konta pracowników tworzy wyłącznie zalogowany użytkownik z rolą ADMIN w swojej firmie. Nie ma publicznej rejestracji ani endpointu tworzącego ADMIN-a z zewnątrz. Próby MANAGER-a lub AGENT-a kończą się `403`; żądania bez poprawnego tokenu kończą się `401`.

Pierwszy ADMIN i firma muszą zostać provisionowani przez zaufaną operację operatorską poza tym endpointem. W repozytorium nie ma jeszcze procedury bootstrapu firmy/ADMIN-a. Po bootstrapie ADMIN może tworzyć kolejne konta ADMIN, MANAGER i AGENT.

## Endpointy

### Logowanie wymagane do uzyskania tokenu

`POST /api/auth/login` przyjmuje `companyId`, `email` i `password`. `companyId` służy wyłącznie do znalezienia konta w obrębie tenanta; nie nadaje uprawnień. E-mail jest normalizowany do małych liter. Błędne dane logowania zwracają jednolite `401`. Endpoint ogranicza liczbę prób do 10 na 15 minut na adres IP.

Udane logowanie zwraca token Bearer ważny 15 minut. Token zawiera tylko `sub` (ID użytkownika); serwer przy każdym chronionym żądaniu pobiera aktualną rolę, firmę i stan aktywności z bazy. Token nie może samodzielnie zmienić uprawnień ani przynależności do firmy.

### Utworzenie użytkownika

`POST /api/users` wymaga nagłówka `Authorization: Bearer <token>` i permission `users:create`.

Przykładowe żądanie:

```http
POST /api/users
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan@example.com",
  "password": "ExamplePassword123!",
  "role": "AGENT"
}
```

Body jest ścisły. Odrzuca `companyId`, `administratorId`, uprawnienia, `passwordHash` oraz inne nieznane pola. Firmę ustala serwer z tożsamości ADMIN-a pobranej z bazy. Hasło musi mieć co najmniej 12 i najwyżej 128 znaków; e-mail jest normalizowany do małych liter; role pochodzą ze wspólnej definicji `ADMIN | MANAGER | AGENT`.

Przykładowa odpowiedź `201`:

```json
{
  "success": true,
  "message": "Użytkownik został utworzony.",
  "data": {
    "id": "uuid",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "email": "jan@example.com",
    "role": "AGENT",
    "isActive": true
  }
}
```

Odpowiedź nie zawiera hasła, hasha, firmy ani danych poświadczeń.

## Hasła i przechowywanie

Hasher korzysta z Argon2id przez bibliotekę `argon2`, która generuje sól i parametry hashy. Weryfikacja używa `argon2.verify`; plaintext nie jest zapisywany ani logowany. Pole `passwordHash` istnieje wyłącznie po stronie API/DB i nie należy do publicznych kontraktów.

Repozytorium tworzy pojedynczy rekord Prisma w jednym zapisie. Firma pochodzi wyłącznie z aktualnego kontekstu aktora; `isActive` i daty są ustawiane przez domyślne wartości modelu. Unikalność `(companyId, email)` mapuje konflikt Prisma na `409`.

## Odpowiedzi i błędy

| Kod | Znaczenie |
| --- | --- |
| `200` | Logowanie zakończone powodzeniem. |
| `201` | Użytkownik utworzony. |
| `400` | Błędny JSON albo nieprawidłowe dane; odpowiedź może zawierać błędy pól. |
| `401` | Brak tokenu, token nieprawidłowy/wygasły, nieaktywne konto lub błędne dane logowania. |
| `403` | Rola nie ma `users:create` albo firma aktora nie jest dostępna. |
| `409` | E-mail zajęty w firmie lub firma nie jest dostępna przy zapisie. |
| `429` | Przekroczony limit prób logowania. |
| `500` | Nieoczekiwany błąd; szczegóły Prisma nie są przekazywane klientowi. |

## Uruchomienie i ograniczenia

Ustaw `DATABASE_URL` i `JWT_ACCESS_SECRET` (co najmniej 32 znaki), wygeneruj Prisma Client i zastosuj schemat do lokalnej bazy deweloperskiej. Migracji nie wykonano, ponieważ nie wskazano skonfigurowanej bazy. Pierwszy ADMIN wymaga zaufanego bootstrapu operatorskiego; publiczne tworzenie kont lub firm nie jest częścią tego etapu.
