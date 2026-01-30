"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPortfolio, updatePortfolio } from "@/services/portfolioService";
import { Portfolio, PortfolioStatus, ProjectStatus } from "@/types/portfolio";
import { IconUpload, IconX } from "@tabler/icons-react";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

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
      
      // Handle imageURL - check if it's just an ID or a full path
      let imageUrl = portfolio.attributes.imageURL;
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = `/api/images/preview/${imageUrl}`;
      }
      setImagePreview(`${API_BASE_URL}${imageUrl}`);
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (portfolio) {
      // Handle imageURL - check if it's just an ID or a full path
      let imageUrl = portfolio.attributes.imageURL;
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = `/api/images/preview/${imageUrl}`;
      }
      setImagePreview(`${API_BASE_URL}${imageUrl}`);
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        if (imageFile) {
          updates.image = imageFile;
        }
        await updatePortfolio(portfolio.id, updates);
      } else {
        if (!imageFile) {
          setError("Image is required");
          return;
        }
        await createPortfolio({
          title,
          category,
          description,
          status,
          project_status: projectStatus,
          link: link || undefined,
          image: imageFile,
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
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Portfolio" : "Create New Portfolio"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update portfolio project details"
              : "Add a new project to your portfolio"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image {!isEditing && "*"}</Label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconUpload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WebP, SVG (max 10MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zopop Virtual Hiring"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PortfolioStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_status">Project Status *</Label>
            <Select value={projectStatus} onValueChange={(v) => setProjectStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="On Progress">On Progress</SelectItem>
                <SelectItem value="NDA">NDA</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Project Link (Optional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <SheetFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Portfolio"
                : "Create Portfolio"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
