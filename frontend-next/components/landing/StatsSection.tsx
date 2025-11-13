/**
 * StatsSection Component
 * 
 * Social proof section displaying 4 key metrics/statistics.
 * Features gradient text for numbers with labels below.
 */

export default function StatsSection() {
  const stats = [
    {
      value: "10K+",
      label: "Active Users",
      gradient: "from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400",
    },
    {
      value: "1M+",
      label: "Questions Answered",
      gradient: "from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
    },
    {
      value: "3",
      label: "AI Models",
      gradient: "from-pink-600 to-red-600 dark:from-pink-400 dark:to-red-400",
    },
    {
      value: "99.9%",
      label: "Uptime",
      gradient: "from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400",
    },
  ];

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-5xl font-bold bg-linear-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
