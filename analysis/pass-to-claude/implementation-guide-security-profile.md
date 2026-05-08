# Implementation Guide: Security Profile Page

**Prototype reference:** `horizon-v39/user-profile.html`
**Live preview:** https://sitebyte.github.io/horizon-ui-templates/horizon-v39/user-profile.html
**Production route:** `/admin/security-profile` (also accessible via avatar dropdown in shell header)
**Date:** 2026-05-08

---

## 1. What This Page Does

Displays the authenticated user's EOS security profile: identity, AD domain, roles, legal entity assignments, and the full permission set loaded from the EOS security tables. This replaces the existing "EOS Security Profile" page in the WinForms client, which shows:

- User identity (AD domain\username, User ID)
- Roles (flat list of role names)
- Legal Entities (table with Code, Name, Active flag, ID)
- Permissions (flat 4-column grid of ~488 permission names with numeric IDs)

The prototype redesigns this into a searchable, categorised, data-dense view that makes 488 permissions navigable instead of a wall of text.

---

## 2. Data Source

All data comes from a **single API call** on page load. The user does not select which profile to view — it is always the authenticated user (claims from Keycloak/OIDC).

### Primary Endpoint

```
GET /api/admin/security-profile
```

**Response shape:**

```typescript
interface SecurityProfileDto {
  // Identity (from Keycloak claims + EOS user table)
  userId: number;                    // EOS internal user ID
  username: string;                  // AD sAMAccountName
  domain: string;                    // AD domain (e.g. "ACMECORP")
  displayName: string;               // AD displayName
  email: string;                     // AD mail
  department?: string;               // AD department
  location?: string;                 // AD office/location
  manager?: string;                  // AD manager displayName
  
  // Security assignments
  roles: RoleDto[];
  legalEntities: LegalEntityDto[];
  permissions: PermissionDto[];
  
  // Metadata
  lastLogin: string;                 // ISO 8601
  accountCreated: string;            // ISO 8601
  passwordExpiry?: string;           // ISO 8601, null if no expiry
  mfaEnabled: boolean;
  authProvider: string;              // "ActiveDirectory", "Keycloak", etc.
}

interface RoleDto {
  roleId: number;
  name: string;                      // e.g. "Connect", "Security Administrator"
}

interface LegalEntityDto {
  entityId: number;                  // EOS internal ID
  code: string;                      // Short code, e.g. "ACHK"
  name: string;                      // Full registered name
  isActive: boolean;
}

interface PermissionDto {
  permissionId: number;              // EOS internal ID
  name: string;                      // PascalCase name, e.g. "AddTrade"
  category?: string;                 // Optional server-side category
}
```

### Where the data lives in EOS

- **User identity:** `dbo.Users` table joined with AD attributes via Keycloak claims
- **Roles:** `dbo.UserRoles` → `dbo.Roles` (many-to-many)
- **Legal entities:** `dbo.UserLegalEntities` → `dbo.LegalEntities` (many-to-many, with Active flag)
- **Permissions:** `dbo.RolePermissions` → `dbo.Permissions` (inherited through roles, union of all role permissions)

### Permission Categorisation

The prototype groups ~488 permissions into 8 categories by verb prefix. This categorisation is done **client-side** by parsing the PascalCase permission name:

| Category | Prefix match | Colour | Count (typical) |
|----------|-------------|--------|-----------------|
| Add / Create | `Add*`, `Actualisation*` | `--green` | ~85 |
| Change / Update | `Change*` | `--amber` | ~21 |
| View / Read | `View*` | `--blue` | ~42 |
| Cancel / Delete | `Cancel*`, `Delete*`, `Remove*` | `--red` | ~12 |
| Cargo & Shipping | `Cargo*`, `Annual*`, `Apply*`, `Assign*`, `Attach*`, `Broadcast*` | `--accent-light` | ~12 |
| Approve / Confirm | `Approve*`, `Confirm*`, `Validate*`, `Check*` | `--green` | ~12 |
| Reports & Export | `Export*`, `Generate*`, `Print*`, `Run*` | `--text-tertiary` | ~12 |
| System & Admin | `Manage*`, `Configure*`, `Backup*`, `Restore*` | `--accent-violet` | ~16 |

Alternatively, the API could return a `category` field on each permission if server-side grouping is preferred. The client-side approach means no API change is needed.

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Identity Banner (full width, gradient bg)               │
│  [Avatar] [Name / Domain / Status Pills]    [Settings]   │
├─────────────────────────────────────────────────────────┤
│  KPI Row: 4 tiles (Roles | Legal Entities | Perms | MTD) │
├──────────────┬──────────────────────────────────────────┤
│  Sidebar     │  Main Content                             │
│  (20rem)     │  (1fr)                                    │
│              │                                           │
│  Account     │  Roles (card row)                         │
│  Auth        │  Legal Entities (card grid)                │
│  Activity    │  Permissions Explorer (accordion+search)   │
│  Sessions    │                                           │
└──────────────┴──────────────────────────────────────────┘
```

**Responsive:** At `<64rem`, collapses to single-column (sidebar stacks above main).

---

## 4. Component Mapping

### Identity Banner

```tsx
<Tile padding={0} className="overflow-hidden">
  <div className="relative flex items-center gap-5 px-6 py-5"
       style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.06))' }}>
    {/* Avatar with accent ring */}
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600
                    flex items-center justify-center text-xl font-bold text-white
                    ring-[3px] ring-surface-raised ring-offset-1 ring-offset-accent">
      {initials}
    </div>
    <Stack direction="column" gap={1} className="flex-1 min-w-0">
      <Text size="xl" weight={700} tracking="tight">{displayName}</Text>
      <Mono size="xs" muted>{domain}\{username}</Mono>
      <Stack direction="row" gap={3} className="mt-1.5 flex-wrap">
        <StatusPill variant="success" size="xs">Online</StatusPill>
        <StatusPill variant="info" size="xs">User ID: {userId}</StatusPill>
        <StatusPill variant="warning" size="xs">{environment}</StatusPill>
      </Stack>
    </Stack>
    <Button variant="ghost" size="sm" href="/admin/settings" icon={SettingsIcon}>
      Settings
    </Button>
  </div>
</Tile>
```

### KPI Row

```tsx
<Stack direction="row" gap={2} className="grid grid-cols-4">
  <KpiTile value={roles.length} label="Roles" />
  <KpiTile value={legalEntities.length} label="Legal Entities" />
  <KpiTile value={permissions.length} label="Permissions" color="green" />
  <KpiTile value={tradesMtd} label="Trades (MTD)" color="accent" />
</Stack>
```

Each `KpiTile`:
- Value: `<Mono size="xl" weight={700}>`  (1.25rem, bold)
- Label: `<Text size="2xs" muted uppercase tracking="wide">` (0.5625rem)
- Container: `<Tile>` with `text-align: center`, `padding: 0.625rem`

### Sidebar: Account Details

Key-value rows using the standard detail pattern:

```tsx
<Tile>
  <SectionHeader title="Account" />
  <DetailRow label="Username" value={<Mono>{username}</Mono>} />
  <DetailRow label="Domain" value={<Mono>{domain}</Mono>} />
  <DetailRow label="Email" value={email} />
  <DetailRow label="Department" value={department} />
  <DetailRow label="Location" value={location} />
  <DetailRow label="Manager" value={<Link to={`/admin/users/${managerId}`}>{manager}</Link>} />
</Tile>
```

**`DetailRow` pattern** (reusable across many pages):
- Layout: `flex justify-between items-center`, `padding-y: 0.3125rem`, bottom border
- Label: `<Text size="xs" muted>` (0.6875rem, `--text-muted`)
- Value: `<Text size="xs" secondary>` (0.6875rem, `--text-secondary`, right-aligned)
- Last child: no bottom border

### Sidebar: Recent Activity

Timeline list with colour-coded dots:

```tsx
<Tile>
  <SectionHeader title="Recent Activity" />
  <ul>
    {activities.map(a => (
      <li className="flex gap-2 py-1.5 border-b border-border last:border-0">
        <HealthDot color={activityTypeColor(a.type)} className="mt-1" />
        <Text size="xs" secondary className="flex-1">{a.description}</Text>
        <Mono size="2xs" muted className="shrink-0">{a.relativeTime}</Mono>
      </li>
    ))}
  </ul>
</Tile>
```

Activity dot colours: `trade` = accent, `login` = green, `setting` = amber, `admin` = blue.

**Data source for activity:** This could come from the audit trail API (`GET /api/admin/audit?userId={id}&limit=10`) or be included in the security profile response. Either way, it's the same audit log data filtered to the current user.

### Role Cards

```tsx
<Tile>
  <SectionHeader title="Roles" count={roles.length} />
  <Stack direction="row" gap={1.5} wrap>
    {roles.map(r => (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5
                      bg-gradient-subtle border border-accent/20 rounded-md
                      text-accent-light text-xs font-medium
                      hover:border-accent hover:bg-accent-bg transition">
        <RoleIcon role={r.name} size={14} />
        {r.name}
      </div>
    ))}
  </Stack>
</Tile>
```

Icon mapping for roles:
- `Connect` → log-in icon
- `Security Administrator` → shield icon
- `System Administrator` → settings/gear icon
- Default → user icon

### Legal Entity Cards

```tsx
<Tile>
  <SectionHeader title="Legal Entities" count={legalEntities.length} />
  <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2">
    {legalEntities.map(le => (
      <div className="p-2.5 bg-surface-base border border-border rounded-md
                      hover:border-accent hover:bg-accent-bg2 transition">
        <Stack direction="row" align="center" gap={1.5}>
          <HealthDot color={le.isActive ? 'green' : 'muted'} />
          <Mono size="sm" weight={600} className="text-accent-light">{le.code}</Mono>
        </Stack>
        <Text size="2xs" muted className="mt-0.5 leading-snug">{le.name}</Text>
        <Mono size="2xs" muted className="mt-0.5 opacity-60">ID {le.entityId}</Mono>
      </div>
    ))}
  </div>
</Tile>
```

### Permission Explorer

This is the most complex component on the page. It has three parts:

#### a) Search Bar

```tsx
<div className="flex items-center gap-2 px-2.5 py-1.5 bg-input border border-border rounded-md
                focus-within:border-accent transition">
  <SearchIcon size={14} className="text-muted shrink-0" />
  <input className="flex-1 bg-transparent border-none outline-none text-sm text-primary"
         placeholder={`Search ${permissions.length} permissions...`}
         value={searchQuery}
         onChange={e => setSearchQuery(e.target.value)} />
  {searchQuery && (
    <Mono size="2xs" muted>{matchCount} found</Mono>
  )}
</div>
```

#### b) Stats Bar

```tsx
<Stack direction="row" gap={3} className="text-2xs text-muted">
  <span><Mono weight={600} className="text-green">{grantedCount}</Mono> granted</span>
  <span><Mono weight={600} className="text-amber">{limitedCount}</Mono> limited</span>
  <span><Mono weight={600} className="text-red">{deniedCount}</Mono> denied</span>
</Stack>
```

**Note:** The granted/limited/denied status is determined by the permission's presence in the user's roles. In EOS, all permissions assigned to a user's roles are "granted." The prototype includes `limited` and `denied` as visual categories for future RBAC refinement, but the initial implementation can treat all returned permissions as granted and show denied as "permissions NOT in the user's set" (if the full permission catalogue is available).

#### c) Category Accordion

Each category is a collapsible section:

```tsx
{categories.map((cat, i) => {
  const visiblePerms = cat.perms.filter(p => matchesSearch(p, searchQuery));
  if (searchQuery && visiblePerms.length === 0) return null;
  
  return (
    <div className="border border-border rounded-md mb-1.5 overflow-hidden
                    hover:border-border-strong transition">
      <button className="w-full flex items-center gap-2 px-2.5 py-1.5
                         hover:bg-hover transition cursor-pointer select-none"
              onClick={() => toggleCategory(i)}>
        <ChevronRight size={12} className={cn("text-muted transition-transform",
                      openCats.includes(i) && "rotate-90")} />
        <Text size="xs" weight={600} className="flex-1 text-left">{cat.label}</Text>
        <div className="h-0.5 w-12 rounded-sm opacity-40"
             style={{ background: cat.color }} />
        <Mono size="2xs" className="bg-surface-overlay px-1.5 rounded-full">
          {searchQuery ? visiblePerms.length : cat.perms.length}
        </Mono>
      </button>
      
      {openCats.includes(i) && (
        <div className="px-2.5 pb-2 flex flex-wrap gap-0.5">
          {visiblePerms.map(p => (
            <span className={cn(
              "text-2xs px-1.5 py-0.5 rounded font-mono transition",
              permStatus(p) === 'granted' && "bg-green-dim text-green hover:bg-green/25",
              permStatus(p) === 'denied'  && "bg-red-dim text-red hover:bg-red/25",
              permStatus(p) === 'limited' && "bg-amber-dim text-amber hover:bg-amber/25",
            )}>
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
})}
```

**Search behaviour:**
1. On empty query: all categories collapsed, all pills visible, counts show full totals
2. On typing: filter pills by `name.toLowerCase().includes(query)`, auto-open matching categories, hide empty categories, update count badges to show filtered count, show `"{n} found"` next to search
3. On clear: reset to initial state

**Keyboard:** Type to search (auto-focus not needed — the search bar is clearly visible). Escape clears the search field.

---

## 5. Avatar Dropdown (Shell Integration)

The Security Profile is also accessible from the **avatar dropdown** in the shell header. This is a global shell component, not page-specific.

### Trigger

Click on the user initials avatar (top-right of header) to toggle a dropdown.

### Dropdown Structure

```tsx
<div className="absolute top-[calc(100%+0.5rem)] right-0 w-64
                bg-surface-raised border border-border rounded-xl
                shadow-xl z-[999] overflow-hidden
                opacity-0 scale-98 -translate-y-1
                data-[open]:opacity-100 data-[open]:scale-100 data-[open]:translate-y-0
                transition-all duration-150">
  {/* Header: avatar + name + email */}
  <div className="flex items-center gap-2.5 p-3 border-b border-border">
    <Avatar size="md">{initials}</Avatar>
    <div className="min-w-0">
      <Text size="sm" weight={600} truncate>{displayName}</Text>
      <Text size="xs" muted truncate>{email}</Text>
    </div>
  </div>
  
  {/* Meta: role, desk, roles */}
  <div className="px-3 py-2">
    <MetaRow icon={BriefcaseIcon}>{jobTitle}</MetaRow>
    <MetaRow icon={UsersIcon}>{desk}</MetaRow>
    <MetaRow icon={ShieldIcon}>{roles.join(', ')}</MetaRow>
  </div>
  
  <Divider />
  <MenuLink icon={UserIcon} href="/admin/security-profile">View Profile</MenuLink>
  <MenuLink icon={SettingsIcon} href="/admin/settings">Settings</MenuLink>
  <Divider />
  <MenuLink icon={LogOutIcon} href="/auth/logout" variant="danger">Sign Out</MenuLink>
</div>
```

### Dismiss behaviour

- Click outside → close
- Escape → close
- Click avatar again → toggle
- Navigate to a link → close (React Router handles this naturally)

---

## 6. State Management

This page is **read-only** with no mutations. Use TanStack Query with a long stale time:

```typescript
const { data: profile } = useQuery({
  queryKey: ['security-profile'],
  queryFn: () => api.get<SecurityProfileDto>('/admin/security-profile'),
  staleTime: 5 * 60 * 1000, // 5 minutes — profile data rarely changes mid-session
});
```

Client-side state:
- `searchQuery: string` — permission search input
- `openCategories: Set<number>` — which accordion sections are expanded

No URL state needed — this is a single-view page.

---

## 7. Sidebar Menu Placement

The page appears under **ADMINISTRATION** in the sidebar:

```
ADMINISTRATION
├── Static Data (expandable)
├── Reports
├── Data Import
├── Regulations
├── Settings
└── My Profile        ← NEW (icon: user, key: 'user-profile')
```

Also registered in the command palette as `Go to My Profile` with shortcut `G U`.

---

## 8. What NOT to Build

- **No edit capabilities.** Roles, permissions, and legal entity assignments are managed via the existing EOS admin UI or AD group policies. This page is read-only.
- **No user switching.** This always shows the authenticated user's profile. An admin "view other user's profile" feature is a separate page/modal if needed later.
- **No permission request workflow.** "Request access" is out of scope — that's a ServiceNow/ticketing concern.
- **No session management.** The "Active Sessions" section in the prototype is aspirational. Keycloak has its own session management UI. Omit this section unless Keycloak's admin API is wired up.

---

## 9. Visual Reference

The prototype at `horizon-v39/user-profile.html` is the definitive visual reference. Key design decisions:

| Decision | Rationale |
|----------|-----------|
| **Sidebar/main split** (not 2-col grid) | Account details are glanceable context; permissions need width |
| **Permission accordion** (not flat grid) | 488 items in a flat grid is the EOS problem. Categories + search makes it usable |
| **Coloured permission pills** | Instant visual scan: green = you can do this, red = you can't |
| **Legal entity cards** (not table) | 5 entities don't need a table. Cards give room for the long company names |
| **KPI row** | Instant summary before scrolling — "how much access do I have?" |
| **Gradient identity banner** | This is the user's own page. It should feel personal, not like another admin table |

---

## 10. Implementation Checklist

```
[ ] FastEndpoint: GET /api/admin/security-profile
    [ ] Query EOS user by Keycloak sub/username claim
    [ ] Join roles, legal entities, permissions
    [ ] Return SecurityProfileDto
[ ] React route: /admin/security-profile
    [ ] Identity banner with avatar, name, domain, status pills
    [ ] KPI row (counts derived from response)
    [ ] Sidebar: account details, auth info
    [ ] Sidebar: recent activity (from audit API or embedded)
    [ ] Role cards with icons
    [ ] Legal entity cards with active dot
    [ ] Permission explorer: search, stats bar, category accordion
[ ] Shell integration:
    [ ] Avatar dropdown component (click initials → flyout)
    [ ] "View Profile" link in dropdown → /admin/security-profile
    [ ] Sidebar menu entry under ADMINISTRATION
    [ ] Command palette entry: "Go to My Profile" (G U)
[ ] Permission categorisation utility function
    [ ] Parse PascalCase name → category by verb prefix
    [ ] Fallback category for unmatched permissions
```
