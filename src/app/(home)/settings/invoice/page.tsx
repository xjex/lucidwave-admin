"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  QrCode,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  InvoicePaymentLink,
  InvoiceSettings,
  createInvoiceProfile,
  getInvoiceLogoViewUrl,
  listInvoiceProfiles,
  updateInvoiceSettings,
  uploadInvoiceLogo,
} from "@/services/settingsService";
import { toast } from "sonner";

const paymentOptions = ["wise", "paypal", "payoneer"];

const inputClass =
  "h-11 rounded-none border-[#241d18]/20 bg-white text-[#241d18] shadow-none placeholder:text-[#9d9389] focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string; error?: string };
    return data.message || data.error || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

const emptySettings: InvoiceSettings = {
  name: "Default Invoice",
  is_default: true,
  payment_tags: ["wise", "paypal", "payoneer"],
  direct_payment_links: [],
  banking_details: "",
  qr_links: [],
};

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<InvoiceSettings[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings>(emptySettings);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listInvoiceProfiles();
        const defaultProfile =
          data.find((profile) => profile.is_default) || data[0] || emptySettings;
        setProfiles(data);
        setSelectedProfileId(defaultProfile.id || "");
        setSettings({
          ...emptySettings,
          ...defaultProfile,
          payment_tags: defaultProfile.payment_tags?.length
            ? defaultProfile.payment_tags
            : emptySettings.payment_tags,
          direct_payment_links: defaultProfile.direct_payment_links || [],
          qr_links: defaultProfile.qr_links || [],
        });
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load invoice settings"));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const selectProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) return;

    setSelectedProfileId(profileId);
    setSettings({
      ...emptySettings,
      ...profile,
      payment_tags: profile.payment_tags?.length
        ? profile.payment_tags
        : emptySettings.payment_tags,
      direct_payment_links: profile.direct_payment_links || [],
      qr_links: profile.qr_links || [],
    });
    setLogoPreviewFailed(false);
  };

  const refreshProfiles = async (profileId?: string) => {
    const nextProfiles = await listInvoiceProfiles();
    setProfiles(nextProfiles);
    const nextProfile =
      nextProfiles.find((profile) => profile.id === profileId) ||
      nextProfiles.find((profile) => profile.id === selectedProfileId) ||
      nextProfiles.find((profile) => profile.is_default) ||
      nextProfiles[0];
    if (nextProfile?.id) {
      setSelectedProfileId(nextProfile.id);
      setSettings({
        ...emptySettings,
        ...nextProfile,
        payment_tags: nextProfile.payment_tags?.length
          ? nextProfile.payment_tags
          : emptySettings.payment_tags,
        direct_payment_links: nextProfile.direct_payment_links || [],
        qr_links: nextProfile.qr_links || [],
      });
      setLogoPreviewFailed(false);
    }
  };

  const createProfile = async () => {
    try {
      setSaving(true);
      const created = await createInvoiceProfile({
        ...emptySettings,
        name: `Invoice Profile ${profiles.length + 1}`,
        is_default: profiles.length === 0,
      });
      await refreshProfiles(created.id);
      toast.success("Invoice profile created.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create invoice profile"));
    } finally {
      setSaving(false);
    }
  };

  const setLink = (
    key: "direct_payment_links" | "qr_links",
    index: number,
    field: keyof InvoicePaymentLink,
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: current[key].map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const addLink = (key: "direct_payment_links" | "qr_links") => {
    setSettings((current) => ({
      ...current,
      [key]: [...current[key], { label: "", url: "" }],
    }));
  };

  const removeLink = (key: "direct_payment_links" | "qr_links", index: number) => {
    setSettings((current) => ({
      ...current,
      [key]: current[key].filter((_, linkIndex) => linkIndex !== index),
    }));
  };

  const togglePaymentTag = (tag: string) => {
    setSettings((current) => {
      const enabled = current.payment_tags.includes(tag);
      return {
        ...current,
        payment_tags: enabled
          ? current.payment_tags.filter((item) => item !== tag)
          : [...current.payment_tags, tag],
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setUploadingLogo(true);
      const nextSettings = await uploadInvoiceLogo(file, selectedProfileId);
      setSettings((current) => ({ ...current, ...nextSettings }));
      await refreshProfiles(nextSettings.id);
      setLogoPreviewFailed(false);
      toast.success("Invoice logo uploaded.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload invoice logo"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const nextSettings = await updateInvoiceSettings({
        name: settings.name || "Invoice Profile",
        is_default: settings.is_default,
        payment_tags: settings.payment_tags,
        direct_payment_links: settings.direct_payment_links,
        banking_details: settings.banking_details || "",
        qr_links: settings.qr_links,
        template_layout: settings.template_layout,
      }, selectedProfileId);
      setSettings((current) => ({ ...current, ...nextSettings }));
      await refreshProfiles(nextSettings.id);
      toast.success("Invoice profile saved.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save invoice settings"));
    } finally {
      setSaving(false);
    }
  };

  const renderLinks = (
    key: "direct_payment_links" | "qr_links",
    title: string,
    icon: React.ReactNode
  ) => (
    <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
      <div className="flex items-center justify-between gap-4 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
              Invoice
            </p>
            <h2 className="font-serif text-2xl">{title}</h2>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => addLink(key)}
          className="h-10 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#fffaf1]"
        >
          <Plus className="mr-2 size-4" />
          Add
        </Button>
      </div>
      <div className="space-y-3 p-5">
        {settings[key].length === 0 ? (
          <div className="border border-[#241d18]/10 bg-[#f4efe4] px-4 py-6 text-sm text-[#6f665d]">
            No links configured yet.
          </div>
        ) : (
          settings[key].map((link, index) => (
            <div
              key={`${key}-${index}`}
              className="grid gap-2 border border-[#241d18]/10 bg-[#f4efe4] p-3 md:grid-cols-[180px_1fr_44px]"
            >
              <Input
                value={link.label}
                onChange={(e) => setLink(key, index, "label", e.target.value)}
                placeholder="Label"
                className={inputClass}
              />
              <Input
                value={link.url}
                onChange={(e) => setLink(key, index, "url", e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeLink(key, index)}
                className="h-11 w-11 rounded-none border-[#241d18]/20 bg-white text-[#574d43] hover:text-[#b73823]"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  );

  const logoPreviewUrl =
    getInvoiceLogoViewUrl(settings.id) || settings.company_logo_url;

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <span className="size-2 bg-[#d95c3f]" />
            Settings
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            Invoice Configuration
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f665d]">
            Configure the branding and payment instructions used on generated
            invoice PDFs.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
            <p className="text-sm text-[#7d2418]">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
            <p className="font-mono text-xs uppercase text-[#6f665d]">
              Loading settings
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
              <div className="flex flex-col gap-4 border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                    Profiles
                  </p>
                  <h2 className="font-serif text-2xl">Invoice Profiles</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={createProfile}
                  disabled={saving}
                  className="h-10 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] shadow-none hover:bg-[#fffaf1]"
                >
                  <Plus className="mr-2 size-4" />
                  New Profile
                </Button>
              </div>
              <div className="grid gap-4 p-5 lg:grid-cols-[260px_1fr_180px] lg:items-end">
                <div className="space-y-2">
                  <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                    Active Profile
                  </Label>
                  <select
                    value={selectedProfileId}
                    onChange={(event) => selectProfile(event.target.value)}
                    className="h-11 w-full border border-[#241d18]/20 bg-white px-3 font-mono text-sm text-[#241d18] outline-none focus:border-[#8b4a36]"
                  >
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                        {profile.is_default ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[11px] uppercase tracking-wide text-[#574d43]">
                    Profile Name
                  </Label>
                  <Input
                    value={settings.name}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="USD Banking Account (Wise)"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      is_default: !current.is_default,
                    }))
                  }
                  className={`h-11 border px-3 font-mono text-[11px] uppercase tracking-wide ${
                    settings.is_default
                      ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                      : "border-[#241d18]/20 bg-white text-[#574d43]"
                  }`}
                >
                  {settings.is_default ? "Default" : "Set Default"}
                </button>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-6">
              <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-5 text-[#8b4a36]" />
                    <h2 className="font-serif text-2xl">Company Logo</h2>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex min-h-36 items-center justify-center border border-[#241d18]/10 bg-[#f4efe4] p-4">
                    {logoPreviewUrl && !logoPreviewFailed ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreviewUrl}
                        alt="Invoice logo"
                        className="max-h-28 max-w-full object-contain"
                        onError={() => setLogoPreviewFailed(true)}
                      />
                    ) : (
                      <div className="text-center text-sm text-[#6f665d]">
                        <ImageIcon className="mx-auto mb-2 size-8 opacity-50" />
                        {settings.company_logo_url
                          ? "Logo preview unavailable"
                          : "No logo uploaded"}
                      </div>
                    )}
                  </div>
                  <Label className="inline-flex h-11 cursor-pointer items-center justify-center border border-[#241d18] bg-[#241d18] px-4 font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] transition-colors hover:bg-[#8b4a36]">
                    <Upload className="mr-2 size-4" />
                    {uploadingLogo ? "Uploading" : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              </section>

              <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-5 text-[#8b4a36]" />
                    <h2 className="font-serif text-2xl">Payment Tags</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-5">
                  {paymentOptions.map((tag) => {
                    const active = settings.payment_tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => togglePaymentTag(tag)}
                        className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                          active
                            ? "border-[#241d18] bg-[#241d18] text-[#fffaf1]"
                            : "border-[#241d18]/20 bg-white text-[#574d43]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
                <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
                  <h2 className="font-serif text-2xl">Banking Details</h2>
                </div>
                <div className="p-5">
                  <Textarea
                    value={settings.banking_details || ""}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        banking_details: e.target.value,
                      }))
                    }
                    rows={8}
                    placeholder="Bank name, account holder, account number, routing/SWIFT, notes..."
                    className="rounded-none border-[#241d18]/20 bg-white shadow-none focus-visible:border-[#8b4a36] focus-visible:ring-[#8b4a36]/20"
                  />
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {renderLinks(
                "direct_payment_links",
                "Direct Payment Links",
                <LinkIcon className="size-5 text-[#8b4a36]" />
              )}
              {renderLinks(
                "qr_links",
                "QR Links",
                <QrCode className="size-5 text-[#8b4a36]" />
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 rounded-none border border-[#241d18] bg-[#241d18] px-5 font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] shadow-none hover:bg-[#8b4a36]"
                >
                  <Save className="mr-2 size-4" />
                  {saving ? "Saving" : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
