# ADMIN PROGRESS

## PLAN
**Admin Pages & Components:**
- **Layout:** Sidebar (collapsible), Topbar (search, notifications, profile), Main Content Area.
- **Pages:** Login, Dashboard, Orders, Packing Board, Products (Catalog), Inventory, Delivery Partners, Returns/Refunds, Customers, Coupons, Reviews, CMS, Settings.

**API Endpoints to add (/api/v1/admin):**
- `/auth/*`: Login, Logout, Me.
- `/dashboard`: KPI metrics, charts data.
- `/orders`: List, detail, status update, assign delivery, export.
- `/products`: CRUD, variants, stock update, bulk import.
- `/inventory`: Ledger, batch expiries, suppliers, purchase entries.
- `/deliveries`: Slots, partners, assignments, COD reconciliation.
- `/returns`: List, approve/reject, refunds.
- `/customers`: List, block, detail.
- `/marketing`: Coupons, banners.
- `/settings`: Global configs, CMS.

**New DB Tables Added:**
- `delivery_slots`, `deliveries`, `return_requests`, `return_items`, `return_images`, `refunds`, `suppliers`, `purchase_entries`, `stock_batches`, `abandoned_cart_reminders`, `support_tickets`, `ticket_replies`, `notifications`, `cod_collections`.

## Phase A: Layout Shell, Auth, Roles, Reusable Components, Dashboard
- [x] Create `2_admin_schema.sql` migration and run it.
- [x] Setup Admin React Router inside frontend app.
- [x] Implement Admin Login page.
- [x] Implement secure Auth Context for Admin (API integration pending).
- [x] Create basic Layout (Sidebar + Topbar).
- [x] Create Dashboard UI shell (KPI cards, basic charts layout).

## Phase B: Orders (List, Detail, Pipeline, Packing Board)
- [x] Backend: Order Repository and API (list, detail, status update).
- [x] Frontend: AdminOrders.tsx (Pipeline view).
- [x] Frontend: AdminPackingBoard.tsx (Blinkit-style packing).
- [x] Frontend: Order Detail page.

## Phase C: Catalog, Categories, and Inventory
- [x] Backend: Products API (CRUD, variants, search).
- [ ] Backend: Inventory Ledger API (Pending).
- [x] Frontend: AdminCatalog.tsx (Myntra-style listing health).
- [ ] Frontend: AdminProductForm.tsx (Tabs, SEO, Images).
- [x] Frontend: AdminInventory.tsx (Blinkit-style batches).

## Phase D - G
Pending.
