#!/usr/bin/env bash

set -euo pipefail

script_directory_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${script_directory_path}/.."
npm run validate
