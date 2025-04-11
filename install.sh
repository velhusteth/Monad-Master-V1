#!/bin/bash

# Define the cron schedule inside the script (every 1 minute)
CRON_SCHEDULE="* * * * *"  # Set this to run every 1 minute

# Get the absolute path to the directory where the script is located (project path)
PROJECT_PATH="$(cd "$(dirname "$0")" && pwd)"

# Set the log file path
LOG_FILE="$PROJECT_PATH/logs/cronjob.log"

# Ensure the log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# The cron job command
CRON_JOB="cd $PROJECT_PATH && npm run start >> $LOG_FILE 2>&1"

# Check if the cron job already exists
(crontab -l 2>/dev/null | grep -v -F "$CRON_JOB"; echo "$CRON_SCHEDULE $CRON_JOB") | crontab -

# Print confirmation message
echo "Cron job has been added or updated to run at the following schedule:"
echo "$CRON_SCHEDULE"
