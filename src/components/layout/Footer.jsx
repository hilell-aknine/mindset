import { Brain } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  const handleFaq = () => {
    const el = document.getElementById('faq')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#faq')
    }
  }

  return (
    <footer className="mt-auto border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
                <Brain className="w-4 h-4 text-frost-white" />
              </div>
              <span className="font-display font-bold text-frost-white">MindSet</span>
            </div>
            <p className="text-xs text-frost-white/40 leading-relaxed max-w-[200px]">
              הופכים ספרי פיתוח אישי למשחקי למידה אינטראקטיביים.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-frost-white/50 mb-3">המוצר</h4>
            <ul className="space-y-1 text-xs text-frost-white/40">
              <li><Link to="/home" className="inline-block min-h-[44px] min-w-[44px] py-2 hover:text-frost-white/70 transition-colors">ספרים</Link></li>
              <li><button onClick={handleFaq} className="inline-block min-h-[44px] min-w-[44px] py-2 hover:text-frost-white/70 transition-colors">שאלות נפוצות</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-frost-white/50 mb-3">מידע</h4>
            <ul className="space-y-1 text-xs text-frost-white/30">
              <li><span className="inline-block py-2 cursor-default">תנאי שימוש</span></li>
              <li><span className="inline-block py-2 cursor-default">מדיניות פרטיות</span></li>
              <li><span className="inline-block py-2 cursor-default">נגישות</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-frost-white/30">
            מדריך לא רשמי. אינו קשור למחברים המקוריים.
            <span className="mx-2">|</span>
            MindSet &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[11px] text-frost-white/25">
            נבנה בישראל
          </p>
        </div>
      </div>
    </footer>
  )
}
