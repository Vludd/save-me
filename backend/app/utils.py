import hashlib

def make_key(url: str, format_id: str) -> str:
    return hashlib.sha256(f"{url}:{format_id}".encode()).hexdigest()
