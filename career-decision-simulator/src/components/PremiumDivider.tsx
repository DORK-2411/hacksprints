export default function PremiumDivider() {
  return (
    <div 
      className="w-full px-4 sm:px-6 py-8 flex justify-center"
      style={{
        animation: 'fadeInDivider 300ms ease-out forwards',
        opacity: 0,
      }}
    >
      <div 
        className="h-[1px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(198, 161, 91, 0.25) 50%, transparent 100%)',
          boxShadow: '0 0 8px rgba(198, 161, 91, 0.15)', // subtle glow
        }}
      />
      <style>{`
        @keyframes fadeInDivider {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
