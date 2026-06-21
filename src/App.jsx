import { useState } from 'react'
import CompressTool from './components/CompressTool'
import ConvertTool from './components/ConvertTool'
import ResizeTool from './components/ResizeTool'
import './styles/index.css'

const TOOLS = [
  { id: 'compress', label: '图片压缩', icon: '🗜️', desc: '压缩图片体积，支持自定义质量' },
  { id: 'convert', label: '格式转换', icon: '🔄', desc: 'PNG / JPG / WebP 互转' },
  { id: 'resize', label: '调整尺寸', icon: '📐', desc: '调整图片大小，内置常用尺寸' },
]

function App() {
  const [activeTool, setActiveTool] = useState('compress')

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🖼️</span>
            <h1>轻图</h1>
            <span className="tagline">免费在线图片工具</span>
          </div>
          <nav className="tool-nav">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                className={`nav-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                <span className="nav-icon">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 工具说明 */}
      <section className="hero">
        <h2>
          {TOOLS.find(t => t.id === activeTool)?.icon}{' '}
          {TOOLS.find(t => t.id === activeTool)?.label}
        </h2>
        <p>{TOOLS.find(t => t.id === activeTool)?.desc} · 完全本地处理 · 无需上传 · 保护隐私</p>
      </section>

      {/* 工具主体 */}
      <main className="main">
        {activeTool === 'compress' && <CompressTool />}
        {activeTool === 'convert' && <ConvertTool />}
        {activeTool === 'resize' && <ResizeTool />}
      </main>

      {/* 底部特性 */}
      <section className="features">
        <div className="feature">
          <span className="feature-icon">🔒</span>
          <h3>隐私安全</h3>
          <p>所有处理在浏览器本地完成，图片不会上传到任何服务器</p>
        </div>
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <h3>极速处理</h3>
          <p>利用浏览器原生能力，批量处理多张图片速度飞快</p>
        </div>
        <div className="feature">
          <span className="feature-icon">💰</span>
          <h3>完全免费</h3>
          <p>所有功能免费使用，不限次数，不限数量，无水印</p>
        </div>
        <div className="feature">
          <span className="feature-icon">📱</span>
          <h3>多端适配</h3>
          <p>手机、平板、电脑都能用，随时随地处理图片</p>
        </div>
      </section>

      <footer className="footer">
        <p>© <span id="year">2026</span> 轻图 - 😎TaoGe · <span style="color: #000000; font-weight: bold;">所有处理在本地完成，保护您的隐私</span></p>

<script>
    // 这段脚本会自动获取当前的实际年份，并替换掉上面 id="year" 里的文字
    document.getElementById('year').textContent = new Date().getFullYear();
</script>
      </footer>
    </div>
  )
}

export default App
