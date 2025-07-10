#!/usr/bin/env bash
set -e

echo "Starting WorkshopBooker stack..."
docker-compose pull
docker-compose up -d
