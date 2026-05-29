import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import ResultCard from './ResultCard'
import { resizeImage, formatSize, downloadAll, OUTPUT_FORMATS, PRESET_SIZES } from '../utils/imageProcessor'

export default function ResizeTool() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [preset, setPreset] = useState('custom')
  const [targetWidth, setTargetWidth] = useState('')
  const [targetHeight, setTargetHeight] = useState('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [outputFormat, setOutputFormat] = useState('original')

  const handleFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
    setResults([])
  }, [])

  const handlePresetChange = (val) => {
    setPreset(val)
    if (val !== 'custom') {
      const [w, h] = val.split('x').map(Number)
      setTargetWidth(String(w))
      setTargetHeight(String(h))
    }
  }

  const handleResize = async () => {
    if (files.length === 0 || !targetWidth || !targetHeight) return
    setProcessing(true)
    setProgress({ current: 0, total: files.length })
    const newResults = []

    for (let i = 0; i < files.length; i++) {
      try {
        const opts = {
          keepAspectRatio: keepRatio,
          outputFormat: outputFormat === 'original' ? null : outputFormat,
        }
        const result = await resizeImage(
          files[i],
          parseInt(targetWidth),
          parseInt(targetHeight),
          opts
        )
        newResults.push({
          ...result,
          originalName: files[i].name,
          originalSize: files[i].size,
        })
      } catch (err) {
        console.error(`调整失败: ${files[i].name}`, err)
      }
      setProgress({ current: i + 1, total: files.length })
    }

    setResults(newResults)
    setProcessing(false)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setProgress({ current: 0, total: 0 })
  }

  return (
    <div className="tool-container">
      <div className="settings-panel">
        <div className="setting-group">
          <label>预设尺寸</label>
          <select value={preset} onChange={e => handlePresetChange(e.target.value)} className="select">
            {PRESET_SIZES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-group flex-1">
            <label>宽度 (px)</label>
            <input
              type="number"
              placeholder="宽度"
              value={targetWidth}
              onChange={e => { setTargetWidth(e.target.value); setPreset('custom') }}
              className="input"
            />
          </div>
          <button
            className={`link-btn ${keepRatio ? 'active' : ''}`}
            onClick={() => setKeepRatio(!keepRatio)}
            title={keepRatio ? '保持宽高比' : '不保持宽高比'}
          >
            {keepRatio ? '🔗' : '🔓'}
          </button>
          <div className="setting-group flex-1">
            <label>高度 (px)</label>
            <input
              type="number"
              placeholder="高度"
              value={targetHeight}
              onChange={e => { setTargetHeight(e.target.value); setPreset('custom') }}
              className="input"
            />
          </div>
        </div>

        <div className="setting-group">
          <label>输出格式</label>
          <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="select">
            <option value="original">保持原格式</option>
            {Object.entries(OUTPUT_FORMATS).map(([key, fmt]) => (
              <option key={key} value={key}>{fmt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {files.length === 0 ? (
        <FileDropZone onFiles={handleFiles} />
      ) : (
        <div className="files-preview">
          <div className="files-header">
            <span>已选择 {files.length} 个文件</span>
            <button className="btn btn-sm btn-danger" onClick={handleReset}>🗑️ 清空</button>
          </div>
          <div className="files-list">
            {files.slice(0, 8).map((f, i) => (
              <div key={i} className="file-tag">{f.name} ({formatSize(f.size)})</div>
            ))}
            {files.length > 8 && <div className="file-tag more">...还有 {files.length - 8} 个</div>}
          </div>
        </div>
      )}

      {files.length > 0 && !processing && results.length === 0 && (
        <div className="action-bar">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleResize}
            disabled={!targetWidth || !targetHeight}
          >
            📐 调整为 {targetWidth || '?'}×{targetHeight || '?'} ({files.length} 张)
          </button>
        </div>
      )}

      {processing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
          <p className="progress-text">正在处理 {progress.current} / {progress.total}...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ 调整完成</h3>
            <div className="results-actions">
              <button className="btn btn-primary" onClick={() => downloadAll(results)}>⬇️ 全部下载</button>
              <button className="btn" onClick={handleReset}>🔄 重新开始</button>
            </div>
          </div>
          <div className="results-grid">
            {results.map((r, i) => <ResultCard key={i} result={r} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}
