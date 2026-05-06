"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { createCareer, updateCareer } from "@/services/careerService";
import { Career, CareerInput, JobType } from "@/types/career";

interface CareerFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career: Career | null;
  onSuccess: () => void;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export default function CareerFormDrawer({
  open,
  onOpenChange,
  career,
  onSuccess,
}: CareerFormDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<JobType>("full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!career;

  useEffect(() => {
    if (career) {
      setTitle(career.attributes.title);
      setDepartment(career.attributes.department);
      setLocation(career.attributes.location);
      setType(career.attributes.type);
      setDescription(career.attributes.description);
      setRequirements(
        career.attributes.requirements?.length > 0
          ? career.attributes.requirements
          : [""]
      );
      setResponsibilities(
        career.attributes.responsibilities?.length > 0
          ? career.attributes.responsibilities
          : [""]
      );
      setSalaryMin(career.attributes.salary_range?.min?.toString() || "");
      setSalaryMax(career.attributes.salary_range?.max?.toString() || "");
      setSalaryCurrency(career.attributes.salary_range?.currency || "USD");
      setIsActive(career.attributes.is_active);
    } else {
      resetForm();
    }
  }, [career, open]);

  const resetForm = () => {
    setTitle("");
    setDepartment("");
    setLocation("");
    setType("full-time");
    setDescription("");
    setRequirements([""]);
    setResponsibilities([""]);
    setSalaryMin("");
    setSalaryMax("");
    setSalaryCurrency("USD");
    setIsActive(true);
    setError(null);
  };

  const addRequirement = () => setRequirements([...requirements, ""]);
  const removeRequirement = (index: number) => setRequirements(requirements.filter((_, i) => i !== index));
  const changeRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const addResponsibility = () => setResponsibilities([...responsibilities, ""]);
  const removeResponsibility = (index: number) => setResponsibilities(responsibilities.filter((_, i) => i !== index));
  const changeResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !department || !location || !description) {
      setError("Title, department, location, and description are required");
      return;
    }

    const careerData: CareerInput = {
      title,
      department,
      location,
      type,
      description,
      requirements: requirements.filter((r) => r.trim() !== ""),
      responsibilities: responsibilities.filter((r) => r.trim() !== ""),
    };
    if (salaryMin || salaryMax) {
      careerData.salary_range = {
        currency: salaryCurrency,
        ...(salaryMin && { min: parseInt(salaryMin) }),
        ...(salaryMax && { max: parseInt(salaryMax) }),
      };
    }

    try {
      setLoading(true);
      if (isEditing && career) {
        await updateCareer(career.id, { ...(careerData as any), is_active: isActive });
      } else {
        await createCareer({ ...(careerData as any), is_active: isActive });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save job");
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
            {isEditing ? "Edit Job Listing" : "Add Job Listing"}
          </SheetTitle>
          <SheetDescription className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            {isEditing
              ? "Update the details for this open position"
              : "Create a new open position"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex h-[calc(100%-120px)] flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {error && (
              <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
                <X className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
                <p className="text-sm text-[#7d2418]">{error}</p>
              </div>
            )}

            {[
              { id: "title", label: "Job Title", value: title, onChange: setTitle, placeholder: "Senior Frontend Engineer" },
              { id: "department", label: "Department", value: department, onChange: setDepartment, placeholder: "Engineering" },
              { id: "location", label: "Location", value: location, onChange: setLocation, placeholder: "Remote / Manila" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">{field.label}</Label>
                <Input
                  id={field.id}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  required
                  className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Employment Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as JobType)}>
                <SelectTrigger className="h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#241d18]/20">
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-[#241d18] focus:bg-[#f4efe4]">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role and what you're looking for..."
                rows={4}
                required
                className="rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Requirements</Label>
                <button type="button" onClick={addRequirement} className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]">
                  <Plus className="size-3.5" />Add
                </button>
              </div>
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={req} onChange={(e) => changeRequirement(index, e.target.value)} placeholder="e.g. 5+ years of React experience"
                    className="h-10 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20" />
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(index)} className="grid size-10 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Responsibilities</Label>
                <button type="button" onClick={addResponsibility} className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-[#8b4a36] transition-colors hover:text-[#241d18]">
                  <Plus className="size-3.5" />Add
                </button>
              </div>
              {responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={resp} onChange={(e) => changeResponsibility(index, e.target.value)} placeholder="e.g. Build and maintain web applications"
                    className="h-10 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20" />
                  {responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeResponsibility(index)} className="grid size-10 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#b73823] hover:bg-[#fff1e8] hover:text-[#b73823]">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Salary Range (Optional)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min"
                  className="h-10 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20" />
                <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max"
                  className="h-10 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20" />
                <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                  <SelectTrigger className="h-10 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none focus:ring-[#8b4a36]/20"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none border-[#241d18]/20">
                    {["USD", "EUR", "GBP", "PHP"].map((c) => (
                      <SelectItem key={c} value={c} className="text-[#241d18] focus:bg-[#f4efe4]">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between border border-[#241d18]/10 bg-[#f4efe4] p-4">
              <div>
                <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">Active Status</Label>
                <p className="text-xs text-[#6f665d]">{isActive ? "Visible to the public" : "Hidden from the public"}</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[#3d7a5c]" />
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#241d18]/15 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}
              className="h-11 flex-1 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#f4efe4]"
            >Cancel</Button>
            <Button type="submit" disabled={loading}
              className="h-11 flex-1 rounded-none border border-[#241d18] bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none transition-transform hover:-translate-y-0.5 hover:bg-[#8b4a36] disabled:translate-y-0"
            >
              {loading ? (isEditing ? "Updating…" : "Creating…") : isEditing ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
