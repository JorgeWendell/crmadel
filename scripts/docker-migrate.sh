#!/bin/sh
set -e

echo "Aguardando PostgreSQL..."
until pg_isready -h db -U "${POSTGRES_USER:-adelcrm}" -d "${POSTGRES_DB:-adelcrm}" >/dev/null 2>&1; do
  sleep 1
done

echo "Aplicando schema (drizzle-kit push)..."
npx drizzle-kit push --force

echo "Schema aplicado com sucesso."
