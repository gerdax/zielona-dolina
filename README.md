# Zielona Dolina

Przeglądarkowa gra o budowaniu osady, rozwoju i obronie przed najazdami.

## Uruchomienie lokalne

Wymagany Python 3:

```sh
python3 -m http.server 8000 --directory dist
```

Otwórz http://localhost:8000. Gra zapisuje postęp w pamięci przeglądarki. Zapis z innej domeny nie przenosi się automatycznie.

## GitHub Pages

W ustawieniach repozytorium wybierz **Settings → Pages → Source: GitHub Actions**. Workflow `Publish game` publikuje katalog `dist` po zmianach w gałęzi `main` albo ręcznym uruchomieniu.

## Testy

Wymagany Node.js:

```sh
for test in tests/*.test.cjs; do node "$test" || exit 1; done
```

Gra nie wymaga instalowania zależności ani procesu kompilacji.
