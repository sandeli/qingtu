import { useState, useRef, useCallback } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']

/**
 * 文件拖拽/选择区域
 */
export default function FileDropZone({ onFiles, multiple = true, maxFiles = 50 }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)
  const dragCount = useRef(0)

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter(f => ACCEPTED_TYPES.includes(f.type))
    if (files.length === 0) return
    if (!multiple) {
      onFiles([files[0]])
    } else {
      onFiles(files.slice(0, maxFiles))
    }
  }, [onFiles, multiple, maxFiles])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCount.current++
    setDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCount.current--
    if (dragCount.current === 0) setDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    dragCount.current = 0
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <div className="dropzone-content">
        <span className="dropzone-icon">🗂️</span>
        <p className="dropzone-title">拖拽图片到这里，或点击选择文件</p>
        <p className="dropzone-hint">支持 PNG / JPG / WebP / GIF / BMP{multiple ? `，最多 ${maxFiles} 张` : ''}</p>
      </div>
    </div>
  )
}
