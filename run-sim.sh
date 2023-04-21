#!/usr/bin/env zsh

ARDUPILOT_DIRECTORY="$HOME"/ardupilot

source "$HOME"/.zshrc  # to support pyenv

SCRIPT_DIR=${0:a:h}

export PYENV_VERSION="3.10.11"

location_input=""
vared -p "Enter location (leave blank for FARM_RC): " location_input

if [ "$location_input" = "" ]
then
    location_input="FARM_RC"
fi

cp "$SCRIPT_DIR"/sim_locations.txt "$ARDUPILOT_DIRECTORY"/Tools/autotest/locations.txt

pyenv exec python "$ARDUPILOT_DIRECTORY"/Tools/autotest/sim_vehicle.py --no-mavproxy -v ArduPlane --add-param-file "$SCRIPT_DIR"/sim.parm -L "$location_input"

wait
