"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PLAN_LABELS, normalizePlan, type PlanTier } from "@/lib/plans";
import type { AppRole } from "@/lib/roles";
import { safeJsonParse } from "@/lib/http";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "inactive";

type AdminUser = {
  id: string;
  email: string | null;
  username?: string | null;
  role: AppRole;
  subscription: {
    plan: PlanTier;
    status: string;
    currentPeriodEnd: string | null;
  };
  createdAt: string | null;
  lastSignInAt: string | null;
};

type AdminUsersResponse = {
  users?: AdminUser[];
  pagination?: {
    page: number;
    perPage: number;
    total: number | null;
    totalPages: number | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  error?: string;
};

type UpdateUserRoleResponse = {
  userId?: string;
  role?: AppRole;
  error?: string;
};

type CreateUserResponse = {
  user?: {
    id: string;
    email: string;
    username?: string;
    role: AppRole;
  };
  error?: string;
};

type UpdateSubscriptionResponse = {
  userId?: string;
  plan?: PlanTier;
  status?: string;
  currentPeriodEnd?: string | null;
  error?: string;
};

type AdminUsersPanelProps = {
  currentUserId: string;
};

type RoleFilter = "all" | AppRole;
type MembershipFilter = "all" | "active" | "inactive";

type PendingSubscriptionEdit = {
  plan: PlanTier;
  status: SubscriptionStatus;
};

const SUBSCRIPTION_STATUS_OPTIONS: SubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "inactive",
];

function formatDate(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function normalizeSubscriptionStatus(value: string | null | undefined): SubscriptionStatus {
  const normalized = (value ?? "").toLowerCase();
  if (SUBSCRIPTION_STATUS_OPTIONS.includes(normalized as SubscriptionStatus)) {
    return normalized as SubscriptionStatus;
  }

  return "inactive";
}

function formatSubscriptionStatus(value: string | null | undefined): string {
  return normalizeSubscriptionStatus(value).replaceAll("_", " ");
}

function isMembershipActive(status: string): boolean {
  const normalized = normalizeSubscriptionStatus(status);
  return normalized === "active" || normalized === "trialing" || normalized === "past_due";
}

export default function AdminUsersPanel({ currentUserId }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [total, setTotal] = useState<number | null>(0);
  const [totalPages, setTotalPages] = useState<number | null>(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [savingMembershipUserId, setSavingMembershipUserId] = useState<string | null>(null);
  const [grantingMonthUserId, setGrantingMonthUserId] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscriptionEdits, setSubscriptionEdits] = useState<Record<string, PendingSubscriptionEdit>>({});
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("parent");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
      });

      if (search) {
        params.set("search", search);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, { method: "GET" });
      const json = await safeJsonParse<AdminUsersResponse>(response);

      if (!response.ok) {
        throw new Error(json.error ?? "Could not load users.");
      }

      const fetchedUsers = (json.users ?? []).map((user) => ({
        ...user,
        subscription: {
          plan: normalizePlan(user.subscription?.plan),
          status: normalizeSubscriptionStatus(user.subscription?.status),
          currentPeriodEnd: user.subscription?.currentPeriodEnd ?? null,
        },
      }));

      setUsers(fetchedUsers);
      setSubscriptionEdits(
        fetchedUsers.reduce<Record<string, PendingSubscriptionEdit>>((acc, user) => {
          acc[user.id] = {
            plan: user.subscription.plan,
            status: normalizeSubscriptionStatus(user.subscription.status),
          };
          return acc;
        }, {}),
      );
      setTotal(json.pagination?.total ?? null);
      setTotalPages(json.pagination?.totalPages ?? null);
      setHasPreviousPage(json.pagination?.hasPreviousPage ?? false);
      setHasNextPage(json.pagination?.hasNextPage ?? false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        const roleMatches = roleFilter === "all" || user.role === roleFilter;
        const membershipMatches =
          membershipFilter === "all" ||
          (membershipFilter === "active" ? isMembershipActive(user.subscription.status) : !isMembershipActive(user.subscription.status));

        return roleMatches && membershipMatches;
      }),
    [membershipFilter, roleFilter, users],
  );

  const pageStats = useMemo(() => {
    const activeMemberships = users.filter((user) => isMembershipActive(user.subscription.status)).length;
    const adminUsers = users.filter((user) => user.role === "admin").length;

    return {
      activeMemberships,
      adminUsers,
      usersOnPage: users.length,
    };
  }, [users]);

  async function updateRole(userId: string, role: AppRole) {
    setSavingUserId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const json = await safeJsonParse<UpdateUserRoleResponse>(response);

      if (!response.ok || !json.userId || !json.role) {
        throw new Error(json.error ?? "Could not update role.");
      }

      setUsers((previous) => previous.map((user) => (user.id === json.userId ? { ...user, role: json.role as AppRole } : user)));
      setSuccess("Role updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update role.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function updateSubscription(userId: string) {
    const pendingEdit = subscriptionEdits[userId];
    if (!pendingEdit) {
      return;
    }

    setSavingMembershipUserId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          plan: pendingEdit.plan,
          status: pendingEdit.status,
        }),
      });

      const json = await safeJsonParse<UpdateSubscriptionResponse>(response);

      if (!response.ok || !json.userId || !json.plan || !json.status) {
        throw new Error(json.error ?? "Could not update subscription.");
      }

      setUsers((previous) =>
        previous.map((user) =>
          user.id === json.userId
            ? {
                ...user,
                subscription: {
                  plan: normalizePlan(json.plan),
                  status: normalizeSubscriptionStatus(json.status),
                  currentPeriodEnd: json.currentPeriodEnd ?? null,
                },
              }
            : user,
        ),
      );

      setSubscriptionEdits((previous) => ({
        ...previous,
        [userId]: {
          plan: normalizePlan(json.plan),
          status: normalizeSubscriptionStatus(json.status),
        },
      }));

      setSuccess("Subscription updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update subscription.");
    } finally {
      setSavingMembershipUserId(null);
    }
  }

  async function grantOneMonth(userId: string) {
    setGrantingMonthUserId(userId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const json = await safeJsonParse<UpdateSubscriptionResponse>(response);
      if (!response.ok || !json.userId || !json.plan || !json.status) {
        throw new Error(json.error ?? "Could not grant free month.");
      }

      setUsers((previous) =>
        previous.map((user) =>
          user.id === json.userId
            ? {
                ...user,
                subscription: {
                  plan: normalizePlan(json.plan),
                  status: normalizeSubscriptionStatus(json.status),
                  currentPeriodEnd: json.currentPeriodEnd ?? null,
                },
              }
            : user,
        ),
      );

      setSubscriptionEdits((previous) => ({
        ...previous,
        [userId]: {
          plan: normalizePlan(json.plan),
          status: normalizeSubscriptionStatus(json.status),
        },
      }));

      setSuccess("Granted 1-month free subscription.");
    } catch (grantError) {
      setError(grantError instanceof Error ? grantError.message : "Could not grant free month.");
    } finally {
      setGrantingMonthUserId(null);
    }
  }

  async function createUser() {
    if (!newUsername.trim() || newUserPassword.length < 8) {
      setError("Provide a username and a password with at least 8 characters.");
      return;
    }

    setCreatingUser(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      const json = await safeJsonParse<CreateUserResponse>(response);
      if (!response.ok || !json.user) {
        throw new Error(json.error ?? "Could not create account.");
      }

      setNewUsername("");
      setNewUserPassword("");
      setNewUserRole("parent");
      await loadUsers();
      setSuccess(`Account created for ${json.user.username ?? json.user.email}.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create account.");
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="section-title">Membership + User Operations</div>
          <div style={{ color: "var(--text-3)", fontSize: "0.8rem", marginTop: 4 }}>
            Manage roles and subscription access for homeschool families.
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => void loadUsers()}
          disabled={loading || savingUserId !== null || savingMembershipUserId !== null || grantingMonthUserId !== null}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 14 }}>
        <div className="stat-card blue">
          <div className="stat-content">
            <div className="stat-value">{pageStats.usersOnPage}</div>
            <div className="stat-label">Users on page</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-content">
            <div className="stat-value">{pageStats.adminUsers}</div>
            <div className="stat-label">Admins on page</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-content">
            <div className="stat-value">{pageStats.activeMemberships}</div>
            <div className="stat-label">Active memberships on page</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <input
          className="form-input"
          placeholder="Search username or email..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          className="form-select"
          value={roleFilter}
          onChange={(event) => {
            const next = event.target.value;
            setRoleFilter(next === "admin" ? "admin" : next === "parent" ? "parent" : "all");
          }}
        >
          <option value="all">All roles</option>
          <option value="admin">Admin only</option>
          <option value="parent">Parent only</option>
        </select>
        <select
          className="form-select"
          value={membershipFilter}
          onChange={(event) => {
            const next = event.target.value;
            setMembershipFilter(next === "active" ? "active" : next === "inactive" ? "inactive" : "all");
          }}
        >
          <option value="all">All memberships</option>
          <option value="active">Active memberships</option>
          <option value="inactive">Inactive memberships</option>
        </select>
        <select
          className="form-select"
          value={String(perPage)}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            setPage(1);
            setPerPage(Number.isFinite(next) ? next : 25);
          }}
        >
          <option value="10">10 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>

      <div className="card-sm" style={{ border: "1px solid var(--border)", marginBottom: 14 }}>
        <div className="section-header" style={{ marginBottom: 8 }}>
          <div className="section-title" style={{ fontSize: "1rem" }}>Create Account</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr auto", gap: 8 }}>
          <input
            className="form-input"
            placeholder="username"
            value={newUsername}
            onChange={(event) => setNewUsername(event.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password (min 8)"
            value={newUserPassword}
            onChange={(event) => setNewUserPassword(event.target.value)}
          />
          <select className="form-select" value={newUserRole} onChange={(event) => setNewUserRole(event.target.value === "admin" ? "admin" : "parent")}>
            <option value="parent">parent</option>
            <option value="admin">admin</option>
          </select>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => void createUser()} disabled={creatingUser}>
            {creatingUser ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="badge red" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="badge green" style={{ marginBottom: 12 }}>
          {success}
        </div>
      ) : null}

      {loading ? (
        <div className="card-sm" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
          Loading users...
        </div>
      ) : visibleUsers.length === 0 ? (
        <div className="empty-state" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 24 }}>
          <p>No users found for this filter.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Membership Plan</th>
                <th>Membership Status</th>
                <th>Period End</th>
                <th style={{ width: 330 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const isSelf = user.id === currentUserId;
                const isSavingRole = savingUserId === user.id;
                const isSavingMembership = savingMembershipUserId === user.id;
                const isGranting = grantingMonthUserId === user.id;
                const userIdentity = user.username ?? user.email ?? "(no identifier)";
                const secondaryIdentity = user.username && user.email ? user.email : null;
                const pendingEdit = subscriptionEdits[user.id] ?? {
                  plan: user.subscription.plan,
                  status: normalizeSubscriptionStatus(user.subscription.status),
                };

                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{userIdentity}</div>
                      <div style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: 3 }}>
                        {isSelf ? "You" : "User"} - {user.id}
                      </div>
                      {secondaryIdentity ? (
                        <div style={{ color: "var(--text-3)", fontSize: "0.72rem", marginTop: 2 }}>{secondaryIdentity}</div>
                      ) : null}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span className={`badge ${user.role === "admin" ? "purple" : "gray"}`}>{user.role}</span>
                        <select
                          className="form-select"
                          style={{ width: 105 }}
                          value={user.role}
                          disabled={isSavingRole}
                          onChange={(event) => {
                            const nextRole = event.target.value === "admin" ? "admin" : "parent";
                            if (nextRole === user.role) {
                              return;
                            }

                            void updateRole(user.id, nextRole);
                          }}
                        >
                          <option value="parent" disabled={isSelf}>
                            parent
                          </option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="badge blue" style={{ marginBottom: 6 }}>
                        {PLAN_LABELS[user.subscription.plan]}
                      </div>
                      <select
                        className="form-select"
                        value={pendingEdit.plan}
                        disabled={isSavingMembership || isGranting}
                        onChange={(event) => {
                          const nextPlan = normalizePlan(event.target.value);
                          setSubscriptionEdits((previous) => ({
                            ...previous,
                            [user.id]: {
                              ...pendingEdit,
                              plan: nextPlan,
                            },
                          }));
                        }}
                      >
                        <option value="free">free</option>
                        <option value="family">family</option>
                        <option value="family_plus">family_plus</option>
                        <option value="co_op">co_op</option>
                      </select>
                    </td>
                    <td>
                      <div className={`badge ${isMembershipActive(user.subscription.status) ? "green" : "gray"}`} style={{ marginBottom: 6 }}>
                        {formatSubscriptionStatus(user.subscription.status)}
                      </div>
                      <select
                        className="form-select"
                        value={pendingEdit.status}
                        disabled={isSavingMembership || isGranting}
                        onChange={(event) => {
                          const nextStatus = normalizeSubscriptionStatus(event.target.value);
                          setSubscriptionEdits((previous) => ({
                            ...previous,
                            [user.id]: {
                              ...pendingEdit,
                              status: nextStatus,
                            },
                          }));
                        }}
                      >
                        {SUBSCRIPTION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(user.subscription.currentPeriodEnd)}</td>
                    <td>
                      <div style={{ display: "grid", gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={isSavingMembership || isGranting}
                          onClick={() => void updateSubscription(user.id)}
                        >
                          {isSavingMembership ? "Saving..." : "Save membership"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          disabled={isSavingMembership || isGranting}
                          onClick={() => void grantOneMonth(user.id)}
                        >
                          {isGranting ? "Granting..." : "Grant 1 month free"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8, flexWrap: "wrap" }}>
        <div style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
          Page {page}
          {totalPages ? ` of ${totalPages}` : ""}
          {" • "}
          {total === null ? "total unknown" : `${total} total users`}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={!hasPreviousPage || loading}
            onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
          >
            Previous
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={!hasNextPage || loading} onClick={() => setPage((previous) => previous + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
