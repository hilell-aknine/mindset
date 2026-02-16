import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { ArrowRight, Printer, Lock } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = { 'strengths-finder': strengthsFinder }

export default function WorkbookPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { player } = usePlayer()
  const book = BOOKS[slug]

  const hasPremium = player.isPremium || player.premiumBooks.includes(slug)

  if (!book) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-frost-white/50">הספר לא נמצא</p>
      </main>
    )
  }

  if (!hasPremium) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button onClick={() => navigate(`/book/${slug}`)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowRight className="w-5 h-5 text-frost-white/60" />
          </button>
          <h2 className="font-display text-xl font-bold text-frost-white">חוברת עבודה</h2>
        </div>
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gold/10 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-10 h-10 text-gold/40" />
          </div>
          <h3 className="font-display text-xl font-bold text-frost-white mb-2">חוברת עבודה — פרימיום</h3>
          <p className="text-sm text-frost-white/40">רכשו את הספר או חבילת המאסטר כדי להדפיס חוברת עבודה</p>
        </div>
      </main>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header (hidden in print) */}
      <div className="flex items-center justify-between mb-6 animate-fade-in print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/book/${slug}`)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowRight className="w-5 h-5 text-frost-white/60" />
          </button>
          <h2 className="font-display text-xl font-bold text-frost-white">חוברת עבודה</h2>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          הדפסה
        </button>
      </div>

      {/* Workbook content */}
      <div className="space-y-8 print:space-y-6">
        {/* Title page */}
        <div className="text-center py-8 print:py-16 print:break-after-page">
          <p className="text-6xl mb-4">{book.icon}</p>
          <h1 className="font-display text-3xl font-bold text-frost-white print:text-black">{book.title}</h1>
          <p className="text-frost-white/40 print:text-gray-500 mt-2">{book.author}</p>
          <p className="text-frost-white/30 print:text-gray-400 text-sm mt-4">חוברת עבודה — MindSet</p>
        </div>

        {/* Chapters */}
        {book.chapters.map((chapter, ci) => (
          <div key={ci} className="print:break-before-page">
            <h2 className="font-display text-xl font-bold text-frost-white print:text-black mb-4 pb-2 border-b border-white/10 print:border-gray-300">
              פרק {ci + 1}: {chapter.title}
            </h2>

            {chapter.lessons.map((lesson, li) => (
              <div key={li} className="mb-6">
                <h3 className="font-semibold text-sm text-dusty-aqua print:text-teal-700 mb-3">
                  שיעור {li + 1}: {lesson.title}
                </h3>

                <div className="space-y-4">
                  {lesson.exercises.map((ex, ei) => (
                    <div key={ei} className="glass-card p-4 print:border print:border-gray-300 print:bg-white print:rounded-lg">
                      <p className="text-xs text-frost-white/30 print:text-gray-400 mb-1">
                        תרגיל {ei + 1} — {ex.type}
                      </p>
                      <p className="text-sm text-frost-white print:text-black mb-3 leading-relaxed">
                        {ex.question || ex.text || ex.template}
                      </p>

                      {/* Options for multiple-choice / improve */}
                      {ex.options && (
                        <div className="space-y-1.5">
                          {ex.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2 text-sm text-frost-white/60 print:text-gray-600">
                              <span className="w-5 h-5 rounded border border-white/10 print:border-gray-400 flex items-center justify-center text-[10px] shrink-0">
                                {String.fromCharCode(1488 + oi)}
                              </span>
                              <span>{typeof opt === 'string' ? opt : opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Items for order type */}
                      {ex.items && (
                        <div className="space-y-1.5">
                          {ex.items.map((item, ii) => (
                            <div key={ii} className="flex items-center gap-2 text-sm text-frost-white/60 print:text-gray-600">
                              <span className="w-5 h-5 rounded border border-white/10 print:border-gray-400 flex items-center justify-center text-[10px] shrink-0">
                                __
                              </span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pairs for match type */}
                      {ex.pairs && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            {ex.pairs.map((p, pi) => (
                              <div key={pi} className="text-frost-white/60 print:text-gray-600">{p.left}</div>
                            ))}
                          </div>
                          <div className="space-y-1">
                            {[...ex.pairs].sort(() => Math.random() - 0.5).map((p, pi) => (
                              <div key={pi} className="text-frost-white/40 print:text-gray-500">{p.right}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer line */}
                      <div className="mt-3 pt-2 border-t border-white/5 print:border-gray-200">
                        <p className="text-[10px] text-frost-white/20 print:text-gray-300">תשובה: _______________</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer (hidden in print) */}
      <p className="text-center text-[10px] text-frost-white/20 mt-8 print:hidden">
        מדריך לא רשמי. אינו קשור למחברים המקוריים.
      </p>
    </main>
  )
}
