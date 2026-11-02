# Role i uprawnienia

Role są zdefiniowane w `packages/shared-types/src/user/roles.ts`; uprawnienia i przypisanie do ról w `permissions/permissions.ts`. Reguły dostępu do konkretnych zadań i przypisań są osobno w `permissions/accessRules.ts`. Wspólne stałe są źródłem dla aplikacji oraz schematów Zod.

## Macierz uprawnień

| Uprawnienie | ADMIN | MANAGER | AGENT |
| --- | :---: | :---: | :---: |
| Tworzenie użytkowników | ✓ |  |  |
| Przeglądanie użytkowników firmy | ✓ | ✓ |  |
| Aktualizacja / dezaktywacja użytkowników firmy | ✓ |  |  |
| Tworzenie zadań | ✓ |  |  |
| Przeglądanie wszystkich zadań firmy | ✓ |  |  |
| Przeglądanie zadań utworzonych przez ADMIN firmy | ✓* | ✓ |  |
| Przeglądanie przypisanych sobie zadań | ✓* |  | ✓ |
| Przypisanie / zmiana przypisania zadania |  | ✓ |  |
| Kontrolowanie zadań i zmiana ich statusu |  | ✓ |  |
| Zmiana statusu własnego przypisanego zadania |  |  | ✓ |
| Zarządzanie organizacją | ✓ |  |  |

`*` ADMIN korzysta z uprawnienia do wszystkich zadań; AGENT z uprawnienia ograniczonego do przypisanych zadań. Macierz opisuje uprawnienia abstrakcyjne, a nie automatyczny dostęp między firmami.

## Zasady egzekwowania

- Zawsze najpierw sprawdzaj zgodność firmy aktora i zasobu. Rola nigdy nie omija tenant boundary.
- Dostęp MANAGER-a do pojedynczego zadania wymaga tej samej firmy oraz zadania utworzonego przez ADMIN.
- Dostęp AGENT-a wymaga tej samej firmy i zgodności `assignedToId` z ID aktora.
- Przypisanie wymaga MANAGER-a, aktywnego celu o roli AGENT i zgodności firmy celu, aktora oraz zadania.
- Aktualizacja statusu wymaga MANAGER-a w firmie zadania lub AGENT-a przypisanego do zadania.
- ADMIN może przeglądać status, ale nie ma uprawnienia `tasks:status_update`.
- Warstwa serwisów powinna budować zapytania do bazy ze scope firmy; późniejsze middleware nie zastąpi sprawdzeń własności konkretnego zasobu.

Endpoint `POST /api/users` egzekwuje `users:create` po `authenticate`. Middleware weryfikuje podpis i czas ważności tokenu, a następnie pobiera aktualną rolę, firmę i aktywność użytkownika z PostgreSQL. Token nie przenosi uprawnień ani firmy jako zaufanych claimów. Serwis ponownie sprawdza permission oraz istnienie firmy przed zapisem.

Centralne permission strings: `users:create`, `users:view`, `users:update`, `users:deactivate`, `tasks:create`, `tasks:view_all`, `tasks:view_admin_created`, `tasks:view_assigned`, `tasks:assign`, `tasks:reassign`, `tasks:monitor`, `tasks:status_update`, `organization:manage`.
