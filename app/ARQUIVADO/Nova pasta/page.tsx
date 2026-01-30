'use client';
import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';

export default function Home() {
  const { isConnected } = useAccount();
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();

  const handleMint = () => {
    // ABI simplificada para a função de mint do seu contrato
    const abi = parseAbi(['function mint(string memory userData) external']);
    
    // Organiza os dados para o atributo "Data" do seu NFT
    const userData = `twitter:@${twitter}|discord:${discord}|bio:${bio}`;

    writeContract({
      address: '0xb9829f7661c8e3d088953eEa069c0b44FC20B484',
      abi,
      functionName: 'mint',
      args: [userData],
    });
  };

  return (
    <main className="min-h-screen bg-[#0f0c29] text-white flex flex-col items-center justify-center p-6">
      {/* Botão de Conectar no Topo */}
      <div className="absolute top-8 right-8">
        <ConnectKitButton />
      </div>

      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-6 text-center">
          Neura SoulCard
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-emerald-400 font-bold mb-2">Twitter</label>
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500"
              placeholder="@seu_user"
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-emerald-400 font-bold mb-2">Discord</label>
            <input 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500"
              placeholder="user#0000"
              onChange={(e) => setDiscord(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-emerald-400 font-bold mb-2">Bio</label>
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 h-20"
              placeholder="Developer, Artist..."
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button 
            onClick={handleMint}
            disabled={!isConnected || isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPending ? 'Confirmando na Carteira...' : 'MINT SOULCARD'}
          </button>

          {hash && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-center">
              <p className="text-emerald-400 text-sm">Sucesso! Transação enviada.</p>
              <a 
                href={`https://explorer.neura.io/tx/${hash}`} 
                target="_blank" 
                className="text-xs text-blue-400 underline"
              >
                Ver no Explorer
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}