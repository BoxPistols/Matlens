import { describe, it, expect } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import { PetriNetPage } from './PetriNetPage'
import { renderWithContext } from '../../test/helpers'

describe('PetriNetPage', () => {
  it('初期状態: 発火可能カウントが 1、Undo ボタンは無効', () => {
    renderWithContext(<PetriNetPage />)
    expect(screen.getByText(/1 件 発火可能/)).toBeInTheDocument()
    const undoBtn = screen.getByRole('button', { name: /1 手戻る/ })
    expect(undoBtn).toBeDisabled()
  })

  it('サンプル追加で総サンプル数が増え、Undo ボタンが有効化される', () => {
    renderWithContext(<PetriNetPage />)
    const addBtn = screen.getByRole('button', { name: /サンプル追加/ })
    fireEvent.click(addBtn)

    // 「総サンプル数」行の値が 2 になる
    const totalRow = screen.getByText('総サンプル数').closest('div')
    expect(totalRow).not.toBeNull()
    if (totalRow) expect(within(totalRow).getByText('2')).toBeInTheDocument()

    // Undo が押せるようになる
    const undoBtn = screen.getByRole('button', { name: /1 手戻る/ })
    expect(undoBtn).not.toBeDisabled()
  })

  it('1 手戻るで直前の状態に巻き戻る', () => {
    renderWithContext(<PetriNetPage />)
    fireEvent.click(screen.getByRole('button', { name: /サンプル追加/ }))
    fireEvent.click(screen.getByRole('button', { name: /1 手戻る/ }))

    // 総サンプル数が 1 に戻る
    const totalRow = screen.getByText('総サンプル数').closest('div')
    if (totalRow) expect(within(totalRow).getByText('1')).toBeInTheDocument()

    // スタックが空なので再び無効
    const undoBtn = screen.getByRole('button', { name: /1 手戻る/ })
    expect(undoBtn).toBeDisabled()
  })

  it('リセットで Undo スタックもクリアされる', () => {
    renderWithContext(<PetriNetPage />)
    fireEvent.click(screen.getByRole('button', { name: /サンプル追加/ }))
    fireEvent.click(screen.getByRole('button', { name: /サンプル追加/ }))
    fireEvent.click(screen.getByRole('button', { name: /リセット/ }))

    const undoBtn = screen.getByRole('button', { name: /1 手戻る/ })
    expect(undoBtn).toBeDisabled()
  })

  it('PNML ボタンでプレビューモーダルが開き、即ダウンロードしない', () => {
    renderWithContext(<PetriNetPage />)
    // モーダルが閉じている間はプレビュー要素なし
    expect(screen.queryByRole('heading', { name: /PNML エクスポート プレビュー/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /PNML/ }))

    // モーダルが開き、ファイル名が表示される
    expect(screen.getByRole('heading', { name: /PNML エクスポート プレビュー/ })).toBeInTheDocument()
    expect(screen.getByText('metal-test-workflow.pnml')).toBeInTheDocument()

    // XML 宣言がプレビューに含まれる
    expect(screen.getByText(/<\?xml version="1\.0"/)).toBeInTheDocument()
  })

  it('プレビューモーダルのキャンセルで閉じる', () => {
    renderWithContext(<PetriNetPage />)
    fireEvent.click(screen.getByRole('button', { name: /PNML/ }))
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/ }))
    expect(screen.queryByRole('heading', { name: /PNML エクスポート プレビュー/ })).toBeNull()
  })

  it('試験フロー可視化ページの見出しを表示', () => {
    renderWithContext(<PetriNetPage />)
    expect(screen.getByRole('heading', { name: /ペトリネット ワークフロー/ })).toBeInTheDocument()
  })
})
