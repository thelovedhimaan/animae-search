#!/usr/bin/env sh
set -eu

base_url="$1"
curl --fail --silent --show-error --retry 6 --retry-delay 5 "${base_url}/healthz"
curl --fail --silent --show-error --retry 3 "${base_url}/" >/dev/null
