#!/bin/zsh

set -eu

project_dir="/Users/bravesaengsiripongpun/ai avoider"
support_dir="/Users/bravesaengsiripongpun/Library/Application Support/Bipass Project Backup"
icloud_backup_dir="/Users/bravesaengsiripongpun/Library/Mobile Documents/com~apple~CloudDocs/Bipass AI Backups"
launch_agent="/Users/bravesaengsiripongpun/Library/LaunchAgents/com.bipassai.project-backup.plist"
service="gui/$(id -u)/com.bipassai.project-backup"

install -d -m 755 "$support_dir" "$icloud_backup_dir"
install -m 755 "$project_dir/scripts/backup-to-icloud.sh" "$support_dir/backup-to-icloud.sh"

if launchctl print "$service" >/dev/null 2>&1; then
  launchctl bootout "$service"
fi

install -m 644 "$project_dir/scripts/com.bipassai.project-backup.plist" "$launch_agent"
launchctl bootstrap "gui/$(id -u)" "$launch_agent"
launchctl enable "$service"

print -- "Installed and started $service"
