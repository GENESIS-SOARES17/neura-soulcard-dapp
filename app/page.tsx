'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  
  // Estados para inputs e tema
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cardImage, setCardImage] = useState('/theme-blue.png');

  // Configurações Neura
  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';
  const EXPLORER_URL = 'https://testnet.explorer.neuraprotocol.io';

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Monitor de Status e Erros (RPC Fix)
  useEffect(() => {
    if (isPending) toast.loading('Check your wallet (OKX/Tally/MetaMask)...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming on Neura Testnet...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Minted Successfully! 🎉', { id: 'mint' });
    if (error) {
      console.error("RPC Error Details:", error);
      toast.error('RPC Error: Reset your wallet account and check Neura balance.', { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

  // Gerador de Bio IA
  const generateAIBio = async () => {
    if (!twitter) { toast.error('Enter Twitter handle first!'); return; }
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-bio', { method: 'POST', body: JSON.stringify({ twitter }) });
      const data = await response.json();
      if (data.bio) { setBio(data.bio); toast.success('AI Bio Ready!'); }
    } catch (err) { toast.error('AI generation failed.'); } finally { setGenerating(false); }
  };

  // Função de Mint com Gas Blindado
  const handleMint = () => {
    if (!twitter || !discord) { toast.error('Please fill in all fields!'); return; }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
      // Forçamos 3 milhões de gas para evitar rejeição do RPC
      gas: 3000000n, 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* COLUNA 1: FORMULÁRIO (ESQUERDA) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <img src="/logo ankr.png" alt="Ankr" className="h-10 w-auto object-contain" />
              <img src="/logo neura 1.png" alt="Neura" className="h-10 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-black text-center text-slate-900 tracking-tighter uppercase italic">
              NEURA SOULCARD
            </h1>

            <div className="flex justify-center border-b pb-6">
              <ConnectKitButton />
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Twitter Handle</label>
                  <input placeholder="@username" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setTwitter(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discord ID</label>
                  <input placeholder="name#0000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setDiscord(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select NFT Theme</label>
                  <div className="flex gap-4">
                    <button onClick={() => setCardImage('/theme-blue.png')} className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-blue.png' ? 'border-blue-600 scale-110' : 'border-transparent opacity-50'}`}><img src="/theme-blue.png" className="w-full h-full object-cover" /></button>
                    <button onClick={() => setCardImage('/theme-green.png')} className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-green.png' ? 'border-green-500 scale-110' : 'border-transparent opacity-50'}`}><img src="/theme-green.png" className="w-full h-full object-cover" /></button>
                    <button onClick={() => setCardImage('/theme-dark.png')} className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-dark.png' ? 'border-black scale-110' : 'border-transparent opacity-50'}`}><img src="/theme-dark.png" className="w-full h-full object-cover" /></button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Bio</label>
                    <button onClick={generateAIBio} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all">
                      {generating ? '⌛...' : '✨ GENERATE WITH AI'}
                    </button>
                  </div>
                  <textarea value={bio} placeholder="Write your story..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px] resize-none" onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 italic text-slate-400 text-sm tracking-tight">Connect your wallet (OKX, Tally, or MetaMask) to begin.</div>
            )}
          </div>

          {isConnected && (
            <button onClick={handleMint} disabled={isPending || isConfirming} className="w-full py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl uppercase tracking-[0.2em] transition-all active:scale-95">
              {isPending || isConfirming ? 'Processing...' : 'MINT SOULCARD'}
            </button>
          )}
        </div>

        {/* COLUNA 2: PREVIEW DO NFT (DIREITA) */}
        <div className="hidden lg:flex items-center justify-center p-8 bg-slate-200/40 rounded-[2.5rem] border-2 border-dashed border-slate-300 h-full min-h-[550px]">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-700 transform hover:scale-105">
            <img src={cardImage} alt="NFT Theme" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white text-left">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-black italic tracking-tighter">SOULCARD GENESIS</h2>
                <img src="/logo neura 1.png" className="h-6 w-auto brightness-0 invert opacity-60" />
              </div>
              <div className="space-y-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 flex items-center justify-center text-4xl font-black shadow-inner italic">
                  {twitter ? twitter[1]?.toUpperCase() : 'N'}
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-3xl font-black truncate tracking-tight uppercase italic">{twitter || '@YourProfile'}</h3>
                  <p className="text-lg font-bold text-white/70">{discord || 'name#0000'}</p>
                </div>
                <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-xs leading-relaxed font-medium line-clamp-4 italic">
                    "{bio || "Write your story or use AI... Your journey on Neura Network starts with this unique SoulCard Genesis Edition."}"
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest italic">Neura Testnet</span>
                <div className="px-4 py-1.5 bg-white text-blue-600 rounded-full text-[10px] font-black shadow-lg uppercase">Verified NFT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">Powered by Ankr & Neura</footer>
    </main>
  );
}