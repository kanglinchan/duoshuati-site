#!/usr/bin/env bash
# 服务器初始化脚本（在轻量香港服务器上以 root 执行）
# 作用：安装 Nginx、创建目录、放好配置、申请免费 HTTPS 证书
set -e

echo "==> 更新系统"
apt-get update -y

echo "==> 安装 Nginx"
apt-get install -y nginx

echo "==> 创建站点目录"
mkdir -p /var/www/quizcraft

echo "==> 部署 Nginx 配置"
# 把本地的 nginx-quizcraft.conf 上传到 /etc/nginx/conf.d/ 后执行以下
nginx -t && systemctl reload nginx

echo "==> 开放防火墙（若使用 ufw）"
ufw allow 80/tcp
ufw allow 443/tcp || true

echo "==> 安装 certbot 申请免费 HTTPS 证书"
apt-get install -y certbot python3-certbot-nginx
# 把下面的域名和邮箱换成你自己的
# certbot --nginx -d quizcraft.example.com --email you@example.com --agree-tos -n

echo "完成。请把 dist/site 下的子目录同步到 /var/www/quizcraft/ 对应目录。"
