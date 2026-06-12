"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Grip,
  LayoutTemplate,
  Move,
  RotateCcw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InvoiceSettings,
  InvoiceTemplateBlock,
  listInvoiceProfiles,
  updateInvoiceSettings,
} from "@/services/settingsService";
import { toast } from "sonner";

const canvasWidth = 794;
const canvasHeight = 1123;

const blockCatalog: InvoiceTemplateBlock[] = [
  {
    id: "company",
    type: "company",
    label: "Company Header",
    x: 58,
    y: 42,
    width: 300,
    height: 76,
    visible: true,
  },
  {
    id: "invoice-title",
    type: "invoice-title",
    label: "Invoice Title",
    x: 505,
    y: 58,
    width: 230,
    height: 72,
    visible: true,
  },
  {
    id: "client",
    type: "client",
    label: "Invoice To",
    x: 76,
    y: 184,
    width: 260,
    height: 92,
    visible: true,
  },
  {
    id: "invoice-meta",
    type: "invoice-meta",
    label: "Invoice Meta",
    x: 460,
    y: 184,
    width: 250,
    height: 92,
    visible: true,
  },
  {
    id: "project-summary",
    type: "project-summary",
    label: "Project Summary",
    x: 76,
    y: 306,
    width: 350,
    height: 54,
    visible: true,
  },
  {
    id: "line-items",
    type: "line-items",
    label: "Line Items",
    x: 70,
    y: 392,
    width: 654,
    height: 172,
    visible: true,
  },
  {
    id: "totals",
    type: "totals",
    label: "Totals",
    x: 420,
    y: 592,
    width: 304,
    height: 68,
    visible: true,
  },
  {
    id: "thank-you",
    type: "thank-you",
    label: "Thank You",
    x: 292,
    y: 704,
    width: 220,
    height: 50,
    visible: true,
  },
  {
    id: "payment-details",
    type: "payment-details",
    label: "Payment Details",
    x: 76,
    y: 820,
    width: 296,
    height: 206,
    visible: true,
  },
  {
    id: "notes",
    type: "notes",
    label: "Notes",
    x: 460,
    y: 820,
    width: 255,
    height: 112,
    visible: true,
  },
  {
    id: "qr-links",
    type: "qr-links",
    label: "QR Links",
    x: 566,
    y: 944,
    width: 118,
    height: 118,
    visible: true,
  },
];

const emptyProfile: InvoiceSettings = {
  name: "Default Invoice",
  is_default: true,
  payment_tags: [],
  direct_payment_links: [],
  banking_details: "",
  qr_links: [],
};

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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getDefaultBlocks = () => blockCatalog.map((block) => ({ ...block }));

const mergeSavedBlocks = (savedBlocks?: InvoiceTemplateBlock[]) => {
  if (!savedBlocks?.length) return getDefaultBlocks();

  return blockCatalog.map((block) => {
    const saved = savedBlocks.find((item) => item.id === block.id);
    return saved ? { ...block, ...saved } : { ...block };
  });
};

function BlockPreview({ block }: { block: InvoiceTemplateBlock }) {
  if (block.type === "invoice-title") {
    return (
      <div className="flex h-full flex-col items-end justify-center">
        <span className="font-mono text-[34px] font-bold leading-none tracking-[0.18em] text-[#3b3631]">
          INVOICE
        </span>
        <span className="mt-1 h-4 w-36 bg-[#f59a23]" />
      </div>
    );
  }

  if (block.type === "line-items") {
    return (
      <div className="h-full border border-[#241d18]/25 bg-white">
        <div className="grid grid-cols-[1fr_100px_120px] bg-[#083f63] px-4 py-3 font-mono text-[11px] font-bold uppercase text-white">
          <span>Description</span>
          <span>Hours</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="grid grid-cols-[1fr_100px_120px] px-4 py-5 text-sm text-[#241d18]">
          <span>Design and development</span>
          <span>20 hours</span>
          <span className="text-right">USD 140</span>
        </div>
        <div className="mx-4 h-1 bg-[#3f3b37]" />
      </div>
    );
  }

  if (block.type === "totals") {
    return (
      <div className="flex h-full items-center justify-between bg-[#f59a23] px-5 text-sm font-bold uppercase">
        <span>Total</span>
        <span>USD 140</span>
      </div>
    );
  }

  if (block.type === "qr-links") {
    return (
      <div className="grid h-full place-items-center border-8 border-[#3b3631] bg-white">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className={`size-3 ${
                index % 3 === 0 || index % 5 === 0
                  ? "bg-[#241d18]"
                  : "bg-[#241d18]/15"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "company") {
    return (
      <div className="flex h-full items-start gap-3">
        <div className="size-14 rounded-full border-4 border-[#d95c3f] bg-[#083f63]" />
        <div>
          <p className="text-lg font-bold">Lucid Wave Studios</p>
          <p className="text-xs leading-5 text-[#574d43]">
            hello@lucidwavestudios.com
            <br />
            Subic Bay, Philippines
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#241d18]">
        {block.label}
      </p>
      <div className="mt-3 space-y-2 text-xs text-[#574d43]">
        <div className="h-2 w-5/6 bg-[#241d18]/15" />
        <div className="h-2 w-2/3 bg-[#241d18]/15" />
        <div className="h-2 w-4/5 bg-[#241d18]/15" />
      </div>
    </div>
  );
}

export default function InvoiceTemplatePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<InvoiceSettings[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [blocks, setBlocks] = useState<InvoiceTemplateBlock[]>(getDefaultBlocks);
  const [activeBlockId, setActiveBlockId] = useState("company");
  const [dragging, setDragging] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const activeBlock = blocks.find((block) => block.id === activeBlockId);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listInvoiceProfiles();
        const defaultProfile =
          data.find((profile) => profile.is_default) || data[0] || emptyProfile;
        setProfiles(data);
        setSelectedProfileId(defaultProfile.id || "");
        setBlocks(mergeSavedBlocks(defaultProfile.template_layout?.blocks));
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load invoice profiles"));
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const selectProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) return;

    setSelectedProfileId(profileId);
    setBlocks(mergeSavedBlocks(profile.template_layout?.blocks));
    setActiveBlockId("company");
  };

  const updateBlock = (
    blockId: string,
    updater: (block: InvoiceTemplateBlock) => InvoiceTemplateBlock
  ) => {
    setBlocks((current) =>
      current.map((block) => (block.id === blockId ? updater(block) : block))
    );
  };

  const beginDrag = (
    event: PointerEvent<HTMLDivElement>,
    block: InvoiceTemplateBlock
  ) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;

    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveBlockId(block.id);
    setDragging({
      id: block.id,
      offsetX: pointerX - block.x,
      offsetY: pointerY - block.y,
    });
  };

  const moveBlock = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const pointerX = (event.clientX - rect.left) * scaleX;
    const pointerY = (event.clientY - rect.top) * scaleY;

    updateBlock(dragging.id, (block) => ({
      ...block,
      x: Math.round(
        clamp(pointerX - dragging.offsetX, 0, canvasWidth - block.width)
      ),
      y: Math.round(
        clamp(pointerY - dragging.offsetY, 0, canvasHeight - block.height)
      ),
    }));
  };

  const endDrag = () => setDragging(null);

  const toggleBlock = (blockId: string) => {
    updateBlock(blockId, (block) => ({ ...block, visible: !block.visible }));
  };

  const resetLayout = () => {
    setBlocks(getDefaultBlocks());
    setActiveBlockId("company");
  };

  const saveLayout = async () => {
    if (!selectedProfile) return;

    try {
      setSaving(true);
      setError(null);
      const nextProfile = await updateInvoiceSettings(
        {
          name: selectedProfile.name,
          is_default: selectedProfile.is_default,
          payment_tags: selectedProfile.payment_tags || [],
          direct_payment_links: selectedProfile.direct_payment_links || [],
          banking_details: selectedProfile.banking_details || "",
          qr_links: selectedProfile.qr_links || [],
          template_layout: { blocks },
        },
        selectedProfile.id
      );

      setProfiles((current) =>
        current.map((profile) =>
          profile.id === nextProfile.id ? nextProfile : profile
        )
      );
      toast.success("Invoice template saved.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save invoice template"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#241d18]">
      <div className="border-b border-[#241d18]/15 bg-[#fffaf1]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-2 flex w-fit items-center gap-2 border border-[#241d18]/15 bg-[#f4efe4] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <LayoutTemplate className="size-3.5" />
            Template Builder
          </div>
          <h1 className="font-serif text-5xl leading-[1.05]">
            Invoice Template
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f665d]">
            Arrange the reusable invoice sections for each profile. Drag blocks
            on the page, hide what you do not need, then save the layout.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 border border-[#b73823] bg-[#fff1e8] px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7d2418]" />
              <p className="text-sm text-[#7d2418]">{error}</p>
            </div>
          )}

          <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
            <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Profile
              </p>
              <h2 className="font-serif text-2xl">Template Source</h2>
            </div>
            <div className="space-y-4 p-5">
              <select
                value={selectedProfileId}
                onChange={(event) => selectProfile(event.target.value)}
                disabled={loading}
                className="h-11 w-full border border-[#241d18]/20 bg-white px-3 font-mono text-sm text-[#241d18] outline-none focus:border-[#8b4a36]"
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                    {profile.is_default ? " (default)" : ""}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={saveLayout}
                  disabled={loading || saving || !selectedProfile}
                  className="h-11 rounded-none bg-[#241d18] font-mono text-[11px] uppercase tracking-wide text-[#fffaf1] hover:bg-[#3a3029]"
                >
                  <Save className="mr-2 size-4" />
                  {saving ? "Saving" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetLayout}
                  disabled={loading || saving}
                  className="h-11 rounded-none border-[#241d18]/20 bg-white font-mono text-[11px] uppercase tracking-wide text-[#574d43] hover:bg-[#fffaf1]"
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
              </div>
            </div>
          </section>

          <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
            <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                Blocks
              </p>
              <h2 className="font-serif text-2xl">Invoice Sections</h2>
            </div>
            <div className="divide-y divide-[#241d18]/10">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                    activeBlockId === block.id
                      ? "bg-[#f4efe4] text-[#241d18]"
                      : "bg-[#fffaf1] text-[#574d43] hover:bg-[#f8f1e5]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveBlockId(block.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <Grip className="size-4 shrink-0 text-[#8b4a36]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {block.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-[#6f665d]">
                        {block.width} x {block.height}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBlock(block.id)}
                    className="grid size-9 shrink-0 place-items-center border border-[#241d18]/15 bg-white text-[#574d43]"
                    aria-label={`${block.visible ? "Hide" : "Show"} ${
                      block.label
                    }`}
                  >
                    {block.visible ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {activeBlock && (
            <section className="border border-[#241d18]/15 bg-[#fffaf1] shadow-[8px_8px_0_#241d18]">
              <div className="border-b border-[#241d18]/15 bg-[#f4efe4] px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                  Selected
                </p>
                <h2 className="font-serif text-2xl">{activeBlock.label}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
                <div className="border border-[#241d18]/10 bg-[#f4efe4] p-3">
                  <span className="block">X</span>
                  <strong className="text-lg text-[#241d18]">
                    {activeBlock.x}
                  </strong>
                </div>
                <div className="border border-[#241d18]/10 bg-[#f4efe4] p-3">
                  <span className="block">Y</span>
                  <strong className="text-lg text-[#241d18]">
                    {activeBlock.y}
                  </strong>
                </div>
                <div className="border border-[#241d18]/10 bg-[#f4efe4] p-3">
                  <span className="block">Width</span>
                  <strong className="text-lg text-[#241d18]">
                    {activeBlock.width}
                  </strong>
                </div>
                <div className="border border-[#241d18]/10 bg-[#f4efe4] p-3">
                  <span className="block">Height</span>
                  <strong className="text-lg text-[#241d18]">
                    {activeBlock.height}
                  </strong>
                </div>
              </div>
            </section>
          )}
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-[#6f665d]">
            <Move className="size-4 text-[#8b4a36]" />
            Drag sections on the page
          </div>

          {loading ? (
            <div className="grid min-h-[520px] place-items-center border border-[#241d18]/15 bg-[#fffaf1]">
              <div className="text-center">
                <div className="mx-auto mb-4 size-8 animate-spin border-2 border-[#241d18]/15 border-t-[#8b4a36]" />
                <p className="font-mono text-xs uppercase text-[#6f665d]">
                  Loading template
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto border border-[#241d18]/15 bg-[#ded5c7] p-5 shadow-[8px_8px_0_#241d18]">
              <div
                ref={canvasRef}
                className="relative mx-auto aspect-[794/1123] w-full max-w-[794px] overflow-hidden bg-[#fffaf1] shadow-[0_0_0_1px_rgba(36,29,24,0.18)]"
                onPointerMove={moveBlock}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    onPointerDown={(event) => beginDrag(event, block)}
                    className={`absolute cursor-move select-none border bg-white/70 p-2 transition-shadow ${
                      activeBlockId === block.id
                        ? "border-[#d95c3f] shadow-[0_0_0_2px_rgba(217,92,63,0.22)]"
                        : "border-[#241d18]/10 hover:border-[#8b4a36]/60"
                    } ${block.visible ? "" : "opacity-35"}`}
                    style={{
                      left: `${(block.x / canvasWidth) * 100}%`,
                      top: `${(block.y / canvasHeight) * 100}%`,
                      width: `${(block.width / canvasWidth) * 100}%`,
                      height: `${(block.height / canvasHeight) * 100}%`,
                      touchAction: "none",
                    }}
                  >
                    <div className="absolute -top-6 left-0 flex items-center gap-1 bg-[#241d18] px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-[#fffaf1]">
                      <Grip className="size-3" />
                      {block.label}
                    </div>
                    <BlockPreview block={block} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
