import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ManualUPI({ amount, onPaymentComplete }) {
  const [showQR, setShowQR] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  
  const UPI_ID = '9032339653-2@ybl'
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
    <div className="bg-white border border-navy/10 p-5">
      <h3 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">
        Pay via UPI
        <span className="ml-2 text-[10px] bg-gold/10 text-gold px-2 py-0.5">Zero Fees</span>
      </h3>
      
      <div className="space-y-4">
        {/* UPI ID Display */}
        <div className="flex items-center gap-3 p-3 border border-navy/10">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-navy/50">Send to UPI ID</p>
            <p className="font-mono text-navy text-sm truncate">{UPI_ID}</p>
          </div>
          <button onClick={copyUPI} className="text-gold hover:text-gold-dark text-sm font-medium whitespace-nowrap">
            Copy
          </button>
        </div>
        
        {/* Amount Display */}
        <div className="flex items-center gap-3 p-3 border border-navy/10">
          <div className="flex-1">
            <p className="text-xs text-navy/50">Amount to Pay</p>
            <p className="font-bold text-lg text-navy">Rs.{amount}</p>
          </div>
          <span className="text-xs text-navy/30">INR</span>
        </div>
        
        {/* QR Code Toggle */}
        <button 
          onClick={() => setShowQR(!showQR)}
          className="w-full bg-navy text-white py-2.5 hover:bg-navy-light transition text-sm font-medium uppercase tracking-widest"
        >
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>
        
        {/* QR Code Display */}
        {showQR && (
          <div className="text-center p-4 bg-white border-2 border-dashed border-navy/20">
            <p className="text-xs text-navy/50 mb-3">Scan with any UPI app</p>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`}
              alt="UPI QR Code"
              className="w-44 h-44 mx-auto border border-navy/10"
              onError={(e) => {
                e.target.style.display = 'none'
                toast.error('QR generation failed. Use UPI ID instead.')
              }}
            />
            <p className="text-xs text-navy/40 mt-3">GPay &bull; PhonePe &bull; Paytm &bull; BHIM</p>
          </div>
        )}
        
        {/* Transaction ID Input */}
        <div className="pt-2">
          <label className="block text-xs text-navy/50 mb-1 uppercase tracking-wider">Enter Transaction ID (UTR)</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
            placeholder="e.g., 123456789012"
            className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-sm font-mono uppercase text-navy"
            maxLength={20}
          />
          <p className="text-xs text-navy/30 mt-1">Find this in your UPI app after payment</p>
        </div>
        
        {/* Confirm Button */}
        <button 
          onClick={handleConfirm}
          disabled={!transactionId.trim()}
          className="w-full bg-gold text-white py-3 font-medium hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition text-sm uppercase tracking-widest"
        >
          Confirm Payment & Place Order
        </button>
        
        {/* WhatsApp Help */}
        <div className="pt-3 border-t border-navy/10">
          <p className="text-xs text-navy/40 mb-2 text-center">Need help? Message us:</p>
          <a 
            href={`https://wa.me/919032339653?text=Hi, I need help with UPI payment for order Rs.${amount}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-navy text-white py-2.5 hover:bg-navy-light transition text-sm font-medium flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Chat on WhatsApp
          </a>
        </div>
        
        {/* Info Note */}
        <div className="p-3 bg-gold/5 border border-gold/20">
          <p className="text-xs text-navy/60">
            <strong>Note:</strong> Orders with UPI payment will be processed after we verify the transaction. You will receive a confirmation WhatsApp message shortly.
          </p>
        </div>
      </div>
    </div>
  )
}
