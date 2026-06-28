from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


class StorageService:
    def __init__(self) -> None:
        settings = get_settings()
        self.max_upload_mb = settings.storage_max_upload_mb
        self.root = Path(settings.storage_root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _safe_filename(self, filename: str) -> str:
        base_name = os.path.basename(filename)
        sanitized = "".join(ch for ch in base_name if ch.isalnum() or ch in (".", "-", "_"))
        if not sanitized:
            sanitized = "file.bin"
        return f"{uuid.uuid4().hex}_{sanitized}"

    def save_upload(self, upload: UploadFile, category: str) -> str:
        if not upload.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing file name")

        category_name = "".join(ch for ch in category if ch.isalnum() or ch in ("-", "_")) or "general"
        category_dir = (self.root / category_name).resolve()
        if self.root not in category_dir.parents and category_dir != self.root:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload category")
        category_dir.mkdir(parents=True, exist_ok=True)

        target_file = (category_dir / self._safe_filename(upload.filename)).resolve()
        if self.root not in target_file.parents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload path")

        content = upload.file.read()
        if len(content) > self.max_upload_mb * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

        target_file.write_bytes(content)
        return str(target_file.relative_to(self.root))

    def resolve_download_path(self, relative_path: str) -> Path:
        resolved = (self.root / relative_path).resolve()
        if self.root not in resolved.parents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")
        if not resolved.exists() or not resolved.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        return resolved


storage_service = StorageService()
