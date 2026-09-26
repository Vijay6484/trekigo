import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { BASE_URL } from "../config/config";
import { uploadImageFile, uploadMediaFile, type MediaFolder } from "../utils/uploadMedia";

export type ContentField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "image" | "video" | "select";
  options?: { label: string; value: string }[];
};

type ContentCollectionProps = {
  title: string;
  endpoint: string;
  fields: ContentField[];
  imageFolder?: MediaFolder;
};

const emptyFromFields = (fields: ContentField[]) =>
  fields.reduce<Record<string, string | number>>((acc, field) => {
    acc[field.key] = field.type === "number" ? 0 : field.key === "is_active" ? 1 : "";
    return acc;
  }, { is_active: 1, sort_order: 0 });

export default function ContentCollection({
  title,
  endpoint,
  fields,
  imageFolder = "general",
}: ContentCollectionProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>(emptyFromFields(fields));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");

  const load = async () => {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    setRows(data.data || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [endpoint]);

  const save = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${BASE_URL}${endpoint}/${editingId}` : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        is_active: form.is_active === "" ? 1 : Number(form.is_active),
        sort_order: Number(form.sort_order) || 0,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      setError(data.message || "Save failed");
      return;
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyFromFields(fields));
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`${BASE_URL}${endpoint}/${id}`, { method: "DELETE" });
    await load();
  };

  const upload = async (field: ContentField, file: File) => {
    setUploading(field.key);
    try {
      const result =
        field.type === "video"
          ? await uploadMediaFile(file, imageFolder)
          : await uploadImageFile(file, imageFolder);
      setForm((current) => ({ ...current, [field.key]: result.url }));
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading("");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyFromFields(fields));
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-white"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {fields.slice(0, 4).map((field) => (
                <th key={field.key} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {field.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id}>
                {fields.slice(0, 4).map((field) => (
                  <td key={field.key} className="px-6 py-4 text-sm text-gray-900">
                    {field.type === "image" || field.type === "video" ? (
                      row[field.key] ? (
                        field.type === "video" ? (
                          <video src={row[field.key]} className="h-16 w-24 rounded object-cover" />
                        ) : (
                          <img src={row[field.key]} alt="" className="h-16 w-24 rounded object-cover" />
                        )
                      ) : (
                        "—"
                      )
                    ) : (
                      String(row[field.key] ?? "")
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="mr-2 text-blue-600"
                    onClick={() => {
                      setEditingId(row.id);
                      setForm(row);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="inline h-5 w-5" />
                  </button>
                  <button type="button" className="text-red-600" onClick={() => remove(row.id)}>
                    <Trash2 className="inline h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-6 py-8 text-sm text-gray-500" colSpan={5}>
                  Nothing added yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "Add"} {title}</h2>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] || ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "image" || field.type === "video" ? (
                    <div className="space-y-2">
                      <input
                        value={form[field.key] || ""}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        placeholder={field.type === "video" ? "Video URL" : "Image URL"}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-emerald-700">
                        <Upload className="h-4 w-4" />
                        {uploading === field.key ? "Uploading..." : "Upload file"}
                        <input
                          type="file"
                          className="hidden"
                          accept={field.type === "video" ? "video/*" : "image/*"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) upload(field, file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.key]: field.type === "number" ? e.target.value : e.target.value,
                        })
                      }
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Active</label>
                <select
                  value={Number(form.is_active) ? 1 : 0}
                  onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-md border px-4 py-2" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-md bg-emerald-700 px-4 py-2 text-white" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
