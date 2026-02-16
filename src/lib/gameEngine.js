/**
 * Game Engine — answer checking logic for all 7 exercise types
 */

export function checkAnswer(exercise, userAnswer) {
  switch (exercise.type) {
    case 'multiple-choice':
    case 'improve':
      return userAnswer === exercise.correct

    case 'fill-blank':
      return userAnswer === exercise.correct

    case 'order':
      return JSON.stringify(userAnswer) === JSON.stringify(exercise.correctOrder)

    case 'compare':
      return userAnswer === exercise.correct

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
  const [correctStart, correctEnd] = exercise.correctRange

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
