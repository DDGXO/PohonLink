# SCOPE.md - Pohonlink

> What's in v1 and what's explicitly deferred.

---

## In Scope (v1)

### Authentication
- Email + password registration
- Email + password login
- Logout
- Protected routes (dashboard, admin)
- Auto-create profile on registration

### Profile
- Unique username selection (lowercase, numbers, underscore, dash; 3-30 chars)
- Edit display name, bio, avatar
- Public profile page at `/@username`
- 404 for non-existent or blocked profiles

### Link Management
- Add, edit, delete links
- Drag-and-drop reorder
- Pin/unpin links
- Active/inactive toggle

### Appearance
- 3 preset themes (Dark, Light, Gradient)
- Custom background color
- Custom button card color and text color
- Border radius control
- Font selector
- Background image upload
- Avatar upload
- Real-time preview

### Analytics
- Pageview tracking (Beacon API)
- Click tracking (Beacon API + RPC)
- Total views in dashboard
- Clicks per link
- OS breakdown
- Referrer breakdown

### Admin
- User list with pagination
- Block/unblock user
- Delete user
- Impersonation (login as user)

## Out of Scope (Deferred)

- Payment / subscription billing
- Email marketing / newsletter
- Media embeds (YouTube, Spotify)
- vCard / digital contact
- OAuth login (Google, GitHub)
- Multi-language / i18n
- Custom domain per user
- Block types: heading, text, spacer
- Email verification
