export default function AppLayout({ sidebar, children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">{sidebar}</aside>
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export function Button({ variant="primary", children, ...props }) {
  return (
    <button className={`btn ${variant}`} {...props}>
      {children}
    </button>
  );
}
