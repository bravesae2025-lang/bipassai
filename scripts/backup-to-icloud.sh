#!/bin/zsh

set -eu

project_dir="${1:?Project directory is required}"
backup_dir="${2:?Backup directory is required}"
retention_days="${3:-7}"
backup_prefix="ai-avoider"
lock_dir="/tmp/com.bipassai.project-backup.lock"
temporary_snapshot=""

if [[ ! -d "$project_dir" ]]; then
  print -u2 -- "Backup source does not exist: $project_dir"
  exit 1
fi

mkdir -p -- "$backup_dir"

# Skip cleanly if a previous snapshot is still running.
if ! mkdir -- "$lock_dir" 2>/dev/null; then
  print -- "Backup already running; skipped at $(date '+%Y-%m-%d %H:%M:%S')."
  exit 0
fi

cleanup() {
  if [[ -n "$temporary_snapshot" && -f "$temporary_snapshot" ]]; then
    rm -f -- "$temporary_snapshot"
  fi
  rmdir -- "$lock_dir" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

timestamp="$(date '+%Y-%m-%d_%H-%M-%S')"
snapshot="$backup_dir/${backup_prefix}_${timestamp}.tar.gz"
temporary_snapshot="$(mktemp "$backup_dir/.${backup_prefix}_${timestamp}.partial.XXXXXX")"
project_parent="$(dirname "$project_dir")"
project_name="$(basename "$project_dir")"

# Archive the project directory itself so restoring produces one complete folder.
tar -czf "$temporary_snapshot" -C "$project_parent" "$project_name"
mv -- "$temporary_snapshot" "$snapshot"
temporary_snapshot=""

# Use zsh's own directory access here. macOS can deny /usr/bin/find access to
# iCloud Drive when the same background process can otherwise create files.
zmodload zsh/datetime
zmodload zsh/stat
snapshot_cutoff=$(( EPOCHSECONDS - retention_days * 86400 ))
partial_cutoff=$(( EPOCHSECONDS - 86400 ))
typeset -A file_info

for existing_snapshot in "$backup_dir"/${backup_prefix}_*.tar.gz(N); do
  file_info=()
  zstat -H file_info -- "$existing_snapshot"
  if (( file_info[mtime] <= snapshot_cutoff )); then
    rm -f -- "$existing_snapshot"
  fi
done

for stale_partial in "$backup_dir"/.${backup_prefix}_*.partial.*(N); do
  file_info=()
  zstat -H file_info -- "$stale_partial"
  if (( file_info[mtime] <= partial_cutoff )); then
    rm -f -- "$stale_partial"
  fi
done

snapshot_size="$(du -h "$snapshot" | awk '{print $1}')"
print -- "Created $snapshot ($snapshot_size) at $(date '+%Y-%m-%d %H:%M:%S')."
