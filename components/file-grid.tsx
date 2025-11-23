import FilePreview from "./file-preview";
import { useState } from "react";
import { getFileIconComponent } from "@/lib/file-icons";

export default function FileGrid({ files }: any) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        {files.map((file: any) => {
          const Icon = getFileIconComponent(file.mime_type);
          const isImage = file.mime_type?.startsWith("image/");

          return (
            <div
              key={file.id}
              onClick={() => { setSelected(file); setOpen(true); }}
              className="group border rounded-xl p-4 bg-card shadow-sm hover:shadow-xl hover:bg-accent/20 transition cursor-pointer"
            >
              {isImage ? (
                <img
                  src={file.public_url}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="flex items-center justify-center h-32 bg-muted/20 rounded-md mb-3">
                  <Icon className="w-10 h-10 opacity-70" />
                </div>
              )}

              <p className="truncate font-medium text-sm">
                {file.file_name}
              </p>
            </div>
          );
        })}
      </div>

      <FilePreview
        file={selected}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
