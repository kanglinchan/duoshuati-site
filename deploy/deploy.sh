#!/usr/bin/env bash
# 本地一键部署脚本：把 dist/site 同步到轻量香港服务器
# 用法：./deploy/deploy.sh
set -e

# ====== 按你的实际情况修改 ======
SERVER="root@你的服务器IP"          # TODO: 改成轻量服务器公网 IP
REMOTE_DIR="/var/www/quizcraft"     # 服务器上的目标目录
LOCAL_DIST="dist/site"              # 本地构建产物
# =================================

RSYNC="rsync -avz --delete --exclude=*.map"

echo "==> 同步 portal"
$RSYNC "$LOCAL_DIST/portal/"        "$SERVER:$REMOTE_DIR/portal/"

echo "==> 同步 embedded-circuit"
$RSYNC "$LOCAL_DIST/2026-08-embedded-circuit/" "$SERVER:$REMOTE_DIR/2026-08-embedded-circuit/"

echo "==> 同步 english-grammar"
$RSYNC "$LOCAL_DIST/2026-08-english-grammar/" "$SERVER:$REMOTE_DIR/2026-08-english-grammar/"

echo "==> 重载 Nginx"
ssh "$SERVER" "nginx -t && systemctl reload nginx"

echo "部署完成 ✅"
