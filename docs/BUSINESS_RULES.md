# Reguły biznesowe

Reguły są zapisane jako fundament dla przyszłych usług domenowych. Funkcje w `packages/shared-types` obejmują czyste reguły dostępu do zasobów i przejść statusu; nie stanowią jeszcze działającego backendu ani middleware.

## Tenant i użytkownicy

1. Każdy użytkownik należy do jednej firmy (`companyId` jest wymagane).
2. Każde zadanie należy do jednej firmy.
3. Każda operacja na danych musi być ograniczona do firmy zalogowanego użytkownika. Sprawdzenie roli bez zgodności `companyId` zawsze odmawia dostępu.
4. ADMIN może zarządzać kontami tylko swojej firmy. Dezaktywacja ustawia `isActive = false` i nie usuwa zadań ani relacji historycznych.
5. E-mail użytkownika jest kanonizowany do małych liter przed zapisem i musi być unikalny w obrębie firmy.

## Zadania i przypisanie

1. ADMIN ma uprawnienie do tworzenia zadań; twórca zadania jest wymagany.
2. Zadanie może pozostać bez agenta (`assignedToId = null`).
3. MANAGER może przypisać lub zmienić przypisanie zadania na aktywnego AGENT-a z tej samej firmy.
4. Nie wolno przypisać zadania użytkownikowi z innej firmy. Reguła jest weryfikowana w logice dostępu i zabezpieczona złożonymi kluczami obcymi w PostgreSQL.
5. ADMIN widzi wszystkie zadania swojej firmy. MANAGER widzi zadania utworzone przez ADMIN swojej firmy. AGENT widzi wyłącznie zadania przypisane do siebie.
6. Dezaktywacja użytkownika nie usuwa jego historycznych zadań. Zasady dostępu do historii pozostają tenantowe.

## Statusy

1. Dozwolone statusy to `TODO`, `IN_PROGRESS`, `POSTPONED`, `COMPLETED`.
2. AGENT może zmienić status tylko własnego, przypisanego zadania i tylko zgodnie z macierzą przejść.
3. MANAGER może kontrolować statusy zadań własnej firmy. Może też wznowić ukończone zadanie, zmieniając `COMPLETED` na `TODO`.
4. ADMIN ma uprawnienie do przeglądania statusów, ale w tej definicji nie ma uprawnienia do ich zmiany.
5. Historia zmian nie jest przechowywana na tym etapie. Przyszła usługa powinna zapisywać zmianę statusu wraz z aktorem i czasem w tej samej transakcji co aktualizację zadania.

## Przejścia statusów

| Z | Dozwolone następne statusy |
| --- | --- |
| TODO | IN_PROGRESS, POSTPONED |
| IN_PROGRESS | TODO, POSTPONED, COMPLETED |
| POSTPONED | TODO, IN_PROGRESS |
| COMPLETED | brak dla AGENT-a; MANAGER może wznowić do TODO |

Ponowne ustawienie aktualnego statusu nie jest zmianą i jest odrzucane przez regułę.
