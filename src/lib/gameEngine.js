/**
 * Game Engine — answer checking logic for all 7 exercise types
 */

export function checkAnswer(exercise, userAnswer) {
  if (!exercise || userAnswer == null) return false

  switch (exercise.type) {
    case 'multiple-choice':
    case 'fill-blank':
    case 'scenario':
      return userAnswer === exercise.correct

    case 'improve':
    case 'compare': {
      // Handle both numeric (0/1) and string ("A"/"B") correct formats
      let correctIdx = exercise.correct
      if (typeof correctIdx === 'string') {
        correctIdx = correctIdx === 'A' ? 0 : 1
      }
      return userAnswer === correctIdx
    }

    case 'order':
      if (!Array.isArray(userAnswer) || !Array.isArray(exercise.correctOrder)) return false
      return JSON.stringify(userAnswer) === JSON.stringify(exercise.correctOrder)

    case 'match':
      return checkMatchAnswer(exercise, userAnswer)

    case 'identify':
      return checkIdentifyAnswer(exercise, userAnswer)

    default:
      return false
  }
}

function checkMatchAnswer(exercise, userPairs) {
  if (!userPairs || userPairs.length !== exercise.pairs.length) return false
  return userPairs.every(([leftIdx, rightIdx]) => leftIdx === rightIdx)
}

function checkIdentifyAnswer(exercise, selection) {
  if (!selection || selection.start == null || selection.end == null) return false
  const [correctStart, correctEnd] = exercise.correctRange || [exercise.correctStart, exercise.correctEnd]

  const overlapStart = Math.max(selection.start, correctStart)
  const overlapEnd = Math.min(selection.end, correctEnd)
  const overlapLength = Math.max(0, overlapEnd - overlapStart)

  const selectionLength = selection.end - selection.start
  const correctLength = correctEnd - correctStart

  if (selectionLength === 0 || correctLength === 0) return false

  const selectionOverlapRatio = overlapLength / selectionLength
  const correctOverlapRatio = overlapLength / correctLength

  return selectionOverlapRatio >= 0.6 && correctOverlapRatio >= 0.4
}

export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
