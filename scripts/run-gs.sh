#!/usr/bin/env zsh

source "$HOME"/.zshrc  # to support nvm

SCRIPT_DIR=${0:a:h}

port_input=""
vared -p "Enter port override (enter \".\" for ttyUSB0): " port_input

# Set port config in server/config.json
if [ "$port_input" != "." ]
then
    port=$(printf '%s\n' "$port_input" | sed -e 's/[\/&]/\\&/g')  # escaped for sed
    sed -i "s/\"port\": \".*\",/\"port\": \"$port\",/" "$SCRIPT_DIR"/../server/config.json
else
    port="\/dev\/ttyUSB0"
    sed -i "s/\"port\": \".*\",/\"port\": \"$port\",/" "$SCRIPT_DIR"/../server/config.json
fi

# Run client in background
BROWSER=none npm run start --prefix "$SCRIPT_DIR"/../client | cat &

# Run server
cd "$SCRIPT_DIR"/../server || exit
export FLASK_APP="$SCRIPT_DIR"/../server/app.py
export FLASK_ENV=development
export FLASK_DEBUG=0
"$SCRIPT_DIR"/../server/venv/bin/python -m flask run --host=0.0.0.0

wait
