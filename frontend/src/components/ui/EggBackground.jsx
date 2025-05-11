const EggBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="egg-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {/* Белок */}
          <div className="egg-white" />
          {/* Желток */}
          <div className="egg-yolk" />
        </div>
      ))}
    </div>
  );
};

export default EggBackground; 