"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { createCareer, updateCareer } from "@/services/careerService";
import { Career, CareerInput, JobType } from "@/types/career";
import { IconPlus, IconX } from "@tabler/icons-react";

interface CareerFormModalProps {
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

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
];

export default function CareerFormModal({
  open,
  onOpenChange,
  career,
  onSuccess,
}: CareerFormModalProps) {
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
        career.attributes.requirements.length > 0
          ? career.attributes.requirements
          : [""]
      );
      setResponsibilities(
        career.attributes.responsibilities.length > 0
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

  const handleAddRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleAddResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleResponsibilityChange = (index: number, value: string) => {
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

    const careerData: CareerInput & { is_active?: boolean } = {
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
        await updateCareer(career.id, { ...careerData, is_active: isActive });
      } else {
        await createCareer(careerData);
      }
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.[0]?.detail ||
          err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} career`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Career" : "Create New Career"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the job listing details"
              : "Fill in the details for the new job listing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, New York, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as JobType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((jt) => (
                    <SelectItem key={jt.value} value={jt.value}>
                      {jt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role and what you're looking for..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Requirements</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddRequirement}
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="e.g. 5+ years of React experience"
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRequirement(index)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Responsibilities</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddResponsibility}
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={resp}
                  onChange={(e) =>
                    handleResponsibilityChange(index, e.target.value)
                  }
                  placeholder="e.g. Build and maintain web applications"
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveResponsibility(index)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Salary Range (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                />
              </div>
              <div>
                <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="PHP">PHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is-active">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? "This job listing is visible to the public" : "This job listing is hidden from the public"}
              </p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
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
                ? "Update Career"
                : "Create Career"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
