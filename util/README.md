# TJUAV GroundStation Utility

## Simulation

Set up the Ardupilot SITL Plane simulation

Note: These instructions currently only work for popular linux distributions (forms of Ubuntu or Arch), and could possibly work for MacOS. 
If something doesn't work or you're unsure, please follow the official setup instructions at [the Ardupilot SITL docs](https://ardupilot.org/dev/docs/sitl-simulator-software-in-the-loop.html).

### Prerequisites

1. `sudo apt install git gitk git-gui python3-venv python3-dev gcc-arm-none-eabi`
2. Set up Python 3.10 or lower (instructions for `pyenv` below)
   1. `curl https://pyenv.run | bash`
   2. `pyenv install 3.10`

### Set up SITL

1. Note the directory you're in - further steps will refer to this as `[ARDUPILOT_DIR]`
2. `git clone https://github.com/ArduPilot/ardupilot.git`
3. `cd ardupilot` (stay in this directory for all future steps)
4. `git submodule update --init --recursive`
5. `./Tools/environment_install/install-prereqs-[DISTRO].sh -y`, replacing `[DISTRO]` with your distro (e.g. ubuntu, arch, mac)
6. `source ~/.profile` or similar (to reload your shell)

### Build SITL

1. `./waf configure --board PixHawk1`
2. `./waf plane` (this command compiles ~1000 C++ files, using 100% CPU for ~5 minutes)

### Manually Run SITL to test

If using `pyenv` as described above:
```bash
export PYENV_VERSION="3.10.11"
pyenv exec python ./Tools/autotest/sim_vehicle.py --no-mavproxy -v ArduPlane
```

### Create an alias

Add the following function wherever your shell stores it's aliases (some common examples are `~/.bash_aliases` and `~/.oh-my-zsh/custom/aliases.zsh`), making sure to replace `[ARDUPILOT_DIR]` with the directory you noted above:
```bash
tjuav-sim() {
    export PYENV_VERSION="3.10.11"
    pyenv exec python [ARDUPILOT_DIR]/Tools/autotest/sim_vehicle.py --no-mavproxy -v ArduPlane --add-param-file [ARDUPILOT_DIR]/Tools/autotest/default_params/avalon.parm -L "$1"
}
```

After reloading your shell (e.g. `source ~/.profile`), you can run `tjuav-sim [LOCATION]` to start the simulation.

### Create a desktop entry

1. Note the directory where you cloned `GroundStation`, which contains this README. This will be referred to as `[GS_DIR]`.
2. Edit the `run-sim.sh` file in `[GS_DIR]/util` to replace part of the third line, specifying `ARDUPILOT_DIRECTORY`, with `[ARDUPILOT_DIR]` from above.
3. Edit the `tjuav-sim-run.desktop` file in `[GS_DIR]/util` to replace `[GS_DIR]` with the directory you noted above.
4. `cp [GS_DIR]/util/tjuav-sim-run.desktop ~/.local/share/applications/`
5. Wait a few seconds, then use your desktop environment's application launcher to search for "Run Plane Simulation". Click on it to start the simulation.

## GroundStation

1. Edit the `tjuav-gs-run.desktop` file in `[GS_DIR]/util` to replace `[GS_DIR]` with the absolute path of your `GroundStation` directory.
2. `cp [GS_DIR]/util/tjuav-gs.desktop ~/.local/share/applications/`
3. Wait a few seconds, then use your desktop environment's application launcher to search for "Run TJUAV GS". Click on it to start the GroundStation.
