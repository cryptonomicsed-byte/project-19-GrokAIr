import { useState } from 'react'
import { Copy, ExternalLink, CheckCircle } from 'lucide-react'

export default function CryptoScreen() {
  const [selectedTier, setSelectedTier] = useState(null)
  const [selectedChain, setSelectedChain] = useState('polygon')
  const [walletAddress, setWalletAddress] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(null)

  const tiers = [
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 9.99,
      cryptoPriceUSDC: '10',
      features: ['✓ Unlimited translations', '✓ Real-time mode', '✓ Priority support'],
    },
    {
      id: 'elite',
      name: 'Elite',
      monthlyPrice: 19.99,
      cryptoPriceUSDC: '20',
      features: ['✓ Everything in Pro', '✓ AI voice cloning', '✓ Custom lessons'],
    },
  ]

  const chains = [
    {
      id: 'polygon',
      name: 'Polygon',
      icon: '🔷',
      token: 'USDC',
      price: '10',
      fee: '0.1 USDC',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      icon: '⟠',
      token: 'USDC',
      price: '10',
      fee: '2.5 USDC',
    },
    {
      id: 'solana',
      name: 'Solana',
      icon: '◎',
      token: 'USDC',
      price: '10',
      fee: '0.005 SOL',
    },
  ]

  const handlePayment = () => {
    if (!selectedTier || !walletAddress) {
      alert('Please select a tier and enter wallet address')
      return
    }
    setPaymentStatus('processing')
    setTimeout(() => {
      setPaymentStatus('success')
    }, 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Crypto Payment</h2>
      <p className="text-slate-400 mb-6">Unlock premium features with cryptocurrency</p>

      {paymentStatus === 'success' ? (
        // Success Screen
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-8 text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-white" />
          <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
          <p className="text-green-100 mb-4">Your subscription is now active</p>
          <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-green-100 text-sm">Transaction Hash</p>
            <p className="text-white font-mono text-sm break-all">0x7f3a9b2e4c1d8f6a5e9b3c7d2f4e8a1b</p>
          </div>
          <button className="bg-white text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-bold transition-colors">
            Explore Premium Features
          </button>
        </div>
      ) : (
        <>
          {/* Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`rounded-lg p-6 cursor-pointer transition-all border-2 ${
                  selectedTier === tier.id
                    ? 'border-purple-500 bg-purple-600/10'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white">{tier.cryptoPriceUSDC}</div>
                  <p className="text-slate-400 text-sm">USDC per month</p>
                </div>
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="text-slate-300 text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 rounded-lg font-bold transition-colors ${
                    selectedTier === tier.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  {selectedTier === tier.id ? '✓ Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>

          {/* Chain Selection */}
          {selectedTier && (
            <div className="mb-8">
              <h3 className="text-white font-bold mb-3">Select Payment Chain</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {chains.map((chain) => (
                  <div
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`rounded-lg p-4 cursor-pointer transition-all border-2 ${
                      selectedChain === chain.id
                        ? 'border-yellow-500 bg-yellow-600/10'
                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{chain.icon}</div>
                    <h4 className="text-white font-bold">{chain.name}</h4>
                    <p className="text-slate-400 text-sm">Fee: {chain.fee}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Input */}
          {selectedTier && (
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <label className="block text-white font-bold mb-2">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-600 text-white rounded-lg p-3 border border-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-slate-400 text-sm mt-2">
                Enter your {selectedChain === 'solana' ? 'Solana' : 'Ethereum'} wallet address
              </p>
            </div>
          )}

          {/* Payment Summary */}
          {selectedTier && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-6 mb-6">
              <h3 className="text-white font-bold mb-4">Payment Summary</h3>
              <div className="space-y-2 mb-4">
                {tiers.map((tier) => {
                  if (tier.id === selectedTier) {
                    return (
                      <div key={tier.id} className="flex justify-between">
                        <span className="text-purple-100">{tier.name} Subscription</span>
                        <span className="text-white font-bold">{tier.cryptoPriceUSDC} USDC</span>
                      </div>
                    )
                  }
                })}
                {chains.map((chain) => {
                  if (chain.id === selectedChain) {
                    return (
                      <div key={chain.id} className="flex justify-between text-sm text-purple-200">
                        <span>Network Fee</span>
                        <span>{chain.fee}</span>
                      </div>
                    )
                  }
                })}
              </div>
              <div className="border-t border-purple-500 pt-4 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold text-lg">
                  {tiers.find((t) => t.id === selectedTier)?.cryptoPriceUSDC} USDC
                </span>
              </div>
            </div>
          )}

          {/* Payment Button */}
          {selectedTier && (
            <button
              onClick={handlePayment}
              disabled={paymentStatus === 'processing'}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                paymentStatus === 'processing'
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              }`}
            >
              {paymentStatus === 'processing' ? 'Processing...' : 'Complete Payment'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
