'use client';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbi } from 'viem';
import { ConnectKitButton } from 'connectkit';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const { isConnected } = useAccount();
  
  // English UI State Management
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [bio, setBio] = useState('');
  const [generating, setGenerating] = useState(false);

  // YOUR ACTUAL CONTRACT ADDRESS FROM REMIX
  const CONTRACT_ADDRESS = '0xb9829f7661c8e3d088953eEa069c0b44FC20B484';

  // Blockchain interaction hooks
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Notifications for the user experience
  useEffect(() => {
    if (isPending) toast.loading('Waiting for wallet approval...', { id: 'mint' });
    if (isConfirming) toast.loading('Confirming transaction on Neura...', { id: 'mint' });
    if (isSuccess) toast.success('SoulCard Minted Successfully! 🎉', { id: 'mint' });
    if (error) {
      const msg = error.message.includes('User rejected') 
        ? 'Transaction rejected.' 
        : error.message.split('\n')[0];
      toast.error(`Error: ${msg}`, { id: 'mint' });
    }
  }, [isPending, isConfirming, isSuccess, error]);

  // AI Bio Generator Function
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

  // Function to execute the Mint
  const handleMint = () => {
    if (!twitter || !discord) {
      toast.error('Fields cannot be empty!');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(['function mintSoulCard(string twitter, string discord, string bio) public']),
      functionName: 'mintSoulCard',
      args: [twitter, discord, bio],
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-100">
        <h1 className="text-3xl font-black text-center text-slate-900 italic tracking-tighter">
          NEURA SOULCARD
        </h1>
        
        <div className="flex justify-center border-b pb-6">
          <ConnectKitButton />
        </div>

        {isConnected ? (
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Twitter Handle</label>
              <input 
                placeholder="@yourprofile" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Discord ID</label>
              <input 
                placeholder="name#0000" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setDiscord(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personal Bio</label>
                <button 
                  onClick={generateAIBio}
                  disabled={generating}
                  className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 uppercase transition-all"
                >
                  {generating ? '✨ Magic happening...' : '✨ Generate with AI'}
                </button>
              </div>
              <textarea 
                value={bio}
                placeholder="Write your story or use AI..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] transition-all"
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleMint}
              disabled={isPending || isConfirming}
              className={`w-full py-5 rounded-2xl font-black text-white tracking-widest transition-all shadow-xl ${
                isPending || isConfirming 
                ? 'bg-slate-300 cursor-not-allowed scale-95' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100'
              }`}
            >
              {isPending || isConfirming ? 'PROCESSING...' : 'MINT SOULCARD'}
            </button>
            
            {isSuccess && hash && (
              <div className="text-center pt-2">
                <a 
                  href={`https://explorer.neura.io/tx/${hash}`} 
                  target="_blank" 
                  className="text-xs text-blue-500 font-bold hover:underline"
                >
                  View on Neura Explorer →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 space-y-2">
            <p className="text-slate-500 font-medium">Ready to claim your SoulCard?</p>
            <p className="text-xs text-slate-400">Connect your wallet to start the process.</p>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
        Secured by Neura Blockchain
      </p>
    </main>
  );
}