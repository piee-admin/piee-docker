"use client";

import { useState, useMemo } from "react";
import FileGrid from "./file-grid";
import FileList from "./file-list";
import FilePreview from "./file-preview";
// import QuickLookPanel from "./quicklook-panel"; // Replaced by FilePreview
import { AppFile } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { LayoutGrid, List, X } from "lucide-react";

export default function FileBrowser({
  files,
  onDelete,
  widgetMode = false, // Dashboard widget support
}: {
  files: AppFile[];
  onDelete: (id: string) => Promise<void> | void;
  widgetMode?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [quickLook, setQuickLook] = useState<AppFile | null>(null);

  // Dropdown sort
  const [dropdownSort, setDropdownSort] = useState("none");

  // Column sort
  const [columnSortField, setColumnSortField] = useState("file_name");
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");

  // --- APPLY DROPDOWN SORT (global sort menu) ---
  const applyDropdownSort = (arr: AppFile[]) => {
    switch (dropdownSort) {
      case "name":
        return arr.sort((a, b) => a.file_name.localeCompare(b.file_name));

      case "kind":
        return arr.sort((a, b) => a.mime_type.localeCompare(b.mime_type));

      case "size":
        return arr.sort((a, b) => a.size - b.size);

      case "date-created":
        return arr.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      default:
        return arr;
    }
  };

  // --- APPLY COLUMN SORT (list view only) ---
  const applyColumnSort = (arr: AppFile[]) => {
    return arr.sort((a, b) => {
      const A = a[columnSortField as keyof AppFile] as any;
      const B = b[columnSortField as keyof AppFile] as any;

      if (A < B) return columnSortOrder === "asc" ? -1 : 1;
      if (A > B) return columnSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const processedFiles = useMemo(() => {
    let arr = [...files];

    // SEARCH
    arr = arr.filter((f) =>
      `${f.file_name} ${f.mime_type}`.toLowerCase().includes(search.toLowerCase())
    );

    // APPLY DROPDOWN SORT
    arr = applyDropdownSort(arr);

    // APPLY COLUMN SORT
    if (!widgetMode && view === "list") {
      arr = applyColumnSort(arr);
    }

    return arr;
  }, [files, search, dropdownSort, columnSortField, columnSortOrder, view, widgetMode]);

  const handleColumnSort = (field: string) => {
    if (columnSortField === field) {
      setColumnSortOrder(columnSortOrder === "asc" ? "desc" : "asc");
    } else {
      setColumnSortField(field);
      setColumnSortOrder("asc");
    }
  };

  return (
    <div className="relative">

      {/* TOP BAR (HIDDEN IN WIDGET MODE) */}
      {!widgetMode && (
        <div className="flex items-center justify-between mb-4">

          {/* SEARCH + CLEAR */}
          <div className="relative w-[240px]">
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* SORT + VIEW TOGGLE */}
          <div className="flex items-center gap-3">

            {/* DROPDOWN SORT */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Sort: {dropdownSort}</Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setDropdownSort("none")}>
                  None
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDropdownSort("name")}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDropdownSort("kind")}>
                  Kind
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDropdownSort("size")}>
                  Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDropdownSort("date-created")}>
                  Date Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* VIEW SWITCH */}
            <Button
              variant={view === "grid" ? "default" : "outline"}
              onClick={() => setView("grid")}
              size="icon"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>

            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              size="icon"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* MAIN VIEW */}
      {widgetMode ? (
        <FileGrid files={processedFiles} onDelete={onDelete} onPreview={setQuickLook} />
      ) : view === "grid" ? (
        <FileGrid files={processedFiles} onDelete={onDelete} onPreview={setQuickLook} />
      ) : (
        <FileList
          files={processedFiles}
          onDelete={onDelete}
          onQuickLook={setQuickLook}
          onSortChange={handleColumnSort}
          sortField={columnSortField}
          sortOrder={columnSortOrder}
        />
      )}

      {/* PREVIEW MODAL */}
      {!widgetMode && (
        <FilePreview
          file={quickLook}
          open={!!quickLook}
          onClose={() => setQuickLook(null)}
        />
      )}
    </div>
  );
}
