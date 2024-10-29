#!/bin/bash

# Name of the virtual environment directory
VENV_DIR="venv"

# Check if the virtual environment directory already exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv $VENV_DIR
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
source $VENV_DIR/bin/activate

# Install required packages from requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Installing required packages..."
    pip3 install -r requirements.txt
else
    echo "requirements.txt not found. Please create one with the required packages."
fi

echo "Setup complete. Virtual environment is ready and packages are installed."

