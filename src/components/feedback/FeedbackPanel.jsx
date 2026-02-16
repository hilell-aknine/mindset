import { CheckCircle, XCircle } from 'lucide-react'

export default function FeedbackPanel({ correct, explanation, onContinue }) {
  return (
    <div className={`sticky bottom-0 border-t animate-slide-up ${
      correct
        ? 'bg-success/10 border-success/20'
        : 'bg-danger/10 border-danger/20'
    }`}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-start gap-3 mb-3">
          {correct ? (
            <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-bold text-sm ${correct ? 'text-success' : 'text-danger'}`}>
              {correct ? 'נכון!' : 'לא נכון'}
            </p>
            <p className="text-xs text-frost-white/60 mt-1 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 ${
            correct ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
        >
          המשך
        </button>
      </div>
    </div>
  )
}
