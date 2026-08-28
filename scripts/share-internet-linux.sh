#!/usr/bin/env bash
# Ejecutar EN LA OTRA PC (la que tiene WiFi/internet), con IP 192.168.100.2
# Comparte internet hacia esta PC por cable.
#
# Uso en la PC con WiFi: sudo ./scripts/share-internet-linux.sh
# Ajustá WIFI_IFACE y CABLE_IFACE si hace falta.

set -euo pipefail

WIFI_IFACE="${WIFI_IFACE:-}"      # ej. wlan0, wlp3s0
CABLE_IFACE="${CABLE_IFACE:-}"    # ej. enp0s31f6, eth0
CABLE_IP="${CABLE_IP:-192.168.100.2/24}"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Ejecutá con sudo: sudo $0"
  exit 1
fi

if [[ -z "$WIFI_IFACE" || -z "$CABLE_IFACE" ]]; then
  echo "Interfaces detectadas:"
  ip -4 -o addr show | awk '{print $2, $4}'
  echo ""
  read -rp "Interfaz WiFi (con internet): " WIFI_IFACE
  read -rp "Interfaz cable (hacia la otra PC): " CABLE_IFACE
fi

echo "==> Activando reenvío IP..."
sysctl -w net.ipv4.ip_forward=1
grep -q '^net.ipv4.ip_forward=1' /etc/sysctl.d/99-internet-share.conf 2>/dev/null || \
  echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.d/99-internet-share.conf

echo "==> IP en cable: $CABLE_IP"
ip addr flush dev "$CABLE_IFACE" 2>/dev/null || true
ip addr add "$CABLE_IP" dev "$CABLE_IFACE"
ip link set "$CABLE_IFACE" up

echo "==> NAT (masquerade) $WIFI_IFACE -> $CABLE_IFACE"
if command -v nft >/dev/null 2>&1; then
  nft list table ip nat >/dev/null 2>&1 || nft add table ip nat
  nft list chain ip nat postrouting >/dev/null 2>&1 || \
    nft add chain ip nat postrouting '{ type nat hook postrouting priority srcnat; policy accept; }'
  nft add rule ip nat postrouting oifname "$WIFI_IFACE" masquerade 2>/dev/null || true
else
  iptables -t nat -C POSTROUTING -o "$WIFI_IFACE" -j MASQUERADE 2>/dev/null || \
    iptables -t nat -A POSTROUTING -o "$WIFI_IFACE" -j MASQUERADE
  iptables -C FORWARD -i "$CABLE_IFACE" -o "$WIFI_IFACE" -j ACCEPT 2>/dev/null || \
    iptables -A FORWARD -i "$CABLE_IFACE" -o "$WIFI_IFACE" -j ACCEPT
  iptables -C FORWARD -i "$WIFI_IFACE" -o "$CABLE_IFACE" -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || \
    iptables -A FORWARD -i "$WIFI_IFACE" -o "$CABLE_IFACE" -m state --state RELATED,ESTABLISHED -j ACCEPT
fi

echo ""
echo "Listo. En la PC sin WiFi (192.168.100.1) ejecutá:"
echo "  sudo ./scripts/setup-internet-via-cable.sh"
