#!/usr/bin/env bash

host="$1"
shift
cmd="$@"

until nc -z ${host%:*} ${host#*:}; do
  echo "⏳ Waiting for $host..."
  sleep 2
done

echo "$host is available, starting backend..."
exec $cmd
