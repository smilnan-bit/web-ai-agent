import React, { useState } from 'react';
import SceneMining from './pages/SceneMining';
import ConversationalBuild from './pages/ConversationalBuild';
import AutoTesting from './pages/AutoTesting';
import './ai-build.css';

const navItems = [
  { key: 'scene', icon: '📊', label: '场景挖掘', badge: null },
  { key: 'build', icon: '💬', label: '智能搭建助手', badge: 'NEW' },
  { key: 'test', icon: '🧪', label: '自动测试与调优', badge: null },
];

const otherNavItems = [
  { key: 'agents', icon: '🤖', label: 'Agent 应用' },
  { key: 'tools', icon: '🔧', label: '工具管理' },
  { key: 'workflows', icon: '🔀', label: '工作流' },
  { key: 'knowledge', icon: '📚', label: '知识库' },
  { key: 'stats', icon: '📈', label: '数据统计' },
];

const pageConfig = {
  scene: { title: '场景挖掘', desc: '从历史对话中自动发现适合 Agent 处理的业务场景' },
  build: { title: '智能搭建助手', desc: '通过 AI 对话引导，零门槛生成完整 Agent' },
  test: { title: '自动测试与调优', desc: '自动生成测试集、批量测评、AI 打标、自我迭代优化' },
};

export default function App() {
  const [activePage, setActivePage] = useState('build');
  const [pendingSceneMessage, setPendingSceneMessage] = useState(null);

  const config = pageConfig[activePage];

  return (
    <div className="ai-build-root" style={{ minHeight: '100vh', display: 'flex', background: 'var(--gray-100)' }}>
      {/* 侧边栏 */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">AI</div>
          <div>
            <h1>云商 Agent 平台</h1>
            <small>网易七鱼智能客服</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">AI 搭建助手</div>
            {navItems.map(item => (
              <div
                key={item.key}
                className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                onClick={() => {
                if (item.key !== 'build') setPendingSceneMessage(null);
                setActivePage(item.key);
              }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">平台功能</div>
            {otherNavItems.map(item => (
              <div key={item.key} className="nav-item" style={{ opacity: 0.45, cursor: 'default' }}>
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--gray-200)', fontSize: 11, color: 'var(--gray-500)' }}>
          v11.6 · Agent 平台
        </div>
      </div>

      {/* 主内容区 */}
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2>{config.title}</h2>
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{config.desc}</div>
        </div>
        <div className="page-body">
          {activePage === 'scene' && (
            <SceneMining onCreateScene={(msg) => { setPendingSceneMessage(msg); setActivePage('build'); }} />
          )}
          {activePage === 'build' && <ConversationalBuild initialMessage={pendingSceneMessage} />}
          {activePage === 'test' && <AutoTesting />}
        </div>
      </div>
    </div>
  );
}
