import { useState } from "react";
import TransactionAnalysis from "./components/TransactionAnalysis";
import CustomerAnalysis from "./components/CustomerAnalysis";
import StoreAnalysis from "./components/StoresAnalysis";
import "./App.css";

const ANALYSES = [
  {
    id: "transactions",
    title: "Transactions",
    description: "Transaction mix, revenue trends and top performers.",
    Component: TransactionAnalysis,
  },
  {
    id: "customers",
    title: "Customers",
    description: "Who is buying.",
    Component: CustomerAnalysis,
  },
  {
    id: "stores",
    title: "Stores",
    description: "How stores perform.",
    Component: StoreAnalysis,
  },
];

export default function App() {
  const [activeId, setActiveId] = useState(ANALYSES[0].id);
  const active = ANALYSES.find((a) => a.id === activeId);
  const { Component } = active;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__brand">Fashion Retail</div>

        <nav className="sidebar__nav" aria-label="Analyses">
          {ANALYSES.map(({ id, title }) => (
            <button
              key={id}
              type="button"
              className={id === activeId ? "nav-item is-active" : "nav-item"}
              aria-current={id === activeId ? "page" : undefined}
              onClick={() => setActiveId(id)}
            >
              {title}
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-content">
        <header className="app-header">
          <h1>Global Fashion Retail Dashboard</h1>
        </header>

        <main className="app-main">
          <Component />
        </main>
      </div>
    </div>
  );
}