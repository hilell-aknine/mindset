export default function Footer() {
  return (
    <footer className="mt-auto py-4 text-center border-t border-white/5">
      <p className="text-[11px] text-frost-white/25 px-4">
        מדריך לא רשמי. אינו קשור למחברים המקוריים.
        <span className="mx-2">|</span>
        MindSet &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
