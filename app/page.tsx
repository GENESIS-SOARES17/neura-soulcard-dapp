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

  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';
  const EXPLORER_URL = 'https://testnet.explorer.neuraprotocol.io';

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isPending) toast.loading('Waiting for wallet approval...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming on Neura Network...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Minted Successfully! 🎉', { id: 'mint' });
    if (error) {
      toast.error('RPC Error: Check your balance and network settings.', { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc]">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 space-y-6 border border-slate-100">
        
        {/* LOGOS SECTION - Alinhamento Premium */}
        <div className="flex justify-between items-center mb-4 px-2">
          <img src="/logo ankr.png" alt="Ankr Logo" className="h-10 w-auto object-contain hover:scale-110 transition-transform" />
          <div className="h-8 w-[1px] bg-slate-200"></div> {/* Separador sutil */}
          <img src="/logo neura 1.png" alt="Neura Logo" className="h-10 w-auto object-contain hover:scale-110 transition-transform" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            SoulCard <span className="text-[#05d5a1]">Genesis</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Identity on Neura</p>
        </div>
        
        <div className="flex justify-center border-b border-slate-50 pb-6">
          <ConnectKitButton />
        </div>

        {isConnected ? (
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Twitter Handle</label>
              <input 
                placeholder="@username" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0052ff] focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Discord Username</label>
              <input 
                placeholder="user#0000" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0052ff] focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                onChange={(e) => setDiscord(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About Me</label>
                <button 
                  onClick={generateAIBio}
                  disabled={generating}
                  className="text-[10px] font-black text-[#05d5a1] bg-[#05d5a115] px-4 py-2 rounded-full hover:bg-[#05d5a125] transition-all flex items-center gap-1"
                >
                  {generating ? '⌛ THINKING...' : '✨ AI GENERATE'}
                </button>
              </div>
              <textarea 
                value={bio}
                placeholder="Tell your story to the blockchain..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0052ff] focus:border-transparent outline-none min-h-[110px] transition-all resize-none"
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            
            {/* Botão de Mint com o Azul da Neura */}
            <button 
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className={`w-full py-5 rounded-2xl font-black text-white tracking-[0.15em] transition-all shadow-lg uppercase ${
                isPending || isConfirming 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-[#0052ff] hover:bg-[#0044d6] hover:shadow-[#0052ff30] active:scale-95'
              }`}
            >
              {isPending || isConfirming ? 'Minting in Progress...' : 'Mint SoulCard'}
            </button>
            
            {isSuccess && hash && (
              <div className="text-center pt-2 animate-bounce">
                <a 
                  href={`${EXPLORER_URL}/tx/${hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#05d5a1] font-black hover:underline underline-offset-4"
                >
                  VIEW ON EXPLORER →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
               <span className="text-2xl">🔗</span>
            </div>
            <p className="text-slate-500 font-bold text-sm tracking-tight">Connect your wallet to begin your journey.</p>
          </div>
        )}
      </div>
      
      <footer className="mt-8 flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
         <span className="text-[10px] font-black tracking-widest uppercase">Powered by</span>
         <div className="flex gap-3">
            <span className="text-[10px] font-bold text-[#0052ff]">NEURA</span>
            <span className="text-[10px] font-bold text-[#05d5a1]">ANKR</span>
         </div>
      </footer>
    </main>
  );
}