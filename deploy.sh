#!/bin/bash

# 1. Sicherstellen dass man im master branch ist
CURRENT_BRANCH=$(git branch --show-current)
echo $CURRENT_BRANCH
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "Error: Das Skript darf nur im Master-Branch ausgeführt werden."
    exit 1
fi

# 2. Git-Commit-Hash holen
COMMIT_HASH=$(git rev-parse --short HEAD)
TAG=$(git describe --tags)

if [ -z "$TAG" ]; then
    echo "Error: Kein Git-Tag gefunden. Bitte einen Tag erstellen und erneut versuchen."
    exit 1
fi

# 3. Platzhalter in der index.html und style.css ersetzen
sed -i "s/{{ VERSION_TAG }}/$TAG/g" index.html
sed -i "s/{{ VERSION_TAG }}/$TAG/g" style.css

# 4. Änderungen committen und pushen
git add index.html style.css
git commit --amend --no-edit
git push origin master --force

# 5. Platzer {{ VERSION_TAG }} zurücksetzen für zukünftige Änderungen
sed -i "s/$TAG/{{ VERSION_TAG }}/g" index.html
sed -i "s/$TAG/{{ VERSION_TAG }}/g" style.css

# 6. Änderungen nach dem Zurücksetzen commiten
git add index.html style.css
git commit -m "Cache-Busting Platzhalter zurückgesetzt"
