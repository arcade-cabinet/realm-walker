import { useState } from 'react';
import { GameView } from './components/GameView';
import { MainMenu } from './components/MainMenu';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [realmData, setRealmData] = useState<any>(null);

  const handleStartGame = (data: any) => {
    setRealmData(data);
    setGameState('playing');
  };

  return (
    <div className="min-h-screen">
      {gameState === 'menu' ? (
        <MainMenu onStart={handleStartGame} />
      ) : (
        <GameView realm={realmData} />
      )}
    </div>
  );
}

export default App;
