/**
 * International Draughts (Международные шашки) — FMJD rules
 * 10×10 board, flying kings, backward captures, maximum-capture mandatory
 *
 * Board values:
 *   0  = empty
 *   1  = dark man    (dark moves second, top→bottom, promotes at row 9)
 *   2  = dark king
 *  -1  = light man   (light/white moves FIRST, bottom→top, promotes at row 0)
 *  -2  = light king
 *
 * Dark squares only: (row + col) % 2 === 1
 */

export class Draughts10 {
  constructor () {
    this.reset()
  }

  // ─── Init ───────────────────────────────────────────────────────────────

  reset () {
    this.board = this._initBoard()
    this.turn  = 'light'  // light/white goes first (FMJD rules)
    this.over  = false
    this.winner = null
    this._moves = this._computeMoves()
  }

  _initBoard () {
    const b = Array.from({ length: 10 }, () => Array(10).fill(0))
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 10; c++)
        if ((r + c) % 2 === 1) b[r][c] = 1     // dark pieces top

    for (let r = 6; r < 10; r++)
      for (let c = 0; c < 10; c++)
        if ((r + c) % 2 === 1) b[r][c] = -1    // light pieces bottom
    return b
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /** Current state snapshot */
  getState () {
    return {
      board:   this.board.map(r => [...r]),
      turn:    this.turn,
      moves:   this._moves,
      over:    this.over,
      winner:  this.winner,
    }
  }

  /** Execute a move object from getMoves() */
  makeMove (move) {
    if (this.over) return null
    const mySign = this.turn === 'dark' ? 1 : -1
    const piece  = this.board[move.from.r][move.from.c]
    const dest   = move.path[move.path.length - 1]
    const isKing = Math.abs(piece) === 2

    // Remove piece from origin
    this.board[move.from.r][move.from.c] = 0

    // Remove captured pieces
    for (const cap of move.captured) this.board[cap.r][cap.c] = 0

    // Promotion: man reaching the last row AND stopping there
    const promRow   = this.turn === 'dark' ? 9 : 0
    const becomeKing = isKing || dest.r === promRow
    this.board[dest.r][dest.c] = becomeKing ? mySign * 2 : mySign

    // Switch turn
    this.turn = this.turn === 'dark' ? 'light' : 'dark'

    // Compute next moves
    this._moves = this._computeMoves()
    if (this._moves.length === 0) {
      this.over   = true
      this.winner = this.turn === 'dark' ? 'light' : 'dark'
    }
    return this._moves
  }

  /** Simple AI: returns best move (random weighted toward max-capture) */
  bestMove (_depth = 1) {
    const moves = this._moves
    if (!moves.length) return null
    // Prefer longer capture chains
    const maxCap = Math.max(...moves.map(m => m.captured.length))
    const best   = moves.filter(m => m.captured.length === maxCap)
    return best[Math.floor(Math.random() * best.length)]
  }

  // ─── Move computation ───────────────────────────────────────────────────

  _computeMoves () {
    const captures = this._allCaptures()
    if (captures.length) {
      const maxLen = Math.max(...captures.map(c => c.captured.length))
      return captures.filter(c => c.captured.length === maxLen)
    }
    return this._allQuiet()
  }

  /** Gather all capture sequences for the current player */
  _allCaptures () {
    const mySign = this.turn === 'dark' ? 1 : -1
    const seqs   = []
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) {
        const p = this.board[r][c]
        if (Math.sign(p) !== mySign) continue
        seqs.push(...this._captureFrom(r, c, Math.abs(p) === 2, [], [], this.board))
      }
    return seqs
  }

  /**
   * Recursively find all capture sequences starting at (r,c).
   * Returns array of { from, path, captured }.
   */
  _captureFrom (r, c, isKing, path, captured, board) {
    const mySign = this.turn === 'dark' ? 1 : -1
    const DIRS   = [[-1,-1],[-1,1],[1,-1],[1,1]]
    const results = []

    for (const [dr, dc] of DIRS) {
      if (isKing) {
        // Flying king: scan the diagonal for the first piece
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === 0) {
          nr += dr; nc += dc
        }
        if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) continue
        const target = board[nr][nc]
        if (!target || Math.sign(target) === mySign) continue     // friendly or OOB
        const capPos = { r: nr, c: nc }
        if (captured.some(x => x.r === nr && x.c === nc)) continue // already taken

        // Land anywhere behind the captured piece
        let lr = nr + dr, lc = nc + dc
        while (lr >= 0 && lr < 10 && lc >= 0 && lc < 10 && board[lr][lc] === 0) {
          const nb    = board.map(row => [...row])
          nb[r][c]    = 0
          nb[nr][nc]  = 0
          nb[lr][lc]  = mySign * 2   // king stays king

          const sub = this._captureFrom(lr, lc, true, [...path, { r: lr, c: lc }], [...captured, capPos], nb)
          if (sub.length) results.push(...sub)
          else            results.push({ from: { r: (path.length ? path[0].r : r), c: (path.length ? path[0].c : c) }, path: [...path, { r: lr, c: lc }], captured: [...captured, capPos], _start: { r, c } })
          lr += dr; lc += dc
        }
      } else {
        // Man: adjacent jump
        const nr = r + dr,  nc = c + dc
        const lr = r + 2*dr, lc = c + 2*dc
        if (lr < 0 || lr >= 10 || lc < 0 || lc >= 10) continue
        const target = board[nr][nc]
        if (!target || Math.sign(target) === mySign) continue
        const capPos = { r: nr, c: nc }
        if (captured.some(x => x.r === nr && x.c === nc)) continue
        if (board[lr][lc] !== 0) continue

        const nb    = board.map(row => [...row])
        nb[r][c]    = 0
        nb[nr][nc]  = 0

        // Check promotion mid-jump: man does NOT become king mid-sequence
        const promRow  = this.turn === 'dark' ? 9 : 0
        const promoted = lr === promRow
        nb[lr][lc]    = promoted ? mySign * 2 : mySign

        const newPath = [...path, { r: lr, c: lc }]
        const newCap  = [...captured, capPos]
        const sub     = promoted
          ? []   // promotion ends the sequence
          : this._captureFrom(lr, lc, false, newPath, newCap, nb)

        if (sub.length) results.push(...sub)
        else            results.push({ from: { r: (path.length ? path[0].r : r), c: (path.length ? path[0].c : c) }, path: newPath, captured: newCap, _start: { r, c } })
      }
    }

    // Fix: when recursing, "from" should stay the original piece position
    // Re-tag the from on each result if it was set during recursion
    return results.map(res => ({
      from:     path.length === 0 ? { r, c } : res.from,
      path:     res.path,
      captured: res.captured,
    }))
  }

  /** All non-capture moves for current player */
  _allQuiet () {
    const mySign = this.turn === 'dark' ? 1 : -1
    const fwdDirs = this.turn === 'dark' ? [[1,-1],[1,1]] : [[-1,-1],[-1,1]]
    const allDirs = [[-1,-1],[-1,1],[1,-1],[1,1]]
    const moves   = []

    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) {
        const p = this.board[r][c]
        if (Math.sign(p) !== mySign) continue
        const isKing = Math.abs(p) === 2
        const dirs   = isKing ? allDirs : fwdDirs

        for (const [dr, dc] of dirs) {
          if (isKing) {
            let nr = r + dr, nc = c + dc
            while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && this.board[nr][nc] === 0) {
              moves.push({ from: { r, c }, path: [{ r: nr, c: nc }], captured: [] })
              nr += dr; nc += dc
            }
          } else {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && this.board[nr][nc] === 0)
              moves.push({ from: { r, c }, path: [{ r: nr, c: nc }], captured: [] })
          }
        }
      }
    return moves
  }
}
