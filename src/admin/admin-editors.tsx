"use client";
import { Dropdown } from "./ui/dropdown";
import { useState } from "react";
import type {
  Product,
  Collection,
  Coupon,
  Settings,
  Order,
  Photo,
} from "./types";
import { api, money } from "./api";
export type Save = (value: unknown, id?: string) => Promise<void>;
export function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        placeholder={
          type === "number"
            ? "0"
            : (
                {
                  "Product name": "e.g. Embroidered khadi jacket",
                  "URL slug (lowercase-with-hyphens)":
                    "e.g. embroidered-khadi-jacket",
                  SKU: "e.g. RV-JACKET-M",
                  Size: "e.g. M or Custom",
                  Category: "e.g. Jacket",
                  Fabric: "e.g. Handwoven khadi",
                  Craft: "e.g. Hand embroidery",
                  "Coupon code": "e.g. WELCOME10",
                  "Collection ID (permanent slug)": "e.g. flora",
                  "Menu path": "e.g. /products",
                  "Menu label": "e.g. Shop the collection",
                } as Record<string, string>
              )[label] ||
              (label.toLowerCase().includes("url")
                ? "https://…"
                : `Enter ${label.toLowerCase()}`)
        }
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step={type === "number" ? "0.01" : undefined}
      />
    </label>
  );
}
export function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <textarea
        placeholder={`Add ${label.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </label>
  );
}
export function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
export function Upload({
  token,
  onUpload,
}: {
  token: string;
  onUpload: (photo: Photo) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function send(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("image", file);
      const result = await api<Photo>("/admin/upload", {
        method: "POST",
        body,
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpload(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="upload-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (!busy) void send(e.dataTransfer.files[0]);
      }}
    >
      <label>
        Upload an image or drop it here
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => void send(e.target.files?.[0])}
        />
      </label>
      <p className="muted">
        JPEG, PNG or WebP · up to 8 MB · requires configured Cloudinary
      </p>
      {busy && <p role="status">Uploading…</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
const blankProduct: Product = {
  _id: "",
  title: "",
  slug: "",
  collectionId: "",
  category: "",
  price: 0,
  description: "",
  heritageCraftStory: "",
  washCare: "Dry clean only",
  fabric: "Khadi",
  craft: "",
  sizeGuide: "",
  images: [],
  variants: [{ size: "M", sku: "", stock: 0, priceDelta: 0 }],
  totalStock: 0,
  isPublished: false,
  isFeatured: false,
  madeToOrder: false,
  leadTimeDays: 7,
};
export function ProductEditor({
  initial,
  collections,
  save,
  token,
  busy,
}: {
  initial?: Product;
  collections: Collection[];
  save: Save;
  token: string;
  busy: boolean;
}) {
  const [p, setP] = useState<Product>(initial || blankProduct);
  const update = <K extends keyof Product>(k: K, v: Product[K]) =>
    setP((p) => ({ ...p, [k]: v }));
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        void save(p, p._id);
      }}
    >
      <h2>{initial ? "Edit piece" : "Add a piece"}</h2>
      <div className="form-grid">
        <Field
          label="Product name"
          value={p.title}
          required
          onChange={(v) => update("title", v)}
        />
        <Field
          label="URL slug (lowercase-with-hyphens)"
          value={p.slug}
          required
          onChange={(v) => update("slug", v)}
        />
        <label>
          Collection
          <Dropdown
            label="Collection"
            required
            value={p.collectionId}
            onValueChange={(value) => update("collectionId", value)}
            options={[
              { value: "", label: "Choose a collection" },
              ...collections.map((c) => ({
                value: c.collectionId,
                label: c.name,
              })),
            ]}
          />
        </label>
        <Field
          label="Category"
          value={p.category}
          required
          onChange={(v) => update("category", v)}
        />
        <Field
          label="Price (INR)"
          type="number"
          value={p.price}
          required
          onChange={(v) => update("price", Number(v))}
        />
        <Field
          label="Compare-at price (optional)"
          type="number"
          value={p.compareAtPrice ?? ""}
          onChange={(v) =>
            update("compareAtPrice", v === "" ? null : Number(v))
          }
        />
        <Field
          label="Fabric"
          value={p.fabric}
          onChange={(v) => update("fabric", v)}
        />
        <Field
          label="Craft"
          value={p.craft}
          onChange={(v) => update("craft", v)}
        />
        <Field
          label="Making time in days"
          type="number"
          value={p.leadTimeDays}
          onChange={(v) => update("leadTimeDays", Number(v))}
        />
      </div>
      <Textarea
        label="Description"
        value={p.description}
        onChange={(v) => update("description", v)}
      />
      <Textarea
        label="Craft & heritage story"
        value={p.heritageCraftStory}
        onChange={(v) => update("heritageCraftStory", v)}
      />
      <Textarea
        label="Fabric care"
        value={p.washCare}
        onChange={(v) => update("washCare", v)}
      />
      <Textarea
        label="Size guide"
        value={p.sizeGuide}
        onChange={(v) => update("sizeGuide", v)}
      />
      <fieldset>
        <legend>Size variants & inventory</legend>
        {p.variants.map((v, i) => (
          <div className="variant-row" key={i}>
            {(["size", "sku", "stock", "priceDelta"] as const).map((k) => (
              <Field
                key={k}
                label={
                  {
                    size: "Size",
                    sku: "SKU",
                    stock: "Stock",
                    priceDelta: "Price adjustment (INR)",
                  }[k]
                }
                value={v[k]}
                type={k === "stock" || k === "priceDelta" ? "number" : "text"}
                required
                onChange={(value) =>
                  update(
                    "variants",
                    p.variants.map((row, n) =>
                      n === i
                        ? {
                            ...row,
                            [k]:
                              k === "stock" || k === "priceDelta"
                                ? Number(value)
                                : value,
                          }
                        : row,
                    ),
                  )
                }
              />
            ))}
            <button
              type="button"
              className="text-link"
              disabled={p.variants.length === 1}
              onClick={() =>
                update(
                  "variants",
                  p.variants.filter((_, n) => n !== i),
                )
              }
            >
              Remove size
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            update("variants", [
              ...p.variants,
              { size: "", sku: "", stock: 0, priceDelta: 0 },
            ])
          }
        >
          Add size
        </button>
      </fieldset>
      <fieldset>
        <legend>Product photos</legend>
        <Upload
          token={token}
          onUpload={(photo) =>
            setP((p) => ({ ...p, images: [...p.images, photo] }))
          }
        />
        {p.images.map((photo, i) => (
          <div className="photo-row" key={i}>
            {photo.url && <img src={photo.url} alt={photo.alt} />}
            <Field
              label={`Image ${i + 1} URL`}
              value={photo.url}
              onChange={(url) =>
                update(
                  "images",
                  p.images.map((row, n) => (n === i ? { ...row, url } : row)),
                )
              }
            />
            <Field
              label="Image description"
              value={photo.alt}
              onChange={(alt) =>
                update(
                  "images",
                  p.images.map((row, n) => (n === i ? { ...row, alt } : row)),
                )
              }
            />
            <button
              type="button"
              onClick={() => {
                const images = [...p.images];
                if (i) {
                  [images[i - 1], images[i]] = [images[i], images[i - 1]];
                  update("images", images);
                }
              }}
              disabled={i === 0}
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() =>
                update(
                  "images",
                  p.images.filter((_, n) => n !== i),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-link"
          onClick={() =>
            update("images", [...p.images, { url: "", alt: p.title }])
          }
        >
          Add image by URL
        </button>
      </fieldset>
      <div className="form-grid">
        <Field
          label="SEO title"
          value={p.seoTitle || ""}
          onChange={(v) => update("seoTitle", v)}
        />
        <Field
          label="SEO description"
          value={p.seoDescription || ""}
          onChange={(v) => update("seoDescription", v)}
        />
      </div>
      <Check
        label="Made to order (does not use ready-stock inventory)"
        value={p.madeToOrder}
        onChange={(v) => update("madeToOrder", v)}
      />
      <Check
        label="Pause orders (preserve stock counts)"
        value={p.salesPaused === true}
        onChange={(v) => update("salesPaused", v)}
      />
      <Check
        label="Feature on homepage"
        value={p.isFeatured}
        onChange={(v) => update("isFeatured", v)}
      />
      <Check
        label="Published — visible and orderable"
        value={p.isPublished}
        onChange={(v) => update("isPublished", v)}
      />
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
export function CollectionEditor({
  initial,
  save,
  token,
  busy,
}: {
  initial?: Collection;
  save: Save;
  token: string;
  busy: boolean;
}) {
  const [c, setC] = useState<Collection>(
    initial || {
      _id: "",
      collectionId: "",
      name: "",
      mood: "",
      coverImage: "",
      displayOrder: 0,
      isActive: true,
    },
  );
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        void save(c, c._id);
      }}
    >
      <h2>{initial ? "Edit collection" : "Add collection"}</h2>
      <Field
        label="Collection ID (permanent slug)"
        value={c.collectionId}
        required
        onChange={(v) => setC({ ...c, collectionId: v })}
      />
      <Field
        label="Name"
        value={c.name}
        required
        onChange={(v) => setC({ ...c, name: v })}
      />
      <Field
        label="Description"
        value={c.mood}
        required
        onChange={(v) => setC({ ...c, mood: v })}
      />
      <Field
        label="Cover image URL"
        value={c.coverImage}
        onChange={(v) => setC({ ...c, coverImage: v })}
      />
      <Upload
        token={token}
        onUpload={(p) => setC((c) => ({ ...c, coverImage: p.url }))}
      />
      <Field
        label="Display order"
        type="number"
        value={c.displayOrder}
        onChange={(v) => setC({ ...c, displayOrder: Number(v) })}
      />
      <Check
        label="Visible in collections"
        value={c.isActive}
        onChange={(v) => setC({ ...c, isActive: v })}
      />
      <button className="button" disabled={busy}>
        Save collection
      </button>
    </form>
  );
}
export function CouponEditor({
  initial,
  save,
  busy,
}: {
  initial?: Coupon;
  save: Save;
  busy: boolean;
}) {
  const [c, setC] = useState<Coupon>(
    initial || {
      _id: "",
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minCartValue: 0,
      maxDiscountCap: null,
      usageLimit: null,
      timesUsed: 0,
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true,
    },
  );
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        void save(c, c._id);
      }}
    >
      <h2>{initial ? "Edit coupon" : "Add coupon"}</h2>
      <Field
        label="Coupon code"
        required
        value={c.code}
        onChange={(v) => setC({ ...c, code: v.toUpperCase() })}
      />
      <label>
        Discount type
        <Dropdown
          label="Discount type"
          value={c.discountType}
          onValueChange={(value) => setC({ ...c, discountType: value })}
          options={[
            { value: "percentage", label: "Percentage" },
            { value: "fixed", label: "Fixed INR amount" },
          ]}
        />
      </label>
      {(
        [
          "discountValue",
          "minCartValue",
          "maxDiscountCap",
          "usageLimit",
        ] as const
      ).map((k) => (
        <Field
          key={k}
          label={
            {
              discountValue: "Discount value",
              minCartValue: "Minimum cart value (INR)",
              maxDiscountCap: "Maximum discount (optional INR)",
              usageLimit: "Usage limit (optional)",
            }[k]
          }
          type="number"
          value={c[k] ?? ""}
          onChange={(v) =>
            setC({
              ...c,
              [k]:
                v === "" && ["maxDiscountCap", "usageLimit"].includes(k)
                  ? null
                  : Number(v),
            })
          }
        />
      ))}
      <Field
        label="Expiry date (end of day UTC)"
        type="date"
        value={c.expiryDate.slice(0, 10)}
        onChange={(v) => setC({ ...c, expiryDate: `${v}T23:59:59.999Z` })}
      />
      <p>Used {c.timesUsed} times</p>
      <Check
        label="Active"
        value={c.isActive}
        onChange={(v) => setC({ ...c, isActive: v })}
      />
      <button className="button" disabled={busy}>
        Save coupon
      </button>
    </form>
  );
}
export function OrderEditor({
  initial: o,
  save,
  busy,
}: {
  initial: Order;
  save: Save;
  busy: boolean;
}) {
  const [status, setStatus] = useState(o.fulfillment.status),
    [courier, setCourier] = useState(o.fulfillment.courierPartner),
    [tracking, setTracking] = useState(o.fulfillment.trackingNumber),
    [notes, setNotes] = useState(o.adminNotes || "");
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        void save(
          {
            status,
            courierPartner: courier,
            trackingNumber: tracking,
            adminNotes: notes,
          },
          o._id,
        );
      }}
    >
      <h2>{o.orderNumber}</h2>
      <p>
        {o.customer?.name} · {o.customer?.email} · {o.customer?.phone}
      </p>
      {o.customer?.shippingAddress && (
        <p>
          {Object.values(o.customer.shippingAddress).filter(Boolean).join(", ")}
        </p>
      )}
      <p>
        Payment {o.payment.status} · {money(o.financials.totalAmount)}
      </p>
      {o.items.map((i, n) => (
        <p key={n}>
          {i.productTitle} · {i.variantSize} × {i.quantity}
        </p>
      ))}
      <label>
        Fulfillment status
        <Dropdown
          label="Fulfillment status"
          value={status}
          onValueChange={setStatus}
          options={[
            "received",
            "in_stitching",
            "dispatched",
            "delivered",
            "cancelled",
          ].map((value) => ({ value, label: value.replaceAll("_", " ") }))}
        />
      </label>
      <p className="muted">
        Cancellation releases reserved stock. Completed or cancelled orders
        cannot be reopened.
      </p>
      <Field label="Courier partner" value={courier} onChange={setCourier} />
      <Field label="Tracking number" value={tracking} onChange={setTracking} />
      <Textarea label="Internal notes" value={notes} onChange={setNotes} />
      <button className="button" disabled={busy}>
        Save fulfillment
      </button>
    </form>
  );
}
export function SettingsEditor({
  initial,
  save,
  token,
  busy,
}: {
  initial: Settings;
  save: Save;
  token: string;
  busy: boolean;
}) {
  const [s, setS] = useState(initial);
  const [prefixes, setPrefixes] = useState(
    initial.serviceablePrefixes.join(", "),
  );
  const [imageTarget, setImageTarget] = useState<
    "logo" | "favicon" | "heroImage"
  >("logo");
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        void save({
          ...s,
          serviceablePrefixes: prefixes
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        });
      }}
    >
      <h2>Store identity & content</h2>
      <div className="form-grid">
        {(
          [
            "name",
            "description",
            "logo",
            "favicon",
            "announcement",
            "heroTitle",
            "heroText",
            "heroImage",
            "heroVideo",
            "contactEmail",
            "phone",
            "address",
            "instagram",
          ] as const
        ).map((k) => (
          <Field
            key={k}
            label={
              {
                name: "Store name",
                description: "Store description",
                logo: "Logo URL",
                favicon: "Favicon URL",
                announcement: "Announcement",
                heroTitle: "Homepage heading",
                heroText: "Homepage introduction",
                heroImage: "Campaign image URL",
                heroVideo: "Hero video URL",
                contactEmail: "Contact email",
                phone: "Phone",
                address: "Studio address",
                instagram: "Instagram URL",
              }[k]
            }
            value={s[k]}
            onChange={(v) => setS({ ...s, [k]: v })}
          />
        ))}
      </div>
      <label>
        Use uploaded image for
        <Dropdown
          label="Use uploaded image for"
          value={imageTarget}
          onValueChange={(value) => setImageTarget(value as typeof imageTarget)}
          options={[
            { value: "logo", label: "Store logo" },
            { value: "favicon", label: "Favicon" },
            { value: "heroImage", label: "Homepage campaign" },
          ]}
        />
      </label>
      <Upload
        token={token}
        onUpload={(p) => setS((s) => ({ ...s, [imageTarget]: p.url }))}
      />
      <h2>Shipping & inventory rules</h2>
      <div className="form-grid">
        {(
          [
            "shippingFee",
            "freeShippingThreshold",
            "deliveryDays",
            "lowStockThreshold",
          ] as const
        ).map((k) => (
          <Field
            key={k}
            label={
              {
                shippingFee: "Shipping fee (INR)",
                freeShippingThreshold: "Free-shipping threshold (INR)",
                deliveryDays: "Delivery days after making",
                lowStockThreshold: "Low-stock warning threshold",
              }[k]
            }
            type="number"
            value={s[k]}
            onChange={(v) => setS({ ...s, [k]: Number(v) })}
          />
        ))}
      </div>
      <Field
        label="Serviceable PIN prefixes, comma-separated (empty disables ordering)"
        value={prefixes}
        onChange={setPrefixes}
      />
      <h2>Navigation links</h2>
      {s.navigation.map((link, i) => (
        <fieldset key={i}>
          <legend>Menu item {i + 1}</legend>
          <Field
            label="Menu label"
            value={link.label}
            onChange={(v) =>
              setS({
                ...s,
                navigation: s.navigation.map((row, n) =>
                  n === i ? { ...row, label: v } : row,
                ),
              })
            }
          />
          <Field
            label="Menu path"
            value={link.href}
            onChange={(v) =>
              setS({
                ...s,
                navigation: s.navigation.map((row, n) =>
                  n === i ? { ...row, href: v } : row,
                ),
              })
            }
          />
          <button
            type="button"
            className="text-link"
            onClick={() =>
              setS({ ...s, navigation: s.navigation.filter((_, n) => n !== i) })
            }
          >
            Remove menu item
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        disabled={s.navigation.length >= 8}
        onClick={() =>
          setS({
            ...s,
            navigation: [...s.navigation, { label: "", href: "/products" }],
          })
        }
      >
        Add menu item
      </button>
      <h2>Homepage sections</h2>
      <p>Sections appear in this order below the selected products.</p>
      {s.sections.map((section, i) => (
        <fieldset key={i}>
          <legend>Section {i + 1}</legend>
          {(["title", "body", "image", "href"] as const).map((k) => (
            <Field
              key={k}
              label={k}
              value={section[k]}
              onChange={(v) =>
                setS({
                  ...s,
                  sections: s.sections.map((r, n) =>
                    n === i ? { ...r, [k]: v } : r,
                  ),
                })
              }
            />
          ))}
          <Check
            label="Visible"
            value={section.enabled}
            onChange={(v) =>
              setS({
                ...s,
                sections: s.sections.map((r, n) =>
                  n === i ? { ...r, enabled: v } : r,
                ),
              })
            }
          />
          <div className="inline">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => {
                const sections = [...s.sections];
                [sections[i - 1], sections[i]] = [sections[i], sections[i - 1]];
                setS({ ...s, sections });
              }}
            >
              Move up
            </button>
            <button
              type="button"
              onClick={() =>
                setS({ ...s, sections: s.sections.filter((_, n) => n !== i) })
              }
            >
              Remove section
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        onClick={() =>
          setS({
            ...s,
            sections: [
              ...s.sections,
              {
                title: "",
                body: "",
                image: "",
                href: "/products",
                enabled: true,
              },
            ],
          })
        }
      >
        Add homepage section
      </button>
      <h2>Pages & policies</h2>
      <p>Text supports paragraphs. HTML is displayed as plain text.</p>
      {s.pages.map((page, i) => (
        <fieldset key={i}>
          <legend>{page.title || "New page"}</legend>
          <Field
            label="Page URL slug"
            value={page.slug}
            onChange={(v) =>
              setS({
                ...s,
                pages: s.pages.map((r, n) => (n === i ? { ...r, slug: v } : r)),
              })
            }
          />
          <Field
            label="Page title"
            value={page.title}
            onChange={(v) =>
              setS({
                ...s,
                pages: s.pages.map((r, n) =>
                  n === i ? { ...r, title: v } : r,
                ),
              })
            }
          />
          <Textarea
            label="Page text"
            value={page.body}
            onChange={(v) =>
              setS({
                ...s,
                pages: s.pages.map((r, n) => (n === i ? { ...r, body: v } : r)),
              })
            }
          />
          <Check
            label="Published"
            value={page.published}
            onChange={(v) =>
              setS({
                ...s,
                pages: s.pages.map((r, n) =>
                  n === i ? { ...r, published: v } : r,
                ),
              })
            }
          />
          <button
            type="button"
            className="text-link"
            onClick={() =>
              setS({ ...s, pages: s.pages.filter((_, n) => n !== i) })
            }
          >
            Remove page
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        onClick={() =>
          setS({
            ...s,
            pages: [
              ...s.pages,
              { slug: "", title: "", body: "", published: false },
            ],
          })
        }
      >
        Add content page
      </button>
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : "Save store settings"}
      </button>
      <p className="muted">
        Changes appear on the storefront after its next page load.
      </p>
    </form>
  );
}
