/**
 * 图片处理核心工具
 * 所有操作在浏览器本地完成，不上传到任何服务器
 */

// 支持的输出格式
export const OUTPUT_FORMATS = {
  jpeg: { label: 'JPG', mime: 'image/jpeg', ext: '.jpg' },
  png: { label: 'PNG', mime: 'image/png', ext: '.png' },
  webp: { label: 'WebP', mime: 'image/webp', ext: '.webp' },
}

// 预设尺寸
export const PRESET_SIZES = [
  { label: '自定义', value: 'custom' },
  { label: '微信头像 (640×640)', value: '640x640' },
  { label: '公众号封面 (900×383)', value: '900x383' },
  { label: '小红书封面 (1080×1440)', value: '1080x1440' },
  { label: '抖音封面 (1080×1920)', value: '1080x1920' },
  { label: '淘宝主图 (800×800)', value: '800x800' },
  { label: '微博配图 (1080×1080)', value: '1080x1080' },
  { label: 'Instagram (1080×1080)', value: '1080x1080_ig' },
  { label: '网页横幅 (1920×600)', value: '1920x600' },
  { label: 'A4打印 (2480×3508)', value: '2480x3508' },
]

/**
 * 读取文件为Image对象
 */
export function readFileAsImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}

/**
 * 压缩图片
 * @param {File} file - 原始文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<{blob: Blob, width: number, height: number}>}
 */
export async function compressImage(file, options = {}) {
  const {
    quality = 0.8,
    maxWidth = null,
    maxHeight = null,
    outputFormat = null,
  } = options

  const img = await readFileAsImage(file)
  let { naturalWidth: width, naturalHeight: height } = img

  // 计算缩放尺寸
  if (maxWidth && width > maxWidth) {
    height = Math.round(height * (maxWidth / width))
    width = maxWidth
  }
  if (maxHeight && height > maxHeight) {
    width = Math.round(width * (maxHeight / height))
    height = maxHeight
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  const format = outputFormat || detectFormat(file.type)
  const mime = OUTPUT_FORMATS[format]?.mime || 'image/jpeg'

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve({ blob, width, height, format }),
      mime,
      quality
    )
  })
}

/**
 * 调整图片尺寸
 */
export async function resizeImage(file, targetWidth, targetHeight, options = {}) {
  const { keepAspectRatio = true, outputFormat = null } = options
  const img = await readFileAsImage(file)

  let width = targetWidth
  let height = targetHeight

  if (keepAspectRatio) {
    const ratio = Math.min(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight)
    width = Math.round(img.naturalWidth * ratio)
    height = Math.round(img.naturalHeight * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  const format = outputFormat || detectFormat(file.type)
  const mime = OUTPUT_FORMATS[format]?.mime || 'image/jpeg'

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve({ blob, width, height, format }),
      mime,
      0.92
    )
  })
}

/**
 * 格式转换
 */
export async function convertFormat(file, targetFormat) {
  return compressImage(file, { outputFormat: targetFormat, quality: 0.92 })
}

/**
 * 检测格式
 */
function detectFormat(mimeType) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  return 'jpeg'
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 计算压缩率
 */
export function compressionRatio(original, compressed) {
  if (original === 0) return 0
  return Math.round((1 - compressed / original) * 100)
}

/**
 * 下载文件
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 批量下载为ZIP（使用简单逐个下载）
 */
export function downloadAll(results) {
  results.forEach((result, index) => {
    setTimeout(() => {
      const ext = OUTPUT_FORMATS[result.format]?.ext || '.jpg'
      const baseName = result.originalName.replace(/\.[^.]+$/, '')
      downloadBlob(result.blob, `${baseName}_${result.format}${ext}`)
    }, index * 200)
  })
}
