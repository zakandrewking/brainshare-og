# generated by datamodel-codegen, then manually edited
#   filename:  table-parser.json

from __future__ import annotations
from typing import Union, Literal
from pydantic import BaseModel, Extra, Field


class Error(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    status: Literal["ERROR"] = "ERROR"
    error: str


class UploadSuccess(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    status: Literal["UPLOAD_SUCCESS"] = "UPLOAD_SUCCESS"


class File(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    name: str
    n_slices: float = Field(..., alias="nSlices")
    access_token: str = Field(..., alias="accessToken")
    user_id: str = Field(..., alias="userId")
    content_type: str = Field(..., alias="contentType")


class PrepareUpload(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    status: Literal["PREPARE_UPLOAD"] = "PREPARE_UPLOAD"
    file: File


class Saved(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    status: Literal["SAVED"] = "SAVED"
    uploaded_file_id: str = Field(..., alias="uploadedFileId")


class TableParserWrapper(BaseModel):
    class Config:
        extra = Extra.forbid
        allow_population_by_field_name = True

    # need to wrap the message to get both pydantic parsing & mypy type checking
    message: Union[
        Error,
        UploadSuccess,
        PrepareUpload,
        Saved,
    ]
