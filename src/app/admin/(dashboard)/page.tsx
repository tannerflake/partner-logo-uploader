import Link from "next/link";
import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PartnerRow = {
  id: string;
  company_name: string;
  status: string;
  created_at: string;
};

type SortKey = "submitted" | "company";
type Order = "asc" | "desc";
type StatusFilter = "all" | "finalized" | "open";

function StatusBadge({ status }: { status: string }) {
  const finalized = status === "complete";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        finalized
          ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
          : "bg-neutral-200 text-neutral-800 ring-neutral-300"
      }`}
    >
      {finalized ? "Finalized" : "Not finalized"}
    </span>
  );
}

function parseListParams(searchParams: Record<string, string | undefined>): {
  sort: SortKey;
  order: Order;
  status: StatusFilter;
} {
  const sort: SortKey =
    searchParams.sort === "company" ? "company" : "submitted";
  const order: Order =
    searchParams.order === "asc" || searchParams.order === "desc"
      ? searchParams.order
      : sort === "company"
        ? "asc"
        : "desc";
  const status: StatusFilter =
    searchParams.status === "finalized" || searchParams.status === "open"
      ? searchParams.status
      : "all";
  return { sort, order, status };
}

function qs(next: { sort: SortKey; order: Order; status: StatusFilter }) {
  const p = new URLSearchParams();
  p.set("sort", next.sort);
  p.set("order", next.order);
  if (next.status !== "all") p.set("status", next.status);
  const s = p.toString();
  return s ? `?${s}` : "";
}

function nextSort(
  current: { sort: SortKey; order: Order; status: StatusFilter },
  column: SortKey,
): { sort: SortKey; order: Order; status: StatusFilter } {
  if (current.sort === column) {
    return {
      ...current,
      order: current.order === "asc" ? "desc" : "asc",
    };
  }
  return {
    sort: column,
    order: column === "company" ? "asc" : "desc",
    status: current.status,
  };
}

function FilterLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-neutral-900 text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {children}
    </Link>
  );
}

function SortHeader({
  label,
  column,
  current,
}: {
  label: string;
  column: SortKey;
  current: { sort: SortKey; order: Order; status: StatusFilter };
}) {
  const next = nextSort(current, column);
  const active = current.sort === column;
  return (
    <Link
      href={`/admin${qs(next)}`}
      className={`inline-flex items-center gap-1 font-medium hover:text-neutral-900 ${
        active ? "text-neutral-900" : "text-neutral-700"
      }`}
    >
      {label}
      {active && (
        <span className="text-neutral-500" aria-hidden>
          {current.order === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Link>
  );
}

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sp = {
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    order: typeof raw.order === "string" ? raw.order : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  };
  const { sort, order, status: statusFilter } = parseListParams(sp);

  const listState: { sort: SortKey; order: Order; status: StatusFilter } = {
    sort,
    order,
    status: statusFilter,
  };

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("partners")
    .select("id, company_name, status, created_at");

  if (statusFilter === "finalized") {
    query = query.eq("status", "complete");
  } else if (statusFilter === "open") {
    query = query.neq("status", "complete");
  }

  const sortCol = sort === "company" ? "company_name" : "created_at";
  query = query.order(sortCol, { ascending: order === "asc" });

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Could not load partners. Check Supabase env and schema ({error.message}).
      </div>
    );
  }

  const partners = (rows ?? []) as PartnerRow[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Partners</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Submissions from the public onboarding form.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-neutral-500">Status:</span>
        <FilterLink
          active={statusFilter === "all"}
          href={`/admin${qs({ ...listState, status: "all" })}`}
        >
          All
        </FilterLink>
        <FilterLink
          active={statusFilter === "finalized"}
          href={`/admin${qs({ ...listState, status: "finalized" })}`}
        >
          Finalized
        </FilterLink>
        <FilterLink
          active={statusFilter === "open"}
          href={`/admin${qs({ ...listState, status: "open" })}`}
        >
          Not finalized
        </FilterLink>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Company"
                  column="company"
                  current={listState}
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">
                Status
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader
                  label="Submitted"
                  column="submitted"
                  current={listState}
                />
              </th>
              <th className="px-4 py-3 text-right font-medium text-neutral-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {partners.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  {statusFilter === "all"
                    ? "No partners yet."
                    : "No partners match this filter."}
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <Link
                      href={`/admin/partners/${p.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {p.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/partners/${p.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
