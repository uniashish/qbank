function getInitials(name, email) {
  const source = name?.trim() || email?.split("@")[0] || "QBank User";
  const parts = source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]);

  if (parts.length >= 2) {
    return `${parts[0]}${parts[1]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function Avatar({ email, name, photoURL, size = "md" }) {
  const initials = getInitials(name, email);
  const label = name || email || "QBank user";
  const classes = ["avatar", `avatar--${size}`].join(" ");

  if (photoURL) {
    return (
      <span className={classes}>
        <img alt={`${label} avatar`} src={photoURL} />
      </span>
    );
  }

  return (
    <span aria-label={`${label} avatar`} className={classes} role="img">
      {initials}
    </span>
  );
}

export default Avatar;
