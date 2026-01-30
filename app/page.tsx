'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cardImage, setCardImage] = useState('/theme-blue.png');

  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';
  const EXPLORER_URL = 'https://testnet.explorer.neuraprotocol.io';

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isPending) toast.loading('Waiting for Wallet...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming on Neura...', { id: 'mint' });
    if (isSuccess) toast.success('SUCCESS! SoulCard Minted 🎉', { id: 'mint' });
    if (error) {
      console.error("RPC Error:", error);
      toast.error('RPC Error: Please Reset MetaMask and check balance.', { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

  const handleMint = () => {
    if (!twitter || !discord) { toast.error('Fill fields!'); return; }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
      // GAS FORÇADO PARA EVITAR ERRO DE RPC
      gas: 3000000n, 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Toaster position="top-center" />
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <img src="/logo ankr.png" alt="Ankr" className="h-10 w-auto" />
            <img src="/logo neura 1.png" alt="Neura" className="h-10 w-auto" />
          </div>
          <h1 className="text-3xl font-black text-center italic uppercase">NEURA SOULCARD</h1>
          <div className="flex justify-center border-b pb-6"><ConnectKitButton /></div>
          {isConnected && (
            <div className="space-y-4">
              <input placeholder="Twitter @handle" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={(e) => setTwitter(e.target.value)} />
              <input placeholder="Discord ID" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={(e) => setDiscord(e.target.value)} />
              <div className="flex gap-4">
                <button onClick={() => setCardImage('/theme-blue.png')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600"><img src="/theme-blue.png" className="w-full h-full object-cover" /></button>
                <button onClick={() => setCardImage('/theme-green.png')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500"><img src="/theme-green.png" className="w-full h-full object-cover" /></button>
                <button onClick={() => setCardImage('/theme-dark.png')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-black"><img src="/theme-dark.png" className="w-full h-full object-cover" /></button>
              </div>
              <textarea value={bio} placeholder="Bio..." className="w-full p-4 bg-slate-50 border rounded-2xl min-h-[100px]" onChange={(e) => setBio(e.target.value)} />
              <button onClick={handleMint} className="w-full py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 uppercase tracking-widest transition-all">
                {isPending || isConfirming ? 'PROCESSING...' : 'MINT SOULCARD'}
              </button>
            </div>
          )}
        </div>

        {/* LADO DIREITO: PREVIEW NFT */}
        <div className="hidden lg:flex items-center justify-center bg-slate-200/30 rounded-[2.5rem] p-4">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img src={cardImage} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
              <h2 className="text-xl font-black italic uppercase">SoulCard Genesis</h2>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl font-black">
                  {twitter ? twitter[1]?.toUpperCase() : 'N'}
                </div>
                <div>
                  <h3 className="text-2xl font-black truncate">{twitter || '@YourTwitter'}</h3>
                  <p className="font-bold opacity-70">{discord || 'Discord#0000'}</p>
                </div>
                <p className="text-xs bg-black/20 p-3 rounded-xl line-clamp-3">{bio || "Your story..."}</p>
              </div>
              <div className="border-t border-white/20 pt-4 text-[10px] font-black uppercase">Neura Network Verified</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}