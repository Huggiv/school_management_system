from __future__ import annotations

import os
import uuid
import zipfile
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

    def save_upload_bundle(self, uploads: list[UploadFile], category: str, student_key: str) -> str:
        if not uploads:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

        category_name = "".join(ch for ch in category if ch.isalnum() or ch in ("-", "_")) or "general"
        category_dir = (self.root / category_name).resolve()
        if self.root not in category_dir.parents and category_dir != self.root:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload category")
        category_dir.mkdir(parents=True, exist_ok=True)

        key = "".join(ch for ch in student_key.lower().replace(" ", "_") if ch.isalnum() or ch in ("-", "_"))
        if not key:
            key = "student"

        archive_file = (category_dir / f"{uuid.uuid4().hex}_{key}.zip").resolve()
        if self.root not in archive_file.parents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload path")

        with zipfile.ZipFile(archive_file, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_handle:
            for upload in uploads:
                if not upload.filename:
                    continue
                content = upload.file.read()
                if len(content) > self.max_upload_mb * 1024 * 1024:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large: {upload.filename}",
                    )
                zip_handle.writestr(self._safe_filename(upload.filename), content)

        return str(archive_file.relative_to(self.root))

    def resolve_download_path(self, relative_path: str) -> Path:
        resolved = (self.root / relative_path).resolve()
        if self.root not in resolved.parents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")
        if not resolved.exists() or not resolved.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        return resolved


storage_service = StorageService()
