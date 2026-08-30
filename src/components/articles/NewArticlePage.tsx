"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, Send, ChevronDown, Upload, X, Globe, Lock,
  Users, Calendar, Tag, Lightbulb, ExternalLink, AlertCircle,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Quote, Link2, Image as ImageIcon, Table2, MoreHorizontal,
  Type, CheckCircle,
} from "lucide-react";
import { getToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Visibility = "public" | "membres" | "prive";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Éducation", "Environnement", "Société", "Innovation",
  "Engagement", "Jeunesse", "Santé",
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "public",   label: "Public",   icon: Globe,  desc: "Visible par tous les membres et visiteurs." },
  { value: "membres",  label: "Membres",  icon: Users,  desc: "Visible uniquement par les membres connectés." },
  { value: "prive",    label: "Privé",    icon: Lock,   desc: "Brouillon privé, visible par vous seul." },
];

const TIPS = [
  "Rédigez un titre clair et accrocheur",
  "Structurez votre contenu avec des sous-titres",
  "Illustrez avec des images pertinentes",
  "Relisez avant de publier",
];

// ─── API helper ───────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts?: RequestInit) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      ...(opts?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (!res.ok) { const e = await res.json().catch(() => ({ error: "Erreur réseau" })); throw new Error(e.error ?? "Erreur"); }
  return res.json();
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function TBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
    >
      {children}
    </button>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichEditor({
  onChange, placeholder,
}: {
  onChange: (html: string, wordCount: number) => void;
  placeholder: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [formatBlock, setFormatBlock] = useState("Paragraphe");
  const [isEmpty, setIsEmpty] = useState(true);

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus();
    // execCommand is deprecated but still works everywhere; no viable lightweight replacement
    (document as unknown as Record<string, (...a: unknown[]) => void>).execCommand(cmd, false, value);
  }

  function handleFormatBlock(tag: string, label: string) {
    exec("formatBlock", tag);
    setFormatBlock(label);
  }

  function handleLink() {
    const url = window.prompt("Entrez l'URL du lien :");
    if (url) exec("createLink", url);
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const wc   = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const empty = !text.trim() && !el.querySelector("img, table");
    setWordCount(wc);
    setIsEmpty(empty);
    onChange(el.innerHTML, wc);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    exec("insertText", text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      exec("insertText", "    ");
    }
  }

  const FORMAT_OPTIONS = [
    { tag: "p",  label: "Paragraphe" },
    { tag: "h1", label: "Titre 1"    },
    { tag: "h2", label: "Titre 2"    },
    { tag: "h3", label: "Titre 3"    },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">
        {/* Format selector */}
        <div className="relative group mr-1">
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            <Type size={13} />
            <span className="text-xs font-medium min-w-[70px] text-left">{formatBlock}</span>
            <ChevronDown size={11} />
          </button>
          <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 hidden group-hover:block min-w-[130px]">
            {FORMAT_OPTIONS.map(f => (
              <button key={f.tag} type="button"
                onMouseDown={e => { e.preventDefault(); handleFormatBlock(f.tag, f.label); }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <TBtn onClick={() => exec("bold")}          title="Gras (Ctrl+B)"><Bold          size={14} /></TBtn>
        <TBtn onClick={() => exec("italic")}        title="Italique (Ctrl+I)"><Italic      size={14} /></TBtn>
        <TBtn onClick={() => exec("underline")}     title="Souligné (Ctrl+U)"><UnderlineIcon size={14} /></TBtn>
        <TBtn onClick={() => exec("strikeThrough")} title="Barré"><Strikethrough          size={14} /></TBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <TBtn onClick={() => exec("insertUnorderedList")} title="Liste à puces"><List          size={14} /></TBtn>
        <TBtn onClick={() => exec("insertOrderedList")}   title="Liste numérotée"><ListOrdered  size={14} /></TBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <TBtn onClick={() => exec("justifyLeft")}   title="Aligner à gauche"><AlignLeft   size={14} /></TBtn>
        <TBtn onClick={() => exec("justifyCenter")} title="Centrer"><AlignCenter            size={14} /></TBtn>
        <TBtn onClick={() => exec("justifyRight")}  title="Aligner à droite"><AlignRight  size={14} /></TBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <TBtn onClick={() => exec("formatBlock", "blockquote")} title="Citation"><Quote   size={14} /></TBtn>
        <TBtn onClick={handleLink}                               title="Insérer un lien"><Link2 size={14} /></TBtn>
        <TBtn onClick={() => exec("insertImage", window.prompt("URL de l'image :") ?? "")} title="Insérer une image"><ImageIcon size={14} /></TBtn>
        <TBtn onClick={() => exec("insertHTML", "<table border='1' style='border-collapse:collapse;width:100%'><tr><td>Colonne 1</td><td>Colonne 2</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>")} title="Insérer un tableau"><Table2 size={14} /></TBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <TBtn onClick={() => {}} title="Plus d'options"><MoreHorizontal size={14} /></TBtn>
      </div>

      {/* Editable area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="min-h-[280px] px-4 py-3 text-sm text-gray-800 outline-none leading-relaxed
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-1.5
            [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-2
            [&_a]:text-primary [&_a]:underline
            [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2"
        />
        {isEmpty && (
          <p className="absolute top-3 left-4 text-sm text-gray-400 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>

      {/* Word count */}
      <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50/50 text-right">
        <span className="text-xs text-gray-400">{wordCount} mot{wordCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

// ─── Cover Image Zone ─────────────────────────────────────────────────────────
function CoverImageZone({
  file, preview, onSelect, onRemove,
}: {
  file: File | null;
  preview: string | null;
  onSelect: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onSelect(f);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-800">Image à la une</h3>
      <p className="text-xs text-gray-500">Cette image représentera votre article dans les vignettes et les partages.</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
          <button
            type="button" onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <X size={14} className="text-gray-600" />
          </button>
          {file && <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">{file.name}</p>}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            drag ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
          }`}
        >
          <Upload size={28} className={drag ? "text-primary" : "text-gray-300"} />
          <p className="text-sm text-gray-500 mt-2">Glissez-déposez une image ici</p>
          <p className="text-xs text-gray-400 mt-0.5">
            ou <span className="text-primary font-medium">cliquez pour sélectionner</span>
          </p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
      <p className="text-xs text-gray-400">Format recommandé : 1200 x 630 px (JPG, PNG)</p>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({
  open, onClose, title, summary, content, category,
}: {
  open: boolean; onClose: () => void;
  title: string; summary: string; content: string; category: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">Aperçu de l&apos;article</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {category && (
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
              {category}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{title || "Sans titre"}</h1>
          {summary && <p className="text-gray-500 text-base mb-6 leading-relaxed border-l-4 border-primary/20 pl-4 italic">{summary}</p>}
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
              [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-3
              [&_a]:text-primary [&_a]:underline
              [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2"
            dangerouslySetInnerHTML={{ __html: content || "<p><em>Aucun contenu rédigé pour l'instant.</em></p>" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewArticlePage({ categories: initialCategories }: { categories: string[] }) {
  const router = useRouter();

  // Form state
  const [title,      setTitle]      = useState("");
  const [summary,    setSummary]    = useState("");
  const [content,    setContent]    = useState("");
  const [category,   setCategory]   = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [tags,       setTags]       = useState<string[]>([]);
  const [tagInput,   setTagInput]   = useState("");
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePrev,  setImagePrev]  = useState<string | null>(null);

  // UI state
  const [loading,  setLoading]  = useState<"draft" | "publish" | null>(null);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [preview,  setPreview]  = useState(false);

  const allCategories = [...new Set([...CATEGORIES, ...initialCategories])];

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput("");
  }

  function removeTag(t: string) { setTags(prev => prev.filter(x => x !== t)); }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  }

  function handleImageSelect(f: File) {
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = ev => setImagePrev(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function removeImage() { setImageFile(null); setImagePrev(null); }

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  async function handleSave(publish: boolean) {
    if (!title.trim()) { setError("Le titre est requis."); return; }
    setError(""); setLoading(publish ? "publish" : "draft");

    try {
      // 1. Create / save article
      const article = await apiFetch("/articles", {
        method: "POST",
        body: JSON.stringify({ title, summary, content, category: category || null, tags, visibility, published: publish }),
      });

      // 2. Upload cover image if selected
      if (imageFile && article.id) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await apiFetch(`/articles/${article.id}/image`, { method: "POST", body: fd }).catch(() => null);
      }

      setSuccess(publish ? "Article publié avec succès !" : "Brouillon enregistré.");
      setTimeout(() => router.push("/dashboard/articles"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setLoading(null);
    }
  }

  const visibilityConfig = VISIBILITY_OPTIONS.find(v => v.value === visibility) ?? VISIBILITY_OPTIONS[0];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rédaction d&apos;un nouvel article</h1>
          <p className="text-sm text-gray-500 mt-1">Partagez vos connaissances et inspirez notre communauté.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={!!loading}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {loading === "draft"
              ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <Save size={14} />
            }
            Enregistrer le brouillon
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye size={14} /> Aperçu
          </button>
          <div className="flex items-center rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={!!loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading === "publish"
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={14} />
              }
              Publier l&apos;article
            </button>
            <button type="button"
              className="px-2.5 py-2.5 bg-primary/90 text-white hover:bg-primary border-l border-white/20 transition-colors">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        {/* ── Left: Form ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Titre de l&apos;article <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 120))}
              placeholder="Saisissez un titre accrocheur pour votre article..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-right text-xs text-gray-400">{title.length} / 120</p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1.5">
            <label className="text-sm font-semibold text-gray-800">Résumé / Extrait</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Rédigez un court résumé de votre article. Il sera utilisé dans les aperçus et les partages."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <p className="text-right text-xs text-gray-400">{summary.length} / 200</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1.5">
            <label className="text-sm font-semibold text-gray-800">
              Contenu de l&apos;article <span className="text-red-500">*</span>
            </label>
            <RichEditor
              onChange={handleContentChange}
              placeholder="Commencez à rédiger votre article ici..."
            />
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <CoverImageZone
              file={imageFile}
              preview={imagePrev}
              onSelect={handleImageSelect}
              onRemove={removeImage}
            />
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <aside className="w-72 flex-shrink-0 space-y-4">
          {/* Publication */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Publication</h3>

            {/* Statut */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Statut <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none border border-gray-200 rounded-xl pl-8 pr-8 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  defaultValue="brouillon"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400" />
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Visibilité */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Visibilité <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as Visibility)}
                  className="w-full appearance-none border border-gray-200 rounded-xl pl-8 pr-8 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {VISIBILITY_OPTIONS.map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
                <visibilityConfig.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">{visibilityConfig.desc}</p>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date de publication</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">Publier maintenant</span>
              </div>
              <p className="text-[11px] text-gray-400">Laissez vide pour publier immédiatement.</p>
            </div>
          </div>

          {/* Catégorie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
            <label className="text-sm font-bold text-gray-800">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Sélectionner une catégorie</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-400">Choisissez la catégorie principale de votre article.</p>
          </div>

          {/* Mots-clés */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Tag size={14} /> Mots-clés
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Ajouter un mot-clé..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button" onClick={addTag}
                className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors whitespace-nowrap"
              >
                Ajouter
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Séparez les mots-clés par Entrée</p>
            {tags.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Aucun mot-clé ajouté</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-primary/60">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Astuces */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={15} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">Astuces</h3>
            </div>
            <ul className="space-y-1.5">
              {TIPS.map(tip => (
                <li key={tip} className="flex items-start gap-1.5 text-xs text-amber-700">
                  <span className="text-amber-400 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
            <button type="button"
              className="flex items-center gap-1 text-xs text-amber-700 font-semibold hover:text-amber-900 transition-colors">
              Voir le guide de rédaction <ExternalLink size={11} />
            </button>
          </div>
        </aside>
      </div>

      {/* Preview modal */}
      <PreviewModal
        open={preview}
        onClose={() => setPreview(false)}
        title={title}
        summary={summary}
        content={content}
        category={category}
      />
    </div>
  );
}
