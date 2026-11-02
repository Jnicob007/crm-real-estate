# Zasady rozwoju

## KISS i DRY

- Wybieraj najprostsze rozwiązanie spełniające wymaganie.
- Nie dodawaj warstw, abstrakcji, zależności ani pakietów bez konkretnego zastosowania.
- Wspólną logikę umieszczaj w jednym odpowiedzialnym miejscu; nie kopiuj jej między aplikacjami ani modułami.
- Nie twórz alternatywnych źródeł tej samej konfiguracji.

## Nazewnictwo

- Katalogi: `kebab-case`.
- Pliki TypeScript: `camelCase`; komponenty React: `PascalCase`.
- Klasy i modele: `PascalCase`; funkcje: `camelCase`; stałe: `UPPER_SNAKE_CASE`.
- Kontrolery kończą się na `Controller`, serwisy na `Service`, repozytoria na `Repository`.
- Używaj nazw opisujących odpowiedzialność, np. `TaskController`, `assignTask()`.

## Organizacja plików

- Oddzielaj frontend, backend i pakiety współdzielone.
- Kod związany z jedną funkcją umieszczaj w jej module/feature.
- UI wspólne dla wielu funkcji należy do `components`; układy do `layouts`; widoki do `pages`.
- Komunikację HTTP trzymaj w `services`, nie w komponentach prezentacyjnych.
- Backendowe moduły grupują kod według domeny; odpowiedzialności wewnątrz modułu rozdzielaj dopiero, gdy istnieje realna implementacja.
- Typy i schematy współdzielone eksportuj z odpowiednich pakietów.

## Rozbudowa

- Przed dodaniem pliku lub katalogu sprawdź istniejącą architekturę, manifesty workspace i tę dokumentację.
- Rozwijaj istniejący moduł, jeśli odpowiedzialność już do niego należy.
- Nie uzależniaj aplikacji od prywatnych plików innej aplikacji.
- Zachowuj ścisłe typowanie TypeScript; nie wprowadzaj `any`.
- Nie dodawaj modeli, schematów ani warstw bez związku z aktualnym etapem.
- Nie zmieniaj ustalonych konwencji samodzielnie. Zmiana wymaga uzasadnienia technicznego i aktualizacji dokumentacji.
