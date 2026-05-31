# Claude Usage Tracker — Safari (macOS)

Safari ne supporte pas les extensions `.zip` directement. Il faut passer par Xcode pour convertir l'extension WebExtension en app macOS native.

## Prérequis
- macOS 12+
- Xcode 13+ (gratuit sur l'App Store)
- Compte développeur Apple (gratuit suffit pour usage personnel)

## Installation

### Étape 1 — Convertir avec safari-web-extension-converter

Ouvrez le Terminal et lancez :

```bash
xcrun safari-web-extension-converter /chemin/vers/claude-usage-safari \
  --project-location ~/Desktop \
  --app-name "ClaudeUsageTracker" \
  --bundle-identifier com.vous.claudeusagetracker \
  --no-open
```

Cela génère un projet Xcode sur votre Bureau.

### Étape 2 — Compiler dans Xcode

```bash
cd ~/Desktop/ClaudeUsageTracker
xcodebuild -scheme ClaudeUsageTracker -configuration Release \
  CODE_SIGN_IDENTITY="-" \
  build
```

Ou ouvrez `ClaudeUsageTracker.xcodeproj` dans Xcode et cliquez **Run (▶)**.

### Étape 3 — Activer l'extension dans Safari

1. Ouvrez l'app compilée (`ClaudeUsageTracker.app`)
2. Dans Safari → **Préférences** → **Extensions**
3. Activez **Claude Usage Tracker** ✓
4. Autorisez l'accès à `claude.ai` quand Safari le demande

## Notes

- Si Xcode demande un "signing team", sélectionnez votre compte Apple ID personnel
- L'extension fonctionne identiquement à la version Firefox (mêmes fichiers JS/CSS)
- En cas d'erreur CSP dans la console Safari, elle est inoffensive (vient de claude.ai)

## Désinstallation

Safari → Préférences → Extensions → désactivez ou supprimez l'extension, puis mettez l'app à la corbeille.
