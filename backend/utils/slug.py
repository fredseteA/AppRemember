import re
import unicodedata
from firebase_admin import firestore

db = None  


def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text


def generate_unique_slug(full_name: str, _db) -> str:
    base_slug = slugify(full_name)
    slug = base_slug
    counter = 2
    while True:
        existing = _db.collection("memorials").where(
            filter=firestore.FieldFilter("slug", "==", slug)
        ).limit(1).stream()
        if not list(existing):
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1