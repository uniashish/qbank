function PageContainer({ children, size = "default" }) {
  return (
    <div className={`page-container page-container--${size}`}>{children}</div>
  );
}

export default PageContainer;
