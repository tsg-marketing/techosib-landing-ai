export default function MachineCollage() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <img 
        src="/img/hero-robo-ms.webp" 
        alt="Паллетообмотчик ROBO-MS"
        width={900}
        height={700}
        fetchPriority="high"
        decoding="async"
        className="max-w-full max-h-full object-contain"
        style={{ maxHeight: '350px', marginTop: '40px' }}
      />
    </div>
  );
}