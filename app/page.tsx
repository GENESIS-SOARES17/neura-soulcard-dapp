'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  
  // States para os dados do usuário
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // State para a imagem do NFT (começa com a azul)
  const [cardImage, setCardImage] = useState('/theme-blue.png');

  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';
  const EXPLORER_URL = 'https://testnet.explorer.neuraprotocol.io';

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Notificações de Status
  useEffect(() => {
    if (isPending) toast.loading('Waiting for wallet approval...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming on Neura Network...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Minted Successfully! 🎉', { id: 'mint' });
    if (error) {
      toast.error('RPC Error: Check your balance and network settings.', { id: 'mint' });
      console.error(error);
    }
  }, [isPending, isConfirming, isSuccess, error]);

  // Função de Gerar Bio com IA
  const generateAIBio = async () => {
    if (!twitter) {
      toast.error('Please enter your Twitter handle first!');
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        body: JSON.stringify({ twitter }),
      });
      const data = await response.json();
      if (data.bio) {
        setBio(data.bio);
        toast.success('AI Generated your bio!');
      }
    } catch (err) {
      toast.error('AI generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  // Função de Mint
  const handleMint = () => {
    if (!twitter || !discord) {
      toast.error('Please fill in all fields!');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
      gas: 1000000n, 
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100">
      <Toaster position="top-center" />
      
      {/* Layout em Grid: 2 Colunas no Desktop, 1 no Mobile */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* COLUNA 1: FORMULÁRIO (ESQUERDA) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-200 h-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <img src="/logo ankr.png" alt="Ankr" className="h-8 w-auto" />
              <img src="/logo neura 1.png" alt="Neura" className="h-8 w-auto" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic text-center">
              SoulCard <span className="text-[#05d5a1]">Genesis</span>
            </h1>

            <div className="flex justify-center border-b pb-4">
              <ConnectKitButton />
            </div>

            {isConnected ? (
              <div className="space-y-4">
                {/* Input Twitter */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Twitter Handle</label>
                  <input 
                    placeholder="@username" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0052ff] transition-all"
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>

                {/* Input Discord */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discord Username</label>
                  <input 
                    placeholder="user#0000" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0052ff] transition-all"
                    onChange={(e) => setDiscord(e.target.value)}
                  />
                </div>
                
                {/* SELEÇÃO DE TEMA (IMAGENS) */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose NFT Theme</label>
                  <div className="flex gap-4 mt-2">
                    <button onClick={() => setCardImage('/theme-blue.png')} className={`group relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-blue.png' ? 'border-[#0052ff] scale-110 shadow-lg' : 'border-transparent opacity-60'}`}>
                      <img src="/theme-blue.png" className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => setCardImage('/theme-green.png')} className={`group relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-green.png' ? 'border-[#05d5a1] scale-110 shadow-lg' : 'border-transparent opacity-60'}`}>
                      <img src="/theme-green.png" className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => setCardImage('/theme-dark.png')} className={`group relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${cardImage === '/theme-dark.png' ? 'border-slate-800 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}>
                      <img src="/theme-dark.png" className="w-full h-full object-cover" />
                    </button>
                  </div>
                </div>

                {/* Textarea Bio */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</label>
                    <button 
                      onClick={generateAIBio}
                      className="text-[10px] font-black text-[#05d5a1] bg-[#05d5a110] px-3 py-1.5 rounded-full hover:bg-[#05d5a120] transition-all"
                    >
                      {generating ? '⌛ THINKING...' : '✨ AI GENERATE'}
                    </button>
                  </div>
                  <textarea 
                    value={bio}
                    placeholder="Tell your story..." 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#0052ff] min-h-[100px] resize-none transition-all"
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-slate-400 text-sm italic">Please connect your wallet to start.</p>
            )}
          </div>

          {isConnected && (
            <button 
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className={`w-full py-5 rounded-2xl font-black text-white tracking-[0.2em] uppercase transition-all shadow-xl ${
                isPending || isConfirming ? 'bg-slate-300' : 'bg-[#0052ff] hover:bg-[#0044d6] active:scale-95'
              }`}
            >
              {isPending || isConfirming ? 'Processing...' : 'Mint SoulCard'}
            </button>
          )}
        </div>

        {/* COLUNA 2: PREVIEW DO NFT (DIREITA) */}
        <div className="flex items-center justify-center p-4 lg:p-12 bg-slate-200/30 rounded-[2.5rem] border-2 border-dashed border-slate-300 h-full min-h-[550px]">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-700">
            
            {/* IMAGEM DE FUNDO DO NFT QUE MUDA COM O CLICK */}
            <img src={cardImage} alt="NFT Theme" className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Overlay Escuro para Legibilidade */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

            {/* Conteúdo do NFT */}
            <div className="relative z-10 p-8 flex flex-col justify-between h-full text-white">
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.3em] text-white/70 uppercase">SoulCard Series</p>
                  <h2 className="text-xl font-black tracking-tighter">GENESIS EDITION</h2>
                </div>
                <img src="/logo neura 1.png" className="h-6 w-auto brightness-0 invert opacity-60" />
              </div>

              <div className="space-y-6">
                {/* Avatar Simbolizado */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 flex items-center justify-center text-4xl font-black shadow-inner">
                  {twitter ? twitter[1]?.toUpperCase() : 'N'}
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black truncate tracking-tight">{twitter || '@YourTwitter'}</h3>
                  <p className="text-lg font-bold text-white/80">{discord || 'Discord#0000'}</p>
                </div>

                <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-xs leading-relaxed font-medium line-clamp-4 italic">
                    "{bio || "Your story will be written here. Use the AI to generate a cool bio or write your own journey on Neura Network..."}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-2">
                <div className="space-y-1">
                  <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">Neura Testnet</p>
                  <p className="text-[10px] font-mono font-bold">
                    ID: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-white text-[#0052ff] rounded-full text-[10px] font-black shadow-lg">
                  VERIFIED NFT
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <footer className="mt-8 text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">
        Powered by Ankr & Neura Network
      </footer>
    </main>
  );
}