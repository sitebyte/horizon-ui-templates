# Round 2: What the Drawio Diagram Teaches Us

**Orchestrated by:** Tony Stark
**Panel:** Visual Designer, Support User (persona), Integration Engineer (persona)
**Date:** 4 May 2026

---

## Why The User's Diagram Works

Looking at the drawio image, a non-technical person can understand the EOS landscape in 30 seconds. Here's why:

### 1. It Reads Like a Sentence
"DQ Prices sends Price Ingress to EOS. ICE goes through KTP and Shovel to EOS. EOS sends Trade/Recap data to Pioneer. EOS sends Settlements to SAP."

Every flow has a label. Every label is a sentence fragment. Together they form a paragraph that describes the entire integration landscape. Our v28 has lines but no words — it's like a sentence without verbs.

### 2. The Centre Is Obvious
EOS is a big blue box in the middle. You can't miss it. Everything else orbits around it. RabbitMQ sits above/beside it as the postal service. This is the solar system model — sun in the middle, planets around it.

### 3. Different Things Look Different
- Clouds (DQ Prices, ICE) = external/internet
- Small coloured rectangles (Glint modules) = integration components
- Big blue rounded box (EOS) = the core system
- RabbitMQ bunny icon = the message broker
- Pink blob (Pioneer) = destination system
- Document icons = file outputs

You don't need to read labels to know WHAT TYPE of thing you're looking at.

### 4. Annotations Explain Context
"Spanish gas trade data flow" — this isn't just a label on a line, it's a sticky note explaining WHY this flow exists. "Port Distance data pull (manual)" tells you this isn't automated. "Invoices saved as PDF" tells you the output format.

### 5. Directionality Is Clear
Arrows show which way data flows. Bidirectional arrows (DQ Prices ←→ EOS) show two-way communication. One-way arrows show push/pull relationships.

---

## The Three Views We Should Build

### View A: "The Map" (Default)
Faithful recreation of the drawio diagram as an interactive web page. Same layout, same shapes, same labels, same annotations. But alive — nodes glow by health status, flow lines animate to show message traffic, clicking anything reveals detail.

**This is the support user's HOME view.** They open this page and immediately see the landscape. A red glow on a node means something's wrong. A thick line means high traffic. A label explains what's flowing.

**Key features:**
- Every flow line has a text label (the drawio labels verbatim)
- Annotations float near relevant components
- EOS is LARGE (takes up 40% of the centre)
- RabbitMQ is medium, positioned as the hub between EOS and modules
- External systems are clouds on the left edge
- Destinations are distinct shapes on the right
- Click any node → sidebar panel shows details + recent messages
- Click any flow line → highlights the path and shows messages on that route
- Hover annotations → expand with more detail

### View B: "The Flow Tracer"
For when support needs to trace a specific message. Search by correlation ID, see the message's journey animated through the topology map.

**This is the detective view.** Type a correlation ID and watch the message travel through the diagram — lighting up each node it touched, showing timestamps, revealing the JSON payload at each hop.

**Key features:**
- Search input for correlation ID at the top
- The topology map dims except for the traced path
- Animated "particle" follows the message path node-to-node
- Each node on the path shows a timestamp + status (delivered/failed)
- Click any node on the path to see the message payload at that point
- Timeline bar at bottom showing the message's journey chronologically

### View C: "The Dashboard"
For ongoing monitoring. Live stats overlaid on a simplified topology.

**This is the ops view.** Compact, numbers-focused, updating in real-time (simulated).

**Key features:**
- Simplified topology (fewer visual details, more numbers)
- Each node shows: messages/hr, avg latency, error rate
- Flow lines show throughput (thickness = volume)
- Alert badges on nodes with issues
- Summary KPIs across the top
- Auto-refreshing (simulated with setInterval)

---

## Implementation Approach

All three views share the same underlying topology data structure. A tab bar at the top switches between them. The topology layout is defined once (node positions, flow connections) and rendered differently per view.

```javascript
var TOPOLOGY = {
  nodes: [
    { id: 'eos', label: 'EOS', type: 'core', x: 50, y: 50, size: 'xl' },
    { id: 'rabbitmq', label: 'RabbitMQ', type: 'broker', x: 50, y: 25, size: 'lg' },
    { id: 'dq-prices', label: 'DQ Prices', type: 'external', x: 5, y: 10, size: 'md' },
    // ... etc
  ],
  flows: [
    { from: 'dq-prices', to: 'eos', label: 'Price Ingress', bidirectional: true },
    { from: 'ice', to: 'ktp', label: 'Trade Ingress' },
    { from: 'ktp', to: 'shovel', label: '' },
    { from: 'shovel', to: 'rabbitmq', label: '' },
    { from: 'rabbitmq', to: 'glint-ice', label: '' },
    { from: 'glint-ice', to: 'eos', label: '' },
    // ... etc
  ],
  annotations: [
    { near: 'glint-endur', text: 'Spanish gas trade data flow' },
    { near: 'a2kvan', text: 'Port Distance data pull (manual)' },
    { near: 'ax-cloud', text: 'Invoices saved as PDF' },
    { near: 'sap', text: 'SAP Document via download' },
  ]
};
```
