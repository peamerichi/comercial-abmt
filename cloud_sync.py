"""
GitHub-based backup/restore for SQLite database.
Stores the DB file in a separate 'data' branch of the same repo,
so it persists across Render deploys (ephemeral filesystem).
"""
import os
import base64
import json
import time
import threading
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.environ.get('GITHUB_BACKUP_TOKEN', '')
GITHUB_REPO = os.environ.get('GITHUB_REPO', 'peamerichi/comercial-abmt')
GITHUB_BRANCH = 'data'
GITHUB_DB_PATH = 'comercial.db'
GITHUB_API = 'https://api.github.com'

# Debounce: avoid uploading on every single write
_last_upload = 0
_upload_lock = threading.Lock()
_MIN_INTERVAL = 30  # minimum seconds between uploads


def _headers():
    return {
        'Authorization': f'token {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
    }


def _ensure_branch():
    """Create the 'data' branch if it doesn't exist."""
    import urllib.request
    import urllib.error

    # Check if branch exists
    url = f'{GITHUB_API}/repos/{GITHUB_REPO}/git/ref/heads/{GITHUB_BRANCH}'
    req = urllib.request.Request(url, headers=_headers())
    try:
        urllib.request.urlopen(req)
        return True  # branch exists
    except urllib.error.HTTPError as e:
        if e.code != 404:
            logger.error(f'GitHub branch check failed: {e.code}')
            return False

    # Get default branch SHA to create from
    url = f'{GITHUB_API}/repos/{GITHUB_REPO}/git/ref/heads/master'
    req = urllib.request.Request(url, headers=_headers())
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        sha = resp['object']['sha']
    except Exception as e:
        logger.error(f'Could not get master SHA: {e}')
        return False

    # Create branch
    url = f'{GITHUB_API}/repos/{GITHUB_REPO}/git/refs'
    body = json.dumps({'ref': f'refs/heads/{GITHUB_BRANCH}', 'sha': sha}).encode()
    req = urllib.request.Request(url, data=body, headers=_headers(), method='POST')
    try:
        urllib.request.urlopen(req)
        logger.info(f'Created branch {GITHUB_BRANCH}')
        return True
    except Exception as e:
        logger.error(f'Could not create branch: {e}')
        return False


def restore_from_github(db_path):
    """Download DB from GitHub if local file doesn't exist or is empty."""
    if not GITHUB_TOKEN:
        logger.info('GITHUB_BACKUP_TOKEN not set, skipping restore')
        return False

    if os.path.exists(db_path) and os.path.getsize(db_path) > 0:
        logger.info('Local DB exists, skipping restore')
        return False

    import urllib.request
    import urllib.error

    url = f'{GITHUB_API}/repos/{GITHUB_REPO}/contents/{GITHUB_DB_PATH}?ref={GITHUB_BRANCH}'
    req = urllib.request.Request(url, headers=_headers())
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        if resp.get('content'):
            # Small file — content inline (base64)
            data = base64.b64decode(resp['content'])
        elif resp.get('download_url'):
            # Large file — need to download via blob API
            blob_url = resp.get('git_url')
            if blob_url:
                blob_req = urllib.request.Request(blob_url, headers=_headers())
                blob_resp = json.loads(urllib.request.urlopen(blob_req).read())
                data = base64.b64decode(blob_resp['content'])
            else:
                # Fallback: direct download
                dl_req = urllib.request.Request(resp['download_url'], headers=_headers())
                data = urllib.request.urlopen(dl_req).read()
        else:
            logger.warning('No content in GitHub response')
            return False

        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        with open(db_path, 'wb') as f:
            f.write(data)
        logger.info(f'Restored DB from GitHub ({len(data)} bytes)')
        return True
    except urllib.error.HTTPError as e:
        if e.code == 404:
            logger.info('No backup found on GitHub (first run)')
        else:
            logger.error(f'GitHub restore failed: {e.code} {e.read().decode()[:200]}')
        return False
    except Exception as e:
        logger.error(f'GitHub restore error: {e}')
        return False


def upload_to_github(db_path):
    """Upload DB to GitHub. Debounced to avoid excessive API calls."""
    if not GITHUB_TOKEN:
        return False

    global _last_upload
    now = time.time()
    if now - _last_upload < _MIN_INTERVAL:
        return False  # too soon

    with _upload_lock:
        if now - _last_upload < _MIN_INTERVAL:
            return False
        _last_upload = now

    return _do_upload(db_path)


def _do_upload(db_path):
    """Actually upload the DB file to GitHub."""
    import urllib.request
    import urllib.error

    if not os.path.exists(db_path):
        return False

    _ensure_branch()

    # Read current file SHA (needed for update)
    url = f'{GITHUB_API}/repos/{GITHUB_REPO}/contents/{GITHUB_DB_PATH}?ref={GITHUB_BRANCH}'
    req = urllib.request.Request(url, headers=_headers())
    current_sha = None
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        current_sha = resp.get('sha')
    except urllib.error.HTTPError as e:
        if e.code != 404:
            logger.error(f'GitHub SHA check failed: {e.code}')
    except Exception:
        pass

    # Read and encode DB
    with open(db_path, 'rb') as f:
        content = base64.b64encode(f.read()).decode()

    # Upload
    body = {
        'message': f'backup {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
        'content': content,
        'branch': GITHUB_BRANCH,
    }
    if current_sha:
        body['sha'] = current_sha

    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_headers(), method='PUT')
    try:
        urllib.request.urlopen(req, timeout=60)
        logger.info(f'Uploaded DB to GitHub ({os.path.getsize(db_path)} bytes)')
        return True
    except Exception as e:
        logger.error(f'GitHub upload failed: {e}')
        return False


def force_upload(db_path):
    """Force upload regardless of debounce timer."""
    global _last_upload
    _last_upload = 0
    return upload_to_github(db_path)


def schedule_background_upload(db_path, delay=5):
    """Schedule an upload after a short delay (non-blocking).
    Groups multiple rapid writes into one upload."""
    def _delayed():
        time.sleep(delay)
        upload_to_github(db_path)
    t = threading.Thread(target=_delayed, daemon=True)
    t.start()
