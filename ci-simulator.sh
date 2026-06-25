#! /usr/bin/bash

cd /var/www/app;

echo "Pulling main branch...";
git pull origin main --ff-only;

echo "Repo is upto date :)";

