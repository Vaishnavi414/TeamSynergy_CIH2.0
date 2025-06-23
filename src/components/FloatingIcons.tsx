
import React from 'react';

const FloatingIcons = () => {
  const icons = [
    { icon: '₿', delay: '0s', top: '10%', left: '10%' },
    { icon: 'Ξ', delay: '2s', top: '20%', left: '80%' },
    { icon: '◎', delay: '1s', top: '70%', left: '20%' },
    { icon: 'Ł', delay: '3s', top: '80%', left: '70%' },
    { icon: '₳', delay: '4s', top: '30%', left: '60%' },
    { icon: 'Ð', delay: '2.5s', top: '60%', left: '40%' },
    { icon: '₱', delay: '1.5s', top: '50%', left: '90%' },
    { icon: '₮', delay: '3.5s', top: '40%', left: '5%' },
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => (
        <div
          key={index}
          className="absolute text-3xl text-white/10 animate-float"
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default FloatingIcons;
