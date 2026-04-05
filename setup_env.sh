#!/bin/bash

# Script de configuration de l'environnement pour TontineApp
# Ce script aide à résoudre les erreurs de chemin Android SDK et de variables d'environnement

echo "🔧 Configuration de l'environnement..."

# 1. Définition de ANDROID_HOME si non défini
if [ -z "$ANDROID_HOME" ]; then
    # Chemins par défaut courants
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "/usr/lib/android-sdk" ]; then
        export ANDROID_HOME="/usr/lib/android-sdk"
    elif [ -d "/home/userland/Android/sdk" ]; then
        export ANDROID_HOME="/home/userland/Android/sdk"
    fi
fi

if [ -n "$ANDROID_HOME" ]; then
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    echo "✅ ANDROID_HOME défini sur : $ANDROID_HOME"
else
    echo "⚠️ Attention : ANDROID_HOME n'a pas pu être détecté automatiquement."
fi

# 2. Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "📝 Création d'un fichier .env de modèle..."
    cat <<EOT > .env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
OPENAI_API_KEY=votre_cle_openai
EOT
    echo "✅ Fichier .env créé. Veuillez le remplir avec vos clés."
fi

# 3. Nettoyage et réinstallation (optionnel mais recommandé)
echo "🧹 Pour nettoyer le cache et réinstaller proprement, lancez :"
echo "   rm -rf node_modules && npm install"

echo "🚀 Configuration terminée."
