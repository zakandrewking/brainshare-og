# generated by datamodel-codegen:
#   filename:  table-parser.json
#   timestamp: 2022-02-17T23:32:44+00:00

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Extra, Field


class Status(Enum):
    prepare_upload = 'PREPARE_UPLOAD'
    upload_success = 'UPLOAD_SUCCESS'
    saved = 'SAVED'
    lasers = 'LASERS'
    error = 'ERROR'


class File(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    name: str
    n_slices: float = Field(..., alias='nSlices')
    access_token: str = Field(..., alias='accessToken')
    content_type: str = Field(..., alias='contentType')


class TableParserMessage(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    status: Status
    error: Optional[str] = ''
    file: Optional[File] = None
    has_lasers: Optional[str] = Field(None, alias='hasLasers')
