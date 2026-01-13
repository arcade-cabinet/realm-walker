import type { Realm } from '@realm-walker/shared';
import { useState } from 'react';
import { GameView } from './components/GameView';
import { MainMenu } from './components/MainMenu';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [realmData, setRealmData] = useState<Realm | null>(null);

  const handleStartGame = (data: Realm) => {
    setRealmData(data);
    setGameState('playing');
  };

  return (
    <div className="min-h-screen">
      {gameState === 'menu' ? (
        <MainMenu onStart={handleStartGame} />
      ) : (
        realmData && <GameView realm={realmData} />
      )}
    </div>
  );
}

export default App;
