# Writing a Unit test

## What are we testing (the contract)
From the code, the component:

Renders a tablist with 4 tabs: Home, Query Params, Headers, Notes.

Highlights the active tab (driven by the activeTab prop) and shows only its panel.

Calls setActiveTab(id) when a tab is clicked.

For the “Query Params” tab, it passes onParamChange down to ParamsTab.

Uses ARIA roles/attributes correctly (role="tablist", role="tab", role="tabpanel", aria-selected, aria-controls, aria-labelledby).

These become our test goals.

## Strategy: what to isolate vs. what to mock?
You don’t need to pull in the real ParamsTab, HeaderTab, NotesTab to test tab logic.

Instead, mock those children with simple placeholders so you can check:

That they render when their tab is active

That onParamChange is forwarded to ParamsTab

Mocking gives you focused tests on the Tab behavior.

## Putting it together (mental checklist)

Smoke: renders tablist + all tabs by role/name

Active wiring: active tab has aria-selected=true; exactly 1 tabpanel; content matches the active tab

Interaction: click a tab → setActiveTab called with id

Prop forwarding: when activeTab="params", ParamsTab gets onParamChange

A11y glue: tabpanel.aria-labelledby points to the active tab’s id

Fallback: unknown activeTab → Home is active
