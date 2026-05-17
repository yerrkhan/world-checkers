/**
 * Russian Checkers (Шашки / Shashki) — 8×8 board
 *
 * Board representation: 8×8 array of null | { color: 'white'|'black', type: 'man'|'king' }
 * Dark squares only: (row + col) % 2 === 1
 *
 * Rules:
 *  - White starts at rows 5-7, black at rows 0-2
 *  - White moves FIRST (toward row 0); black moves toward row 7
 *  - Men move forward only (non-capture), but can capture in ALL 4 diagonals
 *  - Kings are flying kings: move/capture any number of squares diagonally
 *  - Captures are mandatory; multi-jump chains are mandatory
 *  - Promotion: man reaching the last row becomes a king
 *  - If a man promotes mid-chain it stops (Russian rule: no continuation as king)
 *  - White promotes at row 0, black promotes at row 7
 *
 * Public API (compatible with GameBoard.vue):
 *   const game = new RussianCheckers()
 *   game.reset()
 *   const { board, turn, allowedMoves } = game.getCurrentState()
 *   game.move(moveObj)
 *   game.bestMove(depth)  // depth 1=easy, 2=medium, 3+=hard
 */

export class RussianCheckers {
  constructor () {
    this.reset()
  }

  // ─── Initialisation ────────────────────────────────────────────────────────

  reset () {
    this._board = this._initBoard()
    this._turn  = 'white'
    this._moves = this._computeMoves(this._board, this._turn)
  }

  _initBoard () {
    const b = Array.from({ length: 8 }, () => Array(8).fill(null))
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1) b[r][c] = { color: 'black', type: 'man' }
    for (let r = 5; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if ((r + c) % 2 === 1) b[r][c] = { color: 'white', type: 'man' }
    return b
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Returns a snapshot of the current game state. */
  getCurrentState () {
    return {
      board:        this._board.map(r => r.map(cell => cell ? { ...cell } : null)),
      turn:         this._turn,
      allowedMoves: this._moves,
    }
  }

  /**
   * Apply a move from allowedMoves.
   * moveObj: { from: {row,col}, path: [{row,col},...], captured: [{row,col},...] }
   */
  move (moveObj) {
    this._board = this._applyMove(this._board, moveObj)
    this._turn  = this._turn === 'white' ? 'black' : 'white'
    this._moves = this._computeMoves(this._board, this._turn)
  }

  /**
   * Returns the best move or null if none available.
   * depth 1 → random
   * depth 2 → prefer longer capture chains, then random
   * depth 3+ → minimax with alpha-beta (max depth 4)
   */
  bestMove (depth = 1) {
    const moves = this._moves
    if (!moves.length) return null

    if (depth === 1) {
      return moves[Math.floor(Math.random() * moves.length)]
    }

    if (depth === 2) {
      const captures = moves.filter(m => m.captured.length > 0)
      if (captures.length) {
        const maxLen = Math.max(...captures.map(m => m.captured.length))
        const best   = captures.filter(m => m.captured.length === maxLen)
        return best[Math.floor(Math.random() * best.length)]
      }
      return moves[Math.floor(Math.random() * moves.length)]
    }

    // depth 3+: minimax alpha-beta, capped at ply 4
    const maxPly = 4
    let bestScore = -Infinity
    let bestMove  = null
    let alpha     = -Infinity
    const beta    = Infinity

    const opp = this._turn === 'white' ? 'black' : 'white'
    for (const m of moves) {
      const nb    = this._applyMove(this._board, m)
      const score = -this._minimax(nb, opp, maxPly - 1, -beta, -alpha)
      if (score > bestScore) {
        bestScore = score
        bestMove  = m
        if (score > alpha) alpha = score
      }
    }
    return bestMove
  }

  // ─── Move computation ───────────────────────────────────────────────────────

  /**
   * Compute all legal moves for `turn` on `board`.
   * Captures are mandatory; non-empty capture list means all quiet moves are suppressed.
   */
  _computeMoves (board, turn) {
    const captures = this._allCaptures(board, turn)
    if (captures.length) return captures
    return this._allQuiet(board, turn)
  }

  /** Collect all quiet (non-capture) moves. */
  _allQuiet (board, turn) {
    const moves  = []
    const fwdDr  = turn === 'white' ? -1 : 1  // white moves up (decreasing row)
    const DIRS   = [[-1,-1],[-1,1],[1,-1],[1,1]]

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c]
        if (!cell || cell.color !== turn) continue

        if (cell.type === 'man') {
          // Men move forward only (quiet)
          for (const dc of [-1, 1]) {
            const nr = r + fwdDr
            const nc = c + dc
            if (this._inBounds(nr, nc) && !board[nr][nc]) {
              moves.push({ from: { row: r, col: c }, path: [{ row: nr, col: nc }], captured: [] })
            }
          }
        } else {
          // Flying king: slide in all 4 diagonals
          for (const [dr, dc] of DIRS) {
            let nr = r + dr, nc = c + dc
            while (this._inBounds(nr, nc) && !board[nr][nc]) {
              moves.push({ from: { row: r, col: c }, path: [{ row: nr, col: nc }], captured: [] })
              nr += dr; nc += dc
            }
          }
        }
      }
    }
    return moves
  }

  /** Collect all capture sequences (may be multi-jump chains). */
  _allCaptures (board, turn) {
    const seqs = []
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c]
        if (!cell || cell.color !== turn) continue
        const isKing = cell.type === 'king'
        seqs.push(...this._captureSeqs(board, r, c, isKing, turn, [], [], r, c))
      }
    }
    return seqs
  }

  /**
   * Recursively enumerate all capture sequences from (r,c).
   *
   * @param {Array}  board      - current board state (may be mutated copies)
   * @param {number} r,c        - current position
   * @param {boolean} isKing    - whether the piece is a king
   * @param {string} turn       - 'white'|'black'
   * @param {Array}  path       - list of {row,col} landing squares so far
   * @param {Array}  captured   - list of {row,col} already captured (to avoid double-capture)
   * @param {number} fromR,fromC - origin of the whole sequence (for `from` field)
   */
  _captureSeqs (board, r, c, isKing, turn, path, captured, fromR, fromC) {
    const DIRS   = [[-1,-1],[-1,1],[1,-1],[1,1]]
    const opp    = turn === 'white' ? 'black' : 'white'
    const promRow = turn === 'white' ? 0 : 7
    const results = []

    for (const [dr, dc] of DIRS) {
      if (isKing) {
        // Flying king: scan the diagonal to find the first piece
        let nr = r + dr, nc = c + dc
        // Skip empty squares
        while (this._inBounds(nr, nc) && !board[nr][nc]) { nr += dr; nc += dc }

        if (!this._inBounds(nr, nc)) continue
        const target = board[nr][nc]
        if (!target || target.color !== opp) continue

        // Make sure this piece hasn't already been captured in this chain
        const capKey = nr * 8 + nc
        if (captured.some(x => x.row * 8 + x.col === capKey)) continue

        const capPos = { row: nr, col: nc }

        // Landing squares: every empty square beyond the captured piece
        let lr = nr + dr, lc = nc + dc
        while (this._inBounds(lr, lc) && !board[lr][lc]) {
          const landPos  = { row: lr, col: lc }
          const newPath  = [...path, landPos]
          const newCap   = [...captured, capPos]

          // Build a temporary board for recursive search:
          // remove the captured piece so it can't be re-jumped;
          // move the king to the landing square.
          const nb = this._cloneBoard(board)
          nb[r][c]    = null
          nb[nr][nc]  = null
          nb[lr][lc]  = { color: turn, type: 'king' }

          const sub = this._captureSeqs(nb, lr, lc, true, turn, newPath, newCap, fromR, fromC)
          if (sub.length) {
            results.push(...sub)
          } else {
            results.push({ from: { row: fromR, col: fromC }, path: newPath, captured: newCap })
          }

          lr += dr; lc += dc
        }
      } else {
        // Man: jumps exactly one square over the enemy, lands one beyond
        const nr = r + dr,      nc = c + dc   // enemy position
        const lr = r + 2 * dr,  lc = c + 2 * dc  // landing square

        if (!this._inBounds(nr, nc) || !this._inBounds(lr, lc)) continue
        const target = board[nr][nc]
        if (!target || target.color !== opp) continue

        const capKey = nr * 8 + nc
        if (captured.some(x => x.row * 8 + x.col === capKey)) continue
        if (board[lr][lc]) continue  // landing square must be empty

        const capPos  = { row: nr, col: nc }
        const landPos = { row: lr, col: lc }
        const newPath = [...path, landPos]
        const newCap  = [...captured, capPos]

        // Russian rule: if man lands on promotion row, it becomes a king
        // but the sequence STOPS (no continuation as flying king).
        const promotes = lr === promRow

        const nb = this._cloneBoard(board)
        nb[r][c]    = null
        nb[nr][nc]  = null
        nb[lr][lc]  = { color: turn, type: promotes ? 'king' : 'man' }

        if (promotes) {
          // Promotion stops the chain
          results.push({ from: { row: fromR, col: fromC }, path: newPath, captured: newCap })
        } else {
          const sub = this._captureSeqs(nb, lr, lc, false, turn, newPath, newCap, fromR, fromC)
          if (sub.length) {
            results.push(...sub)
          } else {
            results.push({ from: { row: fromR, col: fromC }, path: newPath, captured: newCap })
          }
        }
      }
    }

    return results
  }

  // ─── Move application ───────────────────────────────────────────────────────

  /**
   * Returns a new board with `moveObj` applied.
   * Does NOT mutate the input board.
   */
  _applyMove (board, moveObj) {
    const nb  = this._cloneBoard(board)
    const { from, path, captured } = moveObj
    const dest = path[path.length - 1]

    const piece = nb[from.row][from.col]
    nb[from.row][from.col] = null

    // Remove all captured pieces
    for (const cap of captured) nb[cap.row][cap.col] = null

    // Determine promotion
    const promRow = piece.color === 'white' ? 0 : 7
    const type    = (piece.type === 'king' || dest.row === promRow) ? 'king' : 'man'

    nb[dest.row][dest.col] = { color: piece.color, type }
    return nb
  }

  // ─── Minimax with alpha-beta ────────────────────────────────────────────────

  /**
   * Negamax with alpha-beta pruning.
   * Returns the evaluation from the perspective of `turn`.
   */
  _minimax (board, turn, depth, alpha, beta) {
    const moves = this._computeMoves(board, turn)

    if (!moves.length) return -1000  // current player has no moves → loses

    if (depth === 0) return this._evaluate(board, turn)

    let best = -Infinity
    for (const m of moves) {
      const nb  = this._applyMove(board, m)
      const opp = turn === 'white' ? 'black' : 'white'
      const val = -this._minimax(nb, opp, depth - 1, -beta, -alpha)
      if (val > best) best = val
      if (val > alpha) alpha = val
      if (alpha >= beta) break  // beta cut-off
    }
    return best
  }

  /**
   * Evaluation from the perspective of `turn`.
   * Material + advancement + center control + king safety.
   */
  _evaluate (board, turn) {
    let score = 0
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = board[r][c]
        if (!cell) continue
        const mine = cell.color === turn

        let val = 0
        if (cell.type === 'king') {
          val = 9  // king is very valuable
        } else {
          val = 3  // base man value
          // Advancement bonus: pieces closer to promotion are more valuable
          const row = cell.color === 'white' ? (7 - r) : r
          val += row * 0.3
          // Center control bonus
          if (c >= 2 && c <= 5) val += 0.2
          // Back-row protection bonus (don't leave home row undefended early)
          if (cell.color === 'white' && r === 7) val += 0.4
          if (cell.color === 'black' && r === 0) val += 0.4
          // Edge penalty (edge pieces are less mobile)
          if (c === 0 || c === 7) val -= 0.3
        }

        score += mine ? val : -val
      }
    }
    return score
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────

  _inBounds (r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8
  }

  _cloneBoard (board) {
    return board.map(row => row.map(cell => cell ? { ...cell } : null))
  }
}
