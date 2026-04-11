# Critical Node Atlas

An interactive map of the places and systems the modern world quietly depends on — and what happens when they break.

## What this is

Global trade, the internet, financial markets, and energy all flow through a surprisingly small number of bottlenecks. Some are geographic: ships must pass through a narrow strait, fiber cables surface at a handful of landing points. Others are institutional: one company controls access to a technology the whole world runs on. Both kinds are fragile, and both kinds have failed before.

The Critical Node Atlas lets you explore these chokepoints across five interconnected systems — maritime routes, undersea cables, financial infrastructure, technology, and energy. Click a node to see what breaks if it goes down, and follow the cascade to understand how a disruption in one system ripples into the others.

## Who benefits from this

**Journalists and researchers** investigating geopolitical risk, supply chain fragility, or infrastructure security will find a structured way to explore dependencies that are usually scattered across specialist reports and academic papers.

**Policy and security analysts** can use the scenario mode to reason through disruption chains — what happens downstream when a key node fails, and which nodes sit at the intersection of multiple critical systems.

**Students and curious people** who want to understand why the world is more brittle than it looks. The introductory framing and historical precedents attached to each node make it accessible without requiring prior expertise.

**Educators** teaching international relations, economic geography, or systems thinking can use the map as a visual anchor for discussions about interdependence and systemic risk.

## How to use it

- **Explore mode** — Browse all nodes on the map. Click any marker to read what it controls, its disruption effects, and any real historical events where it was tested.
- **Scenario mode** — Select a node to see which other nodes it cascades into. Arcs on the map show the connections; the panel walks through immediate effects and downstream failures.
- **Layer filters** — Toggle between maritime, cables, financial, tech, and energy systems. Use "Show only" on any layer to focus the map.
- **Search** — Find any node by name or country.

Shareable URLs — selecting a node or filtering layers updates the URL so you can link directly to a specific view.

## Running locally

```bash
npm install
npm run dev
```

Requires Node 18+.

## Stack

- React + TypeScript
- Vite
- Leaflet (via react-leaflet) for the map
- Zustand for state
