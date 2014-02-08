#!/usr/bin/env bash

FIREBASE_URL="your-firebase-url"
FIREBASE_AUTH_TOKEN="your-firebase-auth-token"

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

send_online_since() {
  local json="{\"$1\":{\".sv\": \"timestamp\"}}"
  curl -X PATCH -d "$json" $FIREBASE_URL/presence/online_since.json?auth=$FIREBASE_AUTH_TOKEN > /dev/null 2>&1
}

export -f send_online_since
export FIREBASE_AUTH_TOKEN
export FIREBASE_URL

update_online_since() {
  echo -n "Pushing \"online_since\" data to Firebase... "
  ( IFS=$'\n'; echo "${macs[*]}" ) | xargs -n1 -P10 -I{} bash -c "send_online_since {}"
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
  update_online_since
fi
