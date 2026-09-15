import StatCard from "./StatCard.jsx";

function StatsGrid({ stats }) {
  return (
    <section className="stats-grid" aria-label="Platform statistics">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  );
}

export default StatsGrid;
