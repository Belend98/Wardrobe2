## Prerequis

- Node.js LTS
- npm
- Expo Go (telephone) ou emulateur Android/iOS
- Un projet Supabase configure

## Installation

```bash
npm install
```

## Configuration

Creer un fichier `.env` a la racine du projet:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_KEY=...
EXPO_PUBLIC_SUPABASE_CLOTHES_BUCKET=...
EXPO_PUBLIC_SUPABASE_PRIVATE_CLOTHES_BUCKET=...
```

## Lancer le projet

```bash
npx expo start
```

Puis:
- `a` pour Android
- `i` pour iOS (macOS)
- `w` pour Web
- ou scanner le QR code avec Expo Go


## Depannage

- Si cache ou metro bloque:

```bash
npx expo start -c
```

- Si PowerShell bloque `npm.ps1` sous Windows, utiliser `npm.cmd`:

```bash
npm.cmd run lint
```

- Verifier que les variables Supabase sont bien renseignees dans `.env`.
