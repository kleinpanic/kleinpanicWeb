#!/bin/bash

# A function to handle error messages and exit
error_exit() {
    echo "$1" >&2
    exit 1
}

# Check if repo_id was passed as an argument
if [ -z "$1" ]; then
    error_exit "Error: No repo_id provided. Usage: curl https://example.com/install.sh?repo_id=X | sh"
fi

# Function to check if a command is installed
check_command() {
    if ! command -v "$1" &> /dev/null; then
        error_exit "Error: '$1' is not installed. Please install it and try again."
    fi
}

# Check if essential dependencies are installed
check_command "curl"
check_command "git"
check_command "jq"

# GitHub API endpoint to fetch repos for a specific user (replace 'kleinpanic' with your GitHub username)
github_api_url="https://api.github.com/users/kleinpanic/repos"

# Fetch the list of repositories from GitHub
repos=$(curl -s "$github_api_url" | jq -r '.[] | "\(.id) \(.clone_url)"')

# Map repo_id to the GitHub repo URL by searching the fetched repo list
repo_url=$(echo "$repos" | grep "^$1 " | awk '{print $2}')

# Check if a valid repo_url was found for the given repo_id
if [ -z "$repo_url" ]; then
    error_exit "Error: Invalid repo_id. No project found for repo_id=$1"
fi

# Clone the repository
echo "Cloning project from $repo_url ..."
git clone "$repo_url" || error_exit "Error: Failed to clone repository."

# Navigate into the project directory (assuming the repo name matches the project)
repo_name=$(basename "$repo_url" .git)
cd "$repo_name" || error_exit "Error: Failed to enter project directory."

# Perform any necessary installation steps here
if [ -f "install.sh" ]; then
    echo "Running project-specific install script..."
    bash install.sh || error_exit "Error: Project install script failed."
else
    echo "No specific install script found. Installation complete."
fi

# Output success message
echo "Project installed successfully."