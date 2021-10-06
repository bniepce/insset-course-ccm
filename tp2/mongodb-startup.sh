#! /bin/bash
sudo apt-get update
sudo apt-get install mongodb -y
sudo service mongodb stop
sudo mkdir $HOME/db
sudo pkill -9 mongod
sudo mongod --dbpath $HOME/db --port 80 --fork --logpath /var/tmp/mongodb --bind_ip_all
EOF