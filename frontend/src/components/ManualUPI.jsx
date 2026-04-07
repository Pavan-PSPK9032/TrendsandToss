import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ManualUPI({ amount, onPaymentComplete }) {
  const [showQR, setShowQR] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  
  // 🔧 YOUR UPI DETAILS - EDIT THESE
  const UPI_ID = '9032339653-2@ybl' // Replace with your actual UPI ID
  const UPI_NAME = 'Trends&Toss'
  
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`
  
  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied to clipboard!')
  }
  
  const handleConfirm = () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your UPI transaction ID')
      return
    }
    onPaymentComplete(transactionId.trim())
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        💳 Pay via UPI
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Zero Fees</span>
      </h3>
      
      <div className="space-y-4">
        {/* UPI ID Display */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500">Send to UPI ID</p>
            <p className="font-mono text-slate-900 text-sm truncate">{UPI_ID}</p>
          </div>
          <button onClick={copyUPI} className="text-amber-600 hover:text-amber-700 text-sm font-medium whitespace-nowrap">
            Copy
          </button>
        </div>
        
        {/* Amount Display */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Amount to Pay</p>
            <p className="font-bold text-lg text-slate-900">₹{amount}</p>
          </div>
          <span className="text-xs text-slate-400">INR</span>
        </div>
        
        {/* QR Code Toggle */}
        <button 
          onClick={() => setShowQR(!showQR)}
          className="w-full bg-slate-900 text-white py-2.5 rounded-xl hover:bg-slate-800 transition text-sm font-medium"
        >
          {showQR ? '🔻 Hide QR Code' : '📱 Show QR Code'}
        </button>
        
        {/* QR Code Display */}
        {showQR && (
          <div className="text-center p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 mb-3">Scan with any UPI app</p>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`}
              alt="UPI QR Code"
              className="w-44 h-44 mx-auto rounded-lg shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none'
                toast.error('QR generation failed. Use UPI ID instead.')
              }}
            />
            <p className="text-xs text-slate-400 mt-3">✅ GPay • PhonePe • Paytm • BHIM</p>
          </div>
        )}
        
        {/* Transaction ID Input */}
        <div className="pt-2">
          <label className="block text-xs text-slate-500 mb-1">Enter Transaction ID (UTR)</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
            placeholder="e.g., 123456789012"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm font-mono uppercase"
            maxLength={20}
          />
          <p className="text-xs text-slate-400 mt-1">Find this in your UPI app after payment</p>
        </div>
        
        {/* Confirm Button */}
        <button 
          onClick={handleConfirm}
          disabled={!transactionId.trim()}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-lg"
        >
          ✅ Confirm Payment & Place Order
        </button>
        
        {/* WhatsApp Help */}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 text-center">Need help? Message us:</p>
          <a 
            href={`https://wa.me/919032339653?text=Hi, I need help with UPI payment for order ₹${amount}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
        
        {/* Info Note */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Orders with UPI payment will be processed after we verify the transaction. You'll receive a confirmation WhatsApp message shortly.
          </p>
        </div>
      </div>
    </div>
  )
}