export default function MachineCollage() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0 rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/files/TS3000SPS-MT.jpg" 
          alt="TS3000SPS-MT" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/files/TS-3000SPS-TP.jpg" 
          alt="TS-3000SPS-TP" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/files/TS-3000MR-H.jpg" 
          alt="TS-3000MR-H" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative overflow-hidden">
        <img 
          src="https://cdn.poehali.dev/files/TS-3000SPS-H.jpg" 
          alt="TS-3000SPS-H" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
