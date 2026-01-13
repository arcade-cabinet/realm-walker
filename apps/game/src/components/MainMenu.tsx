import { GeminiAdapter } from '@realm-walker/looms';
import { Realm, RealmSchema } from '@realm-walker/shared';
import type React from 'react';
import { useState } from 'react';

interface MainMenuProps {
    onStart: (realmData: Realm) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    const [apiKey, setApiKey] = useState('');
    const [seed, setSeed] = useState('Floating-Crystal-Sanctuary');
    const [status, setStatus] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleForge = async () => {
        if (!apiKey) {
            setStatus('API Key Required');
            return;
        }

        setIsGenerating(true);
        setStatus('Consulting the Archives...');

        try {
            const adapter = new GeminiAdapter(apiKey);
            const prompt = `
        Generate complete game content for the "ancient" age of RealmWalker.
        Theme: ${seed.replace(/-/g, ' ')}
        Requirements: High fantasy, balanced gameplay, otter civilizations.
      `;

            const realm = await adapter.generate<Realm>(prompt, { schema: RealmSchema as any });
            onStart(realm);
        } catch (error) {
            console.error(error);
            setStatus('Forge Failed. Check Key/Seed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[#2c1a0b]">
            <div className="w-full max-w-md p-8 bg-[#fdf6e3] border-4 border-double border-[#5d4037] rounded-lg shadow-2xl">
                <h1 className="fantasy-title text-4xl text-center text-[#d35400] mb-2 uppercase font-bold">
                    RealmWalker
                </h1>
                <p className="fantasy-font text-center text-[#5d4037] mb-8 text-lg">
                    Infinite Worlds. Pre-Rendered. Real.
                </p>

                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="api-key"
                            className="block text-xs font-bold uppercase text-[#8b4513] mb-2"
                        >
                            Gemini API Key
                        </label>
                        <input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your API key here..."
                            className="w-full p-3 border border-[#5d4037] rounded bg-white text-black text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="seed" className="block text-xs font-bold uppercase text-[#8b4513] mb-2">
                            Initial World Seed
                        </label>
                        <input
                            id="seed"
                            type="text"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            className="w-full p-3 border border-[#5d4037] rounded bg-white text-black font-bold"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleForge}
                        disabled={isGenerating}
                        className="w-full py-4 bg-gradient-to-b from-[#d35400] to-[#a04000] text-white font-bold uppercase tracking-widest rounded border-2 border-[#5d4037] shadow-[0_4px_0_#5d4037] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed fantasy-title"
                    >
                        {isGenerating ? 'Forging...' : 'Forge World'}
                    </button>

                    {status && (
                        <p className="text-center font-bold text-[#d35400] h-6 animate-pulse">{status}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
