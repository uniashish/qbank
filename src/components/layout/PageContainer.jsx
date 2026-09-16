function PageContainer({ children, className = "", size = "default" }) {
  return (
    <div
      className={["page-container", `page-container--${size}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default PageContainer;
