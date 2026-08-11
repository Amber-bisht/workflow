"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface RequestInputsNodeProps {
  id: string;
  data: {
    fields: {
      id: string;
      name: string;
      type: "text" | "image";
      value: string;
    }[];
  };
  selected?: boolean;
}

export default function RequestInputsNode({ id, data, selected }: RequestInputsNodeProps) {
  const { updateNodeFieldVal, addField, removeField, renameField } = useWorkflowStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "image">("text");
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);

  // Renaming state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  const handleAddFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    addField(id, newFieldType, newFieldName.trim());
    setNewFieldName("");
    setIsAdding(false);
  };

  const startEditing = (fieldId: string, currentName: string) => {
    setEditingFieldId(fieldId);
    setEditNameValue(currentName);
  };

  const saveRename = (fieldId: string) => {
    if (editNameValue.trim()) {
      renameField(id, fieldId, editNameValue.trim());
    }
    setEditingFieldId(null);
  };

  // Upload image to Transloadit — returns CDN URL
  const handleFileUpload = async (fieldId: string, file: File) => {
    if (!file) return;
    setUploadingFieldId(fieldId);
    try {
      const key = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "4ea0d5fa402bed2f4efd42daa444fd66";
      const expires = new Date(Date.now() + 3_600_000)
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, "+00:00");

      const params = JSON.stringify({
        auth: { key, expires },
        steps: {
          resize: {
            use: ":original",
            robot: "/image/resize",
            result: true,
            width: 99999,
            height: 99999,
            resize_strategy: "fit"
          }
        },
      });

      const form = new FormData();
      form.append("params", params);
      form.append("file", file);

      const res = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Transloadit: ${res.status} — ${errText}`);
      }

      const data = await res.json();

      // Poll for completion (up to 20s)
      const assemblyUrl = data.assembly_ssl_url || data.assembly_url;
      let cdnUrl: string | null = null;
      for (let i = 0; i < 10 && !cdnUrl; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(assemblyUrl).then(r => r.json());
        if ((poll.ok === "ASSEMBLY_COMPLETED" || poll.ok === "ASSEMBLY_EXECUTING") && poll.uploads?.[0]) {
          cdnUrl = poll.uploads[0].ssl_url || poll.uploads[0].url;
        }
        if (poll.error) break;
      }

      if (cdnUrl) {
        updateNodeFieldVal(id, fieldId, cdnUrl);
      } else {
        // Fallback to base64 if no CDN URL returned
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) updateNodeFieldVal(id, fieldId, e.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("[Transloadit] Upload error:", err);
      // Fallback to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) updateNodeFieldVal(id, fieldId, e.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFieldId(null);
    }
  };

  return (
    <div
      className={`w-[280px] bg-white text-neutral-800 border ${
        selected ? "border-violet-500/85 shadow-[0_4px_20px_rgba(139,92,246,0.15)]" : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div>
            <span className="font-bold text-neutral-850 block">Request-Inputs</span>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Starter Node</span>
          </div>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-4 flex flex-col gap-4">
        {data.fields.map((field) => (
          <div key={field.id} className="relative flex flex-col gap-1.5 bg-neutral-50/40 border border-neutral-200/60 p-3 rounded-lg">
            {/* Field Header / Actions */}
            <div className="flex items-center justify-between gap-2">
              {editingFieldId === field.id ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="bg-white border border-violet-500/40 rounded px-1.5 py-0.5 text-neutral-850 w-full focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveRename(field.id)} className="text-emerald-500 hover:text-emerald-400 p-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditingFieldId(null)} className="text-red-500 hover:text-red-400 p-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-neutral-700 truncate">{field.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEditing(field.id, field.name)}
                      className="text-neutral-400 hover:text-neutral-600 p-0.5 transition-colors"
                      title="Rename field"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    {data.fields.length > 1 && (
                      <button
                        onClick={() => removeField(id, field.id)}
                        className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors"
                        title="Remove field"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Field Input area */}
            {field.type === "text" ? (
              <textarea
                value={field.value}
                onChange={(e) => updateNodeFieldVal(id, field.id, e.target.value)}
                placeholder="Enter description text..."
                rows={3}
                className="w-full bg-white border border-neutral-200 rounded-md p-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-violet-500/40 resize-none transition-all"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {uploadingFieldId === field.id ? (
                  <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-center gap-2 text-violet-650 bg-neutral-50">
                    <span className="animate-spin text-lg">⟳</span>
                    <span className="text-[10px] font-medium">Uploading to Transloadit...</span>
                  </div>
                ) : field.value ? (
                  <div className="relative group/img rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-video flex items-center justify-center">
                    <img src={field.value} alt={field.name} className="object-contain max-h-24 w-full" />
                    <button
                      onClick={() => updateNodeFieldVal(id, field.id, "")}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 transition-opacity font-semibold"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-neutral-300 hover:border-violet-500/40 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-neutral-50/50 hover:bg-neutral-50 transition-all text-center">
                    <ImageIcon className="h-5 w-5 text-neutral-400" />
                    <span className="text-[10px] text-neutral-500 font-medium">Upload product photo</span>
                    <span className="text-[8px] text-neutral-400">JPG, PNG, WEBP, GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(field.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Custom Output Handle (always on the right) */}
            <Handle
              type="source"
              position={Position.Right}
              id={field.id}
              style={{
                top: "50%",
                right: "-6px",
                width: "12px",
                height: "12px",
                backgroundColor: field.type === "image" ? "#3b82f6" : "#f97316",
                border: "2px solid #ffffff",
                zIndex: 50,
                cursor: "crosshair",
              }}
              title={`${field.name} (${field.type})`}
            />
          </div>
        ))}

        {/* Add Field section */}
        {isAdding ? (
          <form onSubmit={handleAddFieldSubmit} className="bg-neutral-50 border border-neutral-200 p-3 rounded-lg flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-neutral-500 font-semibold uppercase">Field Name</label>
              <input
                type="text"
                required
                placeholder="e.g. prompt_notes"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="bg-white border border-neutral-200 rounded p-1.5 text-neutral-800 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] text-neutral-500 font-semibold uppercase">Type</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700">
                  <input
                    type="radio"
                    name="newFieldType"
                    checked={newFieldType === "text"}
                    onChange={() => setNewFieldType("text")}
                    className="accent-violet-500"
                  />
                  Text
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-700">
                  <input
                    type="radio"
                    name="newFieldType"
                    checked={newFieldType === "image"}
                    onChange={() => setNewFieldType("image")}
                    className="accent-violet-500"
                  />
                  Image
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 rounded text-[10px] text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[10px] font-semibold"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 border border-dashed border-neutral-300 hover:border-neutral-400 py-2.5 rounded-lg text-neutral-500 hover:text-neutral-800 transition-all font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Field
          </button>
        )}
      </div>
    </div>
  );
}
