#!/usr/bin/env bash
# Configura esta PC (192.168.100.1) para salir a internet por cable
# usando la otra máquina como gateway (192.168.100.2).
#
# Uso: sudo ./scripts/setup-internet-via-cable.sh
# Requiere que la otra PC ya esté compartiendo internet (ver README abajo).

set -euo pipefail

IFACE="${IFACE:-enp0s31f6}"
LOCAL_IP="${LOCAL_IP:-192.168.100.1/24}"
GATEWAY="${GATEWAY:-192.168.100.2}"
DNS="${DNS:-8.8.8.8 1.1.1.1}"
CONN_NAME="${CONN_NAME:-enp0s31f6}"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Ejecutá con sudo: sudo $0"
  exit 1
fi

echo "==> Configurando $CONN_NAME ($IFACE)"
echo "    IP:      $LOCAL_IP"
echo "    Gateway: $GATEWAY"
echo "    DNS:     $DNS"

nmcli connection modify "$CONN_NAME" \
  ipv4.method manual \
  ipv4.addresses "$LOCAL_IP" \
  ipv4.gateway "$GATEWAY" \
  ipv4.dns "$DNS" \
  ipv4.ignore-auto-dns yes

nmcli connection up "$CONN_NAME"

echo ""
echo "==> Probando conectividad..."
if ping -c 2 -W 4 8.8.8.8 >/dev/null 2>&1; then
  echo "OK: hay salida a internet (ping 8.8.8.8)"
else
  echo "FALLO: no hay salida a internet."
  echo ""
  echo "La otra PC ($GATEWAY) debe compartir internet. En esa máquina:"
  echo "  - Linux:   sudo ./scripts/share-internet-linux.sh"
  echo "  - Windows: Panel de control > Redes > Adaptador WiFi > Compartir"
  echo "             (permitir que otros se conecten por Ethernet)"
  exit 1
fi

if ping -c 2 -W 4 google.com >/dev/null 2>&1; then
  echo "OK: DNS funciona (google.com)"
else
  echo "AVISO: ping a google.com falló; revisá DNS."
fi

echo ""
echo "Listo. Reiniciá npm run dev para que el backend conecte a MongoDB Atlas."
