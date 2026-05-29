import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import ResultCard from './ResultCard'
import { compressImage, formatSize, downloadAll, OUTPUT_FORMATS } from '../utils/imageProcessor'

export default function CompressTool() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [quality, setQuality] = useState(80)
  const [maxWidth, setMaxWidth] = useState('')
  const [outputFormat, setOutputFormat] = useState('original')

  const handleFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
    setResults([])
  }, [])

  const handleCompress = async () => {
    if (files.length === 0) return
    setProcessing(true)
    setProgress({ current: 0, total: files.length })
    const newResults = []

    for (let i = 0; i < files.length; i++) {
      try {
        const opts = {
          quality: quality / 100,
          outputFormat: outputFormat === 'original' ? null : outputFormat,
        }
        if (maxWidth) opts.maxWidth = parseInt(maxWidth)

        const result = await compressImage(files[i], opts)
        newResults.push({
          ...result,
          originalName: files[i].name,
          originalSize: files[i].size,
        })
      } catch (err) {
        console.error(`压缩失败: ${files[i].name}`, err)
      }
      setProgress({ current: i + 1, total: files.length })
    }

    setResults(newResults)
    setProcessing(false)
  }

  const handleDownloadAll = () => {
    downloadAll(results)
  }

  const handleReset = () => {
    setFiles([])
    setResults([])
    setProgress({ current: 0, total: 0 })
  }

  const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0)
  const totalCompressed = results.reduce((s, r) => s + r.blob.size, 0)

  return (
    <div className="tool-container">
      {/* 设置面板 */}
      <div className="settings-panel">
        <div className="setting-group">
          <label>压缩质量</label>
          <div className="quality-slider">
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
            />
            <span className="quality-value">{quality}%</span>
          </div>
          <div className="quality-hints">
            <span>体积小</span>
            <span>质量高</span>
          </div>
        </div>

        <div className="setting-group">
          <label>最大宽度 (可选)</label>
          <input
            type="number"
            placeholder="不限制"
            value={maxWidth}
            onChange={e => setMaxWidth(e.target.value)}
            className="input"
          />
          <span className="input-hint">像素，留空则保持原始尺寸</span>
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

      {/* 文件选择区 */}
      {files.length === 0 ? (
        <FileDropZone onFiles={handleFiles} />
      ) : (
        <div className="files-preview">
          <div className="files-header">
            <span>已选择 {files.length} 个文件</span>
            <div className="files-actions">
              <FileDropZone onFiles={handleFiles} multiple={false}>
                <button className="btn btn-sm">➕ 继续添加</button>
              </FileDropZone>
              <button className="btn btn-sm btn-danger" onClick={handleReset}>🗑️ 清空</button>
            </div>
          </div>
          <div className="files-list">
            {files.slice(0, 8).map((f, i) => (
              <div key={i} className="file-tag">
                {f.name} ({formatSize(f.size)})
              </div>
            ))}
            {files.length > 8 && <div className="file-tag more">...还有 {files.length - 8} 个文件</div>}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {files.length > 0 && !processing && results.length === 0 && (
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" onClick={handleCompress}>
            🗜️ 开始压缩 ({files.length} 张)
          </button>
        </div>
      )}

      {/* 进度 */}
      {processing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="progress-text">正在处理 {progress.current} / {progress.total}...</p>
        </div>
      )}

      {/* 结果 */}
      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ 处理完成</h3>
            <div className="results-summary">
              <span>总计: {formatSize(totalOriginal)} → {formatSize(totalCompressed)}</span>
              {totalOriginal > 0 && (
                <span className="total-ratio">
                  节省 {Math.round((1 - totalCompressed / totalOriginal) * 100)}%
                </span>
              )}
            </div>
            <div className="results-actions">
              <button className="btn btn-primary" onClick={handleDownloadAll}>
                ⬇️ 全部下载
              </button>
              <button className="btn" onClick={handleReset}>
                🔄 重新开始
              </button>
            </div>
          </div>
          <div className="results-grid">
            {results.map((r, i) => (
              <ResultCard key={i} result={r} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
