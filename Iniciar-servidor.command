#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando servidor en puerto 8080..."
echo ""
npm run dev
echo ""
echo "Servidor detenido. Puedes cerrar esta ventana."
read -p "Presiona Enter para cerrar..."
