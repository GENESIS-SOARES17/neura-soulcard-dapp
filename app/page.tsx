'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  
  // States para os dados
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cardImage, setCardImage] = useState('/theme-blue.png');

  // Configurações do Contrato e Rede
  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';
  const EXPLORER_URL = 'https://testnet.explorer.neuraprotocol.io';

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Monitor de Erros e Sucesso
  useEffect(() => {
    if (isPending) toast.loading('Approve in your wallet...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming on Neura Testnet...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Minted! 🎉', { id: 'mint' });
    if (error) {
      console.error("RPC Error Details:", error);
      toast.error('RPC Error: Try to reset your MetaMask account or check gas.', { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

  // Gerador de Bio IA
  const generateAIBio = async () => {
    if (!twitter) { toast.error('Enter Twitter first!'); return; }
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-bio', { method: 'POST', body: JSON.stringify({ twitter }) });
      const data = await response.json();
      if (data.bio) { setBio(data.bio); toast.success('AI Bio Generated!'); }
    } catch (err) { toast.error('AI Failed.'); } finally { setGenerating(false); }
  };

  // FUNÇÃO MINT COM GAS FORÇADO (CORREÇÃO RPC)
  const handleMint = () => {
    if (!twitter || !discord) { toast.error('Fill all fields!'); return; }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
      // Aumentamos o gas para garantir que a transação não falhe no RPC
      gas: 2000000n, 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* COLUNA 1: FORMULÁRIO (ESQUERDA) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            {/* LOGOS TOP (Baseado na sua imagem) */}
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
                <input placeholder="Twitter @username" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" onChange={(e) => setTwitter(e.target.value)} />
                <input placeholder="Discord Username" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" onChange={(e) => setDiscord(e.target.value)} />
                
                {/* Seleção de Tema */}
                <div className="flex gap-4 py-2">
                  <button onClick={() => setCardImage('/theme-blue.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-blue.png' ? 'border-blue-600' : 'border-transparent'}`}><img src="/theme-blue.png" className="w-full h-full object-cover" /></button>
                  <button onClick={() => setCardImage('/theme-green.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-green.png' ? 'border-green-500' : 'border-transparent'}`}><img src="/theme-green.png" className="w-full h-full object-cover" /></button>
                  <button onClick={() => setCardImage('/theme-dark.png')} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${cardImage === '/theme-dark.png' ? 'border-black' : 'border-transparent'}`}><img src="/theme-dark.png" className="w-full h-full object-cover" /></button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Bio</label>
                    <button onClick={generateAIBio} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{generating ? 'Thinking...' : '✨ AI Generate'}</button>
                  </div>
                  <textarea value={bio} placeholder="Your story..." className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px] resize-none" onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 italic text-slate-400">Connect wallet to start</div>
            )}
          </div>

          <button onClick={handleMint} disabled={isPending || isConfirming} className="w-full py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl uppercase tracking-widest transition-all">
            {isPending || isConfirming ? 'Minting...' : 'MINT SOULCARD'}
          </button>
        </div>

        {/* COLUNA 2: PREVIEW DO NFT (DIREITA) */}
        <div className="hidden lg:flex items-center justify-center bg-slate-200/50 rounded-[2.5rem] border-2 border-dashed border-slate-300 h-full min-h-[500px]">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
            <img src={cardImage} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
            <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-black italic">SOULCARD</h2>
                <img src="/logo neura 1.png" className="h-6 w-auto brightness-0 invert" />
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black">
                  {twitter ? twitter[1]?.toUpperCase() : 'N'}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{twitter || '@YourTwitter'}</h3>
                  <p className="font-bold opacity-70">{discord || 'Discord#0000'}</p>
                </div>
                <p className="text-xs bg-black/20 p-3 rounded-xl backdrop-blur-sm line-clamp-3">
                  {bio || "Your journey on Neura starts here..."}
                </p>
              </div>
              <div className="flex justify-between items-end border-t border-white/20 pt-4 text-[10px] font-black">
                <span>NEURA TESTNET</span>
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full uppercase">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}