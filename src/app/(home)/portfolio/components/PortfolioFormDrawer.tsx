"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPortfolio, updatePortfolio } from "@/services/portfolioService";
import { Portfolio, PortfolioStatus, ProjectStatus } from "@/types/portfolio";

interface PortfolioFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Web Application",
  "Mobile App",
  "E-commerce",
  "Landing Page",
  "Dashboard",
  "API/Backend",
  "Design System",
  "Other",
];

export default function PortfolioFormDrawer({
  open,
  onOpenChange,
  portfolio,
  onSuccess,
}: PortfolioFormDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PortfolioStatus>("Public");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("Public");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!portfolio;

  useEffect(() => {
    if (portfolio) {
      setTitle(portfolio.attributes.title);
      setCategory(portfolio.attributes.category);
      setDescription(portfolio.attributes.description);
      setStatus(portfolio.attributes.status);
      setProjectStatus(portfolio.attributes.project_status);
      setLink(portfolio.attributes.link || "");
      setImagePreview(portfolio.attributes.imageURL);
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [portfolio, open]);

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setStatus("Public");
    setProjectStatus("Public");
    setLink("");
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }
    setImageFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(portfolio ? portfolio.attributes.imageURL : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !category || !description) {
      setError("Title, category, and description are required");
      return;
    }
    if (!isEditing && !imageFile) {
      setError("Image is required");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && portfolio) {
        const updates: any = {
          title,
          category,
          description,
          status,
          project_status: projectStatus,
          link: link || undefined,
        };
        if (imageFile) updates.image = imageFile;
        await updatePortfolio(portfolio.id, updates);
      } else {
        await createPortfolio({
          title,
          category,
          description,
          status,
          project_status: projectStatus,
          link: link || undefined,
          image: imageFile!,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.[0]?.detail ||
          err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} portfolio`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg border-l border-[#241d18]/15 bg-[#fffaf1] p-0 [&>button]:hidden"
      >
        <SheetHeader className="border-b border-[#241d18]/15 bg-[#f4efe4] px-6 py-5 text-left">
          <SheetTitle className="font-serif text-xl text-[#241d18]">
            {isEditing ? "Edit Project" : "Add Project"}
          </SheetTitle>
          <SheetDescription className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            {isEditing ? "Update portfolio project details" : "Create a new portfolio entry"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex h-[calc(100%-120px)] flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {error && (
              <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
                <X className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
                <p className="text-sm text-[#7d2418]">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pf-title" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Project Title</Label>
              <Input
                id="pf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lucid Invoicer"
                required
                className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/20">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-[#241d18] focus:bg-[#f4efe4]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-desc" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Description</Label>
              <Textarea
                id="pf-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the project, technologies used, outcomes..."
                rows={4}
                required
                className="rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Visibility</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PortfolioStatus)}>
                  <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/20">
                    {(["Public", "Private", "Draft"] as PortfolioStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-[#241d18] focus:bg-[#f4efe4]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Project Status</Label>
                <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus)}>
                  <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/20">
                    {(["Public", "On Progress", "NDA", "Local"] as ProjectStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-[#241d18] focus:bg-[#f4efe4]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-link" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Project Link (Optional)</Label>
              <Input
                id="pf-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Project Image{!isEditing && " *"}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative overflow-hidden border border-[#241d18]/10 bg-[#f4efe4]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-48 w-full flex-col items-center justify-center gap-2 border border-dashed border-[#241d18]/20 bg-[#f4efe4] transition-colors hover:border-[#8b4a36]/40 hover:bg-[#f4efe4]/80"
                >
                  <Upload className="size-8 text-[#9d9389]" />
                  <span className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                    Click to upload image
                  </span>
                  <span className="text-xs text-[#9d9389]">PNG, JPG, GIF up to 10MB</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#241d18]/15 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
            >
              {loading
                ? isEditing
                  ? "Updating…"
                  : "Creating…"
                : isEditing
                ? "Update Project"
                : "Add Project"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
