// One-time script: Convert strengths-finder data.js → JSON
const fs = require('fs')
const path = require('path')

const sourceFile = path.resolve(__dirname, '../../מפעל-משחקים/games/strengths-finder/data.js')
const outFile = path.resolve(__dirname, '../src/data/books/strengths-finder.json')

// Read and eval the JS file to extract MODULES
const jsContent = fs.readFileSync(sourceFile, 'utf8')

// Remove the export block if present, and eval
const cleanedJS = jsContent
  .replace(/if\s*\(typeof module.*\n.*\n\}/, '')
  .replace(/module\.exports.*/, '')

// Use Function constructor to eval safely
const fn = new Function(cleanedJS + '\nreturn MODULES;')
const MODULES = fn()

// Build the MindSet JSON structure
const book = {
  slug: 'strengths-finder',
  title: 'גלה את החוזקות שלך',
  author: 'גישת החוזקות',
  icon: '💪',
  systemPrompt: 'אתה מאמן אישי שמתמחה בגישת החוזקות. עזור ללומד להבין את החוזקות שלו וכיצד ליישם אותן בחיי היומיום. ענה בקצרה, בעברית, בטון חם ומעודד. השתמש בדוגמאות מעשיות. הימנע מציטוטים ישירים.',
  chapters: MODULES.map((mod, ci) => ({
    orderIndex: ci,
    title: mod.title,
    description: mod.description,
    icon: mod.icon,
    isFree: ci === 0,
    lessons: mod.lessons.map((lesson, li) => ({
      orderIndex: li,
      title: lesson.title,
      exercises: lesson.exercises
    }))
  }))
}

// Write JSON
fs.writeFileSync(outFile, JSON.stringify(book, null, 2), 'utf8')

// Stats
let totalExercises = 0
book.chapters.forEach(ch => {
  ch.lessons.forEach(l => {
    totalExercises += l.exercises.length
  })
})

console.log(`Done! ${book.chapters.length} chapters, ${book.chapters.reduce((a, c) => a + c.lessons.length, 0)} lessons, ${totalExercises} exercises`)
console.log(`Output: ${outFile}`)
