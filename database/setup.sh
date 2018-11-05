#!/bin/bash

echo "Hello"

mongod --dbpath /data/db &

RET=1
while [[ RET -ne 0 ]]; do
    echo "=> Waiting for confirmation of MongoDB service startup"
    sleep 5
    mongo admin --eval "help" >/dev/null 2>&1
    RET=$?
done

ADMINUSER=root
ADMINPASS=mongod

echo "=> Creating an admin user in MongoDB"
mongo admin --eval "db.createUser({
    user: '$ADMINUSER', 
    pwd: '$ADMINPASS', 
    roles:['root']
});"

mongod --dbpath /data/db --shutdown
