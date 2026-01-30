#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando servidor..."
echo ""
npm run dev
echo ""
echo "Servidor detenido. Puedes cerrar esta ventana."
read -p "Presiona Enter para cerrar..."
