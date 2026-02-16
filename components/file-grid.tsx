"use client";
import React, { useState } from "react";
import FilePreview from "./file-preview";

import { getFileIconComponent, getFileMimeHelpers } from "@/lib/file-icons";
import { AppFile } from "@/lib/types";
import { AuthenticatedImage } from "@/components/ui/authenticated-image";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { MoreVertical } from "lucide-react";

export default function FileGrid({ files, onDelete }: { files: AppFile[], onDelete: (id: string) => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AppFile | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6 mt-6">
        {files.map((file) => {
          const Icon = getFileIconComponent(file.mime_type);
          const { isImage, isVideo, isPDF } = getFileMimeHelpers(file.mime_type);

          return (
            <div
              key={file.id}
              className="group relative border rounded-xl p-2 bg-card shadow-sm hover:shadow-md hover:bg-accent/20 transition"
            >
              {/* CLICK TO OPEN */}
              <div
                onClick={() => {
                  setSelected(file);
                  setOpen(true);
                }}
                className="cursor-pointer"
              >
                {/* SMALLER SQUARE */}
                <div
                  className="
                    w-full 
                    aspect-square 
                    h-[120px]
                    bg-muted/20 
                    rounded-lg 
                    flex 
                    items-center 
                    justify-center 
                    overflow-hidden
                  "
                >
                  {(isImage || isVideo || isPDF) ? (
                    <AuthenticatedImage
                      src={file.thumbnail_url}
                      alt={file.file_name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Icon className="w-8 h-8 opacity-60" />
                  )}

                </div>
              </div>

              {/* FILE NAME + MENU */}
              <div className="flex items-center justify-between mt-1 pt-3">
                <p
                  className="truncate font-medium text-xs cursor-pointer"
                  onClick={() => {
                    setSelected(file);
                    setOpen(true);
                  }}
                >
                  {file.file_name}
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="p-1"
                  >
                    <MoreVertical className="w-4 h-4 opacity-70 hover:opacity-100" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setDeleteId(file.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* PREVIEW */}
      <FilePreview
        file={selected}
        open={open}
        onClose={() => setOpen(false)}
      />

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={async () => {
                await onDelete(deleteId!);
                setDeleteId(null);
              }}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
