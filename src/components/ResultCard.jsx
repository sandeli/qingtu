import { formatSize, compressionRatio, downloadBlob, OUTPUT_FORMATS } from '../utils/imageProcessor'

/**
 * 单张图片处理结果卡片
 */
export default function ResultCard({ result, index }) {
  const ext = OUTPUT_FORMATS[result.format]?.ext || '.jpg'
  const baseName = result.originalName.replace(/\.[^.]+$/, '')
  const fileName = `${baseName}_${result.format}${ext}`
  const ratio = compressionRatio(result.originalSize, result.blob.size)
  const isSmaller = result.blob.size < result.originalSize

  const handleDownload = () => {
    downloadBlob(result.blob, fileName)
  }

  return (
    <div className="result-card">
      <div className="result-preview">
        <img
          src={URL.createObjectURL(result.blob)}
          alt={result.originalName}
          onLoad={(e) => URL.revokeObjectURL(e.target.src)}
        />
      </div>
      <div className="result-info">
        <p className="result-name" title={result.originalName}>{result.originalName}</p>
        <div className="result-stats">
          <span className="result-size">{formatSize(result.originalSize)}</span>
          <span className="result-arrow">→</span>
          <span className={`result-new-size ${isSmaller ? 'smaller' : 'bigger'}`}>
            {formatSize(result.blob.size)}
          </span>
          {ratio !== 0 && (
            <span className={`result-ratio ${isSmaller ? 'good' : 'bad'}`}>
              {isSmaller ? '↓' : '↑'}{Math.abs(ratio)}%
            </span>
          )}
        </div>
        <p className="result-dimensions">{result.width} × {result.height}px · {result.format.toUpperCase()}</p>
      </div>
      <button className="download-btn" onClick={handleDownload}>
        ⬇️ 下载
      </button>
    </div>
  )
}
