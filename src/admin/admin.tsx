"use client";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { api, json, money } from "./api";
import type { Product, Collection, Coupon, Settings, Order } from "./types";
import {
  ProductEditor,
  CollectionEditor,
  CouponEditor,
  OrderEditor,
  SettingsEditor,
} from "./admin-editors";
type Tab =
  | "dashboard"
  | "products"
  | "collections"
  | "coupons"
  | "orders"
  | "settings"
  | "enquiries"
  | "subscribers";
type Message = {
  _id: string;
  name?: string;
  email: string;
  message?: string;
  topic?: string;
  createdAt: string;
};
type Row = Product | Collection | Coupon | Order | Message;
type Dashboard = {
  products: number;
  orders: number;
  enquiries: number;
  lowStock: Product[];
  recentOrders: Order[];
};
export function Admin() {
  const [token, setToken] = useState(""),
    [checking, setChecking] = useState(true),
    [tab, setTab] = useState<Tab>("dashboard"),
    [rows, setRows] = useState<Row[]>([]),
    [collections, setCollections] = useState<Collection[]>([]),
    [dashboard, setDashboard] = useState<Dashboard | null>(null),
    [settings, setSettings] = useState<Settings | null>(null),
    [editing, setEditing] = useState<Row | null | undefined>(undefined),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [search, setSearch] = useState("");
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = sessionStorage.getItem("rv-admin-token");
    if (t)
      api("/admin/me", { headers: { Authorization: `Bearer ${t}` } })
        .then(() => setToken(t))
        .catch(() => sessionStorage.removeItem("rv-admin-token"))
        .finally(() => setChecking(false));
    else setChecking(false);
  }, []);
  async function load(t = token, kind = tab) {
    if (!t) return;
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${t}` };
      if (kind === "dashboard")
        setDashboard(await api<Dashboard>("/admin/dashboard", { headers }));
      else if (kind === "settings")
        setSettings(await api<Settings>("/admin/settings", { headers }));
      else setRows(await api<Row[]>(`/admin/${kind}`, { headers }));
      if (kind === "products")
        setCollections(
          await api<Collection[]>("/admin/collections", { headers }),
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [token, tab]);
  useEffect(() => {
    if (editing !== undefined) editor.current?.focus();
  }, [editing]);
  async function save(value: unknown, id?: string) {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await api(`/admin/${tab}${id ? `/${id}` : ""}`, {
        ...json(value, id || tab === "settings" ? "PUT" : "POST"),
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("Saved.");
      setEditing(undefined);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const label = (row: Row) =>
    "title" in row
      ? row.title
      : "orderNumber" in row
        ? row.orderNumber
        : "code" in row
          ? row.code
          : "name" in row && row.name
            ? row.name
            : "email" in row
              ? row.email
              : "Record";
  if (checking)
    return <div className="shell section">Checking your session…</div>;
  if (!token)
    return (
      <div className="shell section admin-login">
        <p className="eyebrow">Rangvanaat merchant studio</p>
        <h1>Welcome to the studio.</h1>
        <p>Sign in to manage your collection, content and orders.</p>
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const result = await api<{ token: string }>(
                "/admin/login",
                json(Object.fromEntries(new FormData(e.currentTarget))),
              );
              sessionStorage.setItem("rv-admin-token", result.token);
              setToken(result.token);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Email
            <input
              placeholder="you@example.com"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              placeholder="Enter your password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
        <p className="muted">
          The store owner creates your administrator account during setup.
        </p>
      </div>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <p className="eyebrow">Merchant studio</p>
        <h1>Rangvanaat</h1>
        <nav aria-label="Merchant sections">
          {(
            [
              "dashboard",
              "products",
              "collections",
              "coupons",
              "orders",
              "settings",
              "enquiries",
              "subscribers",
            ] as Tab[]
          ).map((t) => (
            <button
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => {
                setTab(t);
                setEditing(undefined);
                setRows([]);
                setSearch("");
                setError("");
                setStatus("");
              }}
            >
              {t === "settings"
                ? "Store & content"
                : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <a href="/" target="_blank">
          View storefront{" "}
          <ArrowUpRight className="inline-icon" aria-hidden="true" />
        </a>
        <button
          onClick={() => {
            sessionStorage.removeItem("rv-admin-token");
            setToken("");
            setEditing(undefined);
          }}
        >
          Sign out
        </button>
      </aside>
      <div className="admin-content">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your collection, your control</p>
            <h2>
              {tab === "settings"
                ? "Store & content"
                : tab[0].toUpperCase() + tab.slice(1)}
            </h2>
          </div>
          <div className="inline">
            <button
              className="button secondary"
              onClick={() => {
                setEditing(undefined);
                void load();
              }}
            >
              Refresh
            </button>
            {["products", "collections", "coupons"].includes(tab) &&
              editing === undefined && (
                <button className="button" onClick={() => setEditing(null)}>
                  Add{" "}
                  {tab === "products"
                    ? "product"
                    : tab === "collections"
                      ? "collection"
                      : "coupon"}
                </button>
              )}
          </div>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="success" role="status">
            {status}
          </p>
        )}
        {loading && <p role="status">Loading…</p>}
        {tab === "dashboard" && dashboard && (
          <>
            <div className="metrics">
              <div>
                <span>Products</span>
                <strong>{dashboard.products}</strong>
              </div>
              <div>
                <span>Order requests</span>
                <strong>{dashboard.orders}</strong>
              </div>
              <div>
                <span>Enquiries</span>
                <strong>{dashboard.enquiries}</strong>
              </div>
            </div>
            <div className="notice">
              <h3>Payments are deferred</h3>
              <p>
                Orders arrive as unpaid requests. No gateway is connected and
                payment status cannot be marked paid here.
              </p>
            </div>
            <h3 className="mt">Low stock</h3>
            {dashboard.lowStock.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Piece</th>
                      <th>Ready stock</th>
                      <th>Sizes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td>{p.title}</td>
                        <td>{p.totalStock}</td>
                        <td>
                          {p.variants
                            .map((v) => `${v.size}: ${v.stock}`)
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No low-stock pieces.</p>
            )}
            <h3 className="mt">Recent requests</h3>
            {dashboard.recentOrders.map((o) => (
              <div className="admin-list-row" key={o._id}>
                <span>{o.orderNumber}</span>
                <span>{o.customer?.name}</span>
                <span>{money(o.financials.totalAmount)}</span>
                <span>{o.fulfillment.status.replaceAll("_", " ")}</span>
              </div>
            ))}
          </>
        )}
        {tab === "settings" && settings && !loading && (
          <SettingsEditor
            key={JSON.stringify(settings)}
            initial={settings}
            save={save}
            token={token}
            busy={busy}
          />
        )}{" "}
        {editing !== undefined && (
          <div className="admin-editor" ref={editor} tabIndex={-1}>
            <button className="text-link" onClick={() => setEditing(undefined)}>
              <ArrowLeft className="inline-icon" aria-hidden="true" /> Back to
              list
            </button>
            {tab === "products" && (
              <ProductEditor
                key={editing?._id || "new"}
                initial={(editing as Product) || undefined}
                collections={collections}
                save={save}
                token={token}
                busy={busy}
              />
            )}{" "}
            {tab === "collections" && (
              <CollectionEditor
                key={editing?._id || "new"}
                initial={(editing as Collection) || undefined}
                save={save}
                token={token}
                busy={busy}
              />
            )}{" "}
            {tab === "coupons" && (
              <CouponEditor
                key={editing?._id || "new"}
                initial={(editing as Coupon) || undefined}
                save={save}
                busy={busy}
              />
            )}{" "}
            {tab === "orders" && editing && (
              <OrderEditor
                key={editing._id}
                initial={editing as Order}
                save={save}
                busy={busy}
              />
            )}
          </div>
        )}
        {!["dashboard", "settings"].includes(tab) && editing === undefined && (
          <>
            <label className="admin-search">
              Search {tab}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a record"
              />
            </label>
            {!rows.length && !loading ? (
              <div className="empty">
                No {tab} yet.
                {tab === "products" && (
                  <p>
                    Add a product, or import the original catalog as drafts
                    using the seed command.
                  </p>
                )}
              </div>
            ) : (
              <div className="admin-list">
                {rows
                  .filter((r) =>
                    JSON.stringify(r)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((r) => (
                    <article className="admin-list-row" key={r._id}>
                      <div>
                        {"images" in r && r.images[0] && (
                          <img src={r.images[0].url} alt="" />
                        )}
                        <strong>{label(r)}</strong>
                        {"price" in r && (
                          <p>
                            {money(r.price)} · {r.totalStock} ready stock ·{" "}
                            {r.isPublished ? "Published" : "Draft"}
                          </p>
                        )}
                        {"isActive" in r && (
                          <p>{r.isActive ? "Active" : "Archived"}</p>
                        )}
                        {"fulfillment" in r && (
                          <p>
                            {r.fulfillment.status.replaceAll("_", " ")} ·
                            Payment {r.payment.status} ·{" "}
                            {money(r.financials.totalAmount)}
                          </p>
                        )}
                        {"email" in r && <p>{r.email}</p>}
                        {"message" in r && r.message && (
                          <p className="prose">{r.message}</p>
                        )}
                      </div>
                      {[
                        "products",
                        "collections",
                        "coupons",
                        "orders",
                      ].includes(tab) && (
                        <div className="inline">
                          <button
                            className="button secondary"
                            onClick={() => setEditing(r)}
                          >
                            Edit
                          </button>
                          {tab === "products" && "price" in r && (
                            <button
                              className="button secondary"
                              disabled={busy}
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  await api(
                                    `/admin/products/${r._id}/availability`,
                                    {
                                      ...json(
                                        { salesPaused: !r.salesPaused },
                                        "PATCH",
                                      ),
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );
                                  setStatus(
                                    r.salesPaused
                                      ? "Orders resumed."
                                      : "Orders paused; stock preserved.",
                                  );
                                  await load();
                                } catch (e) {
                                  setError((e as Error).message);
                                } finally {
                                  setBusy(false);
                                }
                              }}
                            >
                              {r.salesPaused ? "Resume orders" : "Pause orders"}
                            </button>
                          )}
                          {tab !== "orders" && (
                            <button
                              className="text-link"
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  await api(`/admin/${tab}/${r._id}`, {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });
                                  setStatus("Archived.");
                                  await load();
                                } catch (e) {
                                  setError((e as Error).message);
                                } finally {
                                  setBusy(false);
                                }
                              }}
                              disabled={busy}
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
              </div>
            )}
            <p className="muted">
              Showing up to{" "}
              {tab === "orders" || tab === "enquiries" ? 200 : 1000} most recent
              records.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
