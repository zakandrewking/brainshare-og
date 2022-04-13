/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface TableParserMessage {
  status: "PREPARE_UPLOAD" | "UPLOAD_SUCCESS" | "SAVED" | "ERROR";
  error: string;
  file?: {
    name: string;
    nSlices: number;
    accessToken: string;
    userId: string;
    contentType: string;
  };
  uploadedFileId?: string;
}
