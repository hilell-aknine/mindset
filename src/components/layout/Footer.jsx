import { Brain, Mail, Github } from 'lucide-react'

export default function Footer() {
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
            <p className="text-[11px] text-frost-white/30 leading-relaxed max-w-[200px]">
              הופכים ספרי פיתוח אישי למשחקי למידה אינטראקטיביים.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-frost-white/50 mb-3">המוצר</h4>
            <ul className="space-y-2 text-[11px] text-frost-white/30">
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">ספרים</a></li>
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">מחירים</a></li>
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">שאלות נפוצות</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-frost-white/50 mb-3">מידע</h4>
            <ul className="space-y-2 text-[11px] text-frost-white/30">
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">תנאי שימוש</a></li>
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">מדיניות פרטיות</a></li>
              <li><a href="#" className="hover:text-frost-white/50 transition-colors">נגישות</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-frost-white/20">
            מדריך לא רשמי. אינו קשור למחברים המקוריים.
            <span className="mx-2">|</span>
            MindSet &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[10px] text-frost-white/15">
            נבנה בישראל
          </p>
        </div>
      </div>
    </footer>
  )
}
