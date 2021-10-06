#! /bin/bash
    
sudo apt-get update
sudo apt-get install apache2 -y
sudo service apache2 restart
echo "<!doctype html><html><body><h1>Hello world</h1></body></html>"| tee /var/www/html/index.html
EOF