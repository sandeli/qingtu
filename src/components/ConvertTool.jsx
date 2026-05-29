import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import ResultCard from './ResultCard'
import { convertFormat, formatSize, downloadAll, OUTPUT_FORMATS } from '../utils/imageProcessor'

export default function ConvertTool() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [targetFormat, setTargetFormat] = useState('webp')

  const handleFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
    setResults([])
  }, [])

  const handleConvert = async () => {
    if (files.length === 0) return
    setProcessing(true)
    setProgress({ current: 0, total: files.length })
    const newResults = []

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await convertFormat(files[i], targetFormat)
        newResults.push({
          ...result,
          originalName: files[i].name,
          originalSize: files[i].size,
        })
      } catch (err) {
        console.error(`转换失败: ${files[i].name}`, err)
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
      {/* 格式选择 */}
      <div className="settings-panel">
        <div className="setting-group">
          <label>目标格式</label>
          <div className="format-options">
            {Object.entries(OUTPUT_FORMATS).map(([key, fmt]) => (
              <button
                key={key}
                className={`format-btn ${targetFormat === key ? 'active' : ''}`}
                onClick={() => setTargetFormat(key)}
              >
                <span className="format-label">{fmt.label}</span>
                <span className="format-ext">{fmt.ext}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="format-tips">
          <div className="tip">
            <strong>WebP</strong> - 推荐用于网页，体积比JPG小25-35%
          </div>
          <div className="tip">
            <strong>PNG</strong> - 支持透明背景，适合图标和截图
          </div>
          <div className="tip">
            <strong>JPG</strong> - 兼容性最好，适合照片
          </div>
        </div>
      </div>

      {/* 文件选择 */}
      {files.length === 0 ? (
        <FileDropZone onFiles={handleFiles} />
      ) : (
        <div className="files-preview">
          <div className="files-header">
            <span>已选择 {files.length} 个文件</span>
            <div className="files-actions">
              <button className="btn btn-sm btn-danger" onClick={handleReset}>🗑️ 清空</button>
            </div>
          </div>
          <div className="files-list">
            {files.slice(0, 8).map((f, i) => (
              <div key={i} className="file-tag">{f.name} ({formatSize(f.size)})</div>
            ))}
            {files.length > 8 && <div className="file-tag more">...还有 {files.length - 8} 个</div>}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {files.length > 0 && !processing && results.length === 0 && (
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" onClick={handleConvert}>
            🔄 转换为 {OUTPUT_FORMATS[targetFormat]?.label} ({files.length} 张)
          </button>
        </div>
      )}

      {/* 进度 */}
      {processing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
          <p className="progress-text">正在转换 {progress.current} / {progress.total}...</p>
        </div>
      )}

      {/* 结果 */}
      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>✅ 转换完成</h3>
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
