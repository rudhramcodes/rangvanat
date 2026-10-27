import Pagination from "../components/Pagination";
"use client";
import { ArrowUpRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
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
    [search, setSearch] = useState(""),
    [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const requestId = useRef(0);
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
    const request = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${t}` };
      if (kind === "dashboard")
        setDashboard(await api<Dashboard>("/admin/dashboard", { headers }));
      else if (kind === "settings")
        setSettings(await api<Settings>("/admin/settings", { headers }));
      else {
        const result = await api<{ rows: Row[]; pagination: { total: number; page: number } }>(`/admin/${kind}?paginated=true&page=${page}&limit=12&search=${encodeURIComponent(search)}`, { headers });
        if (request !== requestId.current) return;
        setRows(result.rows); setTotal(result.pagination.total);
        if (result.pagination.page !== page) setPage(result.pagination.page);
      }
      if (kind === "products")
        setCollections(
          await api<Collection[]>("/admin/collections", { headers }),
        );
    } catch (e) {
      if (request === requestId.current) setError((e as Error).message);
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    return () => { requestId.current++; };
  }, [token, tab, page, search]);
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
        <p className="eyebrow">Rangvanat merchant studio</p>
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
            <div style={{ position: "relative", width: "100%" }}>
              <input
                placeholder="Enter your password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
        <a className="admin-brand" href="/"><img src="/images/logo-only.svg" alt="" /><span>Rangvanat<small>Merchant studio</small></span></a>
        <details className="admin-navigation" open><summary>Workspace navigation</summary><nav aria-label="Merchant sections">
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
                setPage(1); setTotal(0);
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
        </nav></details>
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
      <main className="admin-content" id="admin-main">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rangvanat / Merchant studio</p>
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
            <div className="notice"><h3>Your daily studio check</h3><p>Review low-stock sizes before accepting new orders, then update fulfillment as pieces leave the atelier.</p></div>
            <div className="admin-dashboard-grid"><section className="admin-dashboard-section"><h3 className="mt">Stock needing attention</h3>
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
            </section><section className="admin-dashboard-section"><h3 className="mt">Recent orders</h3>{!dashboard.recentOrders.length && <p className="empty">New orders will appear here.</p>}
            {dashboard.recentOrders.map((o) => (
              <div className="admin-order-summary" key={o._id}>
                <span>{o.orderNumber}</span>
                <span>{o.customer?.name}</span>
                <span>{money(o.financials.totalAmount)}</span>
                <span>{o.fulfillment.status.replaceAll("_", " ")}</span>
              </div>
            ))}</section></div>
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search ${tab} by name, reference or details`}
              />
            </label>
            {!rows.length && !loading ? (
              <div className="empty">
                {search ? `No ${tab} match “${search}”. Try another search.` : `No ${tab} yet.`}
                {tab === "products" && (
                  <p>
                    Use Add product to create your first piece and set its sizes, stock and photos.
                  </p>
                )}
              </div>
            ) : (
              <div className="admin-list">
                {rows
                  .map((r) => (
                    <article className="admin-list-row" key={r._id}>
                      <div className="admin-record">
                        {"images" in r && r.images[0] && (
                          <img src={r.images[0].url} alt="" />
                        )}
                        <strong className="admin-record-title">{label(r)}</strong>
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
            <Pagination page={page} total={total} pageSize={12} disabled={loading} onChange={next => { setPage(next); document.getElementById('admin-main')?.scrollIntoView({block:'start'}); }} />
          </>
        )}
      </main>
    </div>
  );
}
