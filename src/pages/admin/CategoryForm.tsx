import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminShell, { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LIMITS, uploadCategoryImage, type Category } from "@/lib/categories";
import { invalidateCategoriesCache } from "@/lib/categoriesCache";
import CategoryImageManager from "@/components/admin/CategoryImageManager";
import PendingImagePicker, { type PendingImage } from "@/components/admin/PendingImagePicker";

const EMPTY_FORM = { name: "", heading: "", description: "" };

export default function AdminCategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<Category["images"]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/categories");
        if (res.status === 401) {
          navigate("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load category");
        const data = await res.json();
        const category = (data.categories as Category[]).find((c) => c.id === id);
        if (!category) throw new Error("Category not found");
        setForm({
          name: category.name,
          heading: category.heading,
          description: category.description,
        });
        setImages(category.images);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load category");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const name = form.name.trim();
    const heading = form.heading.trim();
    const description = form.description.trim();

    if (!name) errors.name = "Category name is required";
    else if (name.length > CATEGORY_LIMITS.name)
      errors.name = `Must be ${CATEGORY_LIMITS.name} characters or fewer`;

    if (!heading) errors.heading = "Heading is required";
    else if (heading.length > CATEGORY_LIMITS.heading)
      errors.heading = `Must be ${CATEGORY_LIMITS.heading} characters or fewer`;

    if (!description) errors.description = "Description is required";
    else if (description.length > CATEGORY_LIMITS.description)
      errors.description = `Must be ${CATEGORY_LIMITS.description} characters or fewer`;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        heading: form.heading.trim(),
        description: form.description.trim(),
      };

      const res = await fetch("/api/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id, ...payload } : payload),
      });
      if (res.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save category");
      }
      const data = await res.json();
      const savedId: string = data.category.id;
      invalidateCategoriesCache();

      if (!isEdit && pendingImages.length > 0) {
        const validPending = pendingImages.filter((p) => !p.error);
        let failures = 0;
        for (const pending of validPending) {
          try {
            await uploadCategoryImage(savedId, pending.file);
          } catch {
            failures++;
          }
        }
        if (failures > 0) {
          setSaving(false);
          setSuccess(
            `Category created, but ${failures} image(s) failed to upload. You can retry from the edit page.`,
          );
          navigate(`/admin/categories/${savedId}/edit`);
          return;
        }
      }

      setSaving(false);
      setSuccess(isEdit ? "Category updated." : "Category created.");
      if (!isEdit) navigate("/admin/categories");
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  }

  const title = isEdit ? "Edit category" : "New category";

  return (
    <AdminShell
      title={title}
      description={
        isEdit
          ? "Changes appear on the public Categories page once saved."
          : "Add a category and optionally upload photos for its gallery."
      }
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/categories">Back to categories</Link>
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
          <AdminCard title="Details" className="space-y-5 lg:col-span-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Category name
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={CATEGORY_LIMITS.name}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Internal name — must be unique.</p>
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Heading</label>
              <Input
                name="heading"
                value={form.heading}
                onChange={handleChange}
                maxLength={CATEGORY_LIMITS.heading}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Shown on the card.</p>
              {fieldErrors.heading && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.heading}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                maxLength={CATEGORY_LIMITS.description}
                required
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {form.description.length}/{CATEGORY_LIMITS.description}
              </p>
              {fieldErrors.description && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.description}</p>
              )}
            </div>

            {success && <p className="text-sm text-primary">{success}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-2 border-t border-border pt-5">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
              </Button>
              <Button type="button" variant="ghost" asChild disabled={saving}>
                <Link to="/admin/categories">Cancel</Link>
              </Button>
            </div>
          </AdminCard>

          <AdminCard
            title="Photos"
            description={
              isEdit
                ? "The first photo is used as the card cover. Reorder with the arrows."
                : "Photos are uploaded after the category is created."
            }
            className="lg:col-span-3"
          >
            {isEdit ? (
              <CategoryImageManager
                categoryId={id as string}
                images={images}
                onImagesChange={setImages}
              />
            ) : (
              <PendingImagePicker
                value={pendingImages}
                onChange={setPendingImages}
                disabled={saving}
              />
            )}
          </AdminCard>
        </form>
      )}
    </AdminShell>
  );
}
