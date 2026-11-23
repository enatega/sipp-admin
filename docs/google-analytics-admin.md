# Google Analytics supporting admin control

Admin staff actions are never sent to customer analytics. The admin has one analytics-related control: marking a customer as a **test account**.

On a customer's detail page there is an "Analytics tracking" panel with a status badge ("Included in analytics" or "Excluded from analytics") and a "Test or staff account" switch (needs the `update_user_status` permission; platform admin/staff only). A flagged customer sends **no** analytics events from the web or the app, and their orders never produce a Purchase. Use it for team members' own accounts once analytics is live.

- It calls `PATCH /user-management/:customerId/measurement-test-account` with `{is_test:boolean}`, using the customer UUID returned by the detail endpoint (not the nested auth user ID). The change is audit-logged.
- It affects only later activity. Earlier paid-order snapshots are unchanged.
- To **test** analytics yourself (debug mode), use an account that is **not** flagged, or nothing will be sent.

Revenue and funnel numbers are not shown in this admin. They live in Google Analytics (and Looker Studio if you build one). The admin's own order/sales views remain the source of truth for revenue.

Manual check: open a customer, switch it on, save, reopen and confirm it persists. Confirm a user lacking `update_user_status` sees the switch disabled. Confirm admin pages never load the customer GTM collector.
