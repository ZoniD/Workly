#!/bin/sh
set -eu
if command -v mvn >/dev/null 2>&1; then exec mvn "$@"; fi
VERSION=3.9.14
BASE="${MAVEN_USER_HOME:-$HOME/.m2}/wrapper/dists/apache-maven-$VERSION/workly"
MVN="$BASE/apache-maven-$VERSION/bin/mvn"
if [ ! -x "$MVN" ]; then
  mkdir -p "$BASE"
  TMP="$(mktemp -d)"
  URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$VERSION/apache-maven-$VERSION-bin.tar.gz"
  if command -v curl >/dev/null 2>&1; then curl -fsSL "$URL" -o "$TMP/maven.tgz";
  elif command -v wget >/dev/null 2>&1; then wget -q "$URL" -O "$TMP/maven.tgz";
  else echo "Maven is not installed and curl/wget is unavailable." >&2; exit 1; fi
  tar -xzf "$TMP/maven.tgz" -C "$BASE"
  rm -rf "$TMP"
fi
exec "$MVN" "$@"
