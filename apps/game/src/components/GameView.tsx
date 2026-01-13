import type { Realm } from '@realm-walker/shared';
import type React from 'react';
import { DioramaRenderer } from './DioramaRenderer';

interface GameViewProps {
  realm: Realm;
}

export const GameView: React.FC<GameViewProps> = ({ realm }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <DioramaRenderer />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between">
        <div className="bg-[#2c1a0b]/90 border-b-2 border-[#d35400] p-4 text-[#f3e5ab] rounded shadow-lg pointer-events-auto">
          <h2 className="fantasy-title text-xl">{realm.age.name}</h2>
          <p className="text-sm italic">{realm.age.theme}</p>
        </div>

        <div className="bg-[#2c1a0b]/90 border-b-2 border-[#d35400] p-4 text-[#f3e5ab] text-right rounded shadow-lg pointer-events-auto">
          <div className="text-xs uppercase opacity-70">Classes</div>
          <div className="font-bold">{realm.classes.map((c) => c.name).join(', ')}</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none flex items-end justify-between">
        <div className="max-w-md bg-[#fdf6e3]/90 border-2 border-[#5d4037] p-4 rounded shadow-lg pointer-events-auto h-40 overflow-y-auto">
          <div className="text-sm font-bold text-[#8b4513] mb-1">REALM LOG</div>
          <div className="text-sm text-[#2c1a0b] opacity-80">{realm.age.description}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            const _data = btoa(JSON.stringify(realm));
            const url = `https://github.com/arcade-center/realm-walker/issues/new?title=Realm+Contribution:+${realm.age.name}&body=Please+review+my+generated+realm:%0A%0A\`\`\`json%0A${JSON.stringify(realm, null, 2)}%0A\`\`\``;
            window.open(url, '_blank');
          }}
          className="bg-[#27ae60] text-white px-6 py-3 rounded border-2 border-[#1e8449] shadow-lg pointer-events-auto fantasy-title hover:brightness-110 active:translate-y-1"
        >
          Submit Realm
        </button>
      </div>
    </div>
  );
};
