#!/usr/bin/env bash

FIREBASE_URL="<!-- @config firebase_url -->"
FIREBASE_AUTH_TOKEN="<!-- @config firebase_auth_token -->"

scan() {
  echo -n "Scanning... "
  macs=( $(sudo nmap -sn 192.168.1.0/24 | grep -Eio "([0-9A-F]{2}:){5}[0-9A-F]{2}") )
  echo -e "done.\n"
}

update_offline_since() {
  echo -n "Pushing \"offline_since\" data to Firebase... "
  local json=()

  for i in "${!macs[@]}"; do
    json[$i]="\"${macs[$i]}\":{\".sv\": \"timestamp\"}"
  done

  json=$( IFS=, ; echo "${json[*]}")
  json="{$json}"

  curl -X PATCH -d "$json" $FIREBASE_URL/presence/offline_since.json?auth=$FIREBASE_AUTH_TOKEN > /dev/null 2>&1
  echo -e "done."
}

scan

if [ ${#macs[@]} -eq 0 ]; then
  echo "No connected devices found."
else
  echo "Found the following connected devices:"
  ( IFS=$'\n'; echo "${macs[*]}" )
  echo ""

  update_offline_since
fi
