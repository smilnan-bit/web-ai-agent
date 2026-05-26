import React, { useState } from 'react';
import { mockScenes } from '../data/mockData';
import { saveAgent } from '../services/agentApi';

function buildAgentPayload(scene) {
  const sampleQs = scene.sampleQuestions.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n');
  const prompt = [
    `## 角色定位`,
    `你是一名专业的智能客服专员，负责处理"${scene.name}"相关业务，态度友好、专业高效。`,
    ``,
    `## 能力范围`,
    scene.capabilities.join('、'),
    ``,
    `## 代表性问题`,
    sampleQs,
    ``,
    `## 推荐工具`,
    scene.recommendedTools.join('、'),
    ``,
    `## 拒识规则`,
    `仅回答与"${scene.name}"相关的问题，其他问题请引导用户联系对应部门。`,
  ].join('\n');

  return {
    bizType: 0,
    appName: scene.name,
    appDesc: scene.description,
    prompt,
    sessionSetting: {
      contextRound: scene.capabilities.includes('流程办理') ? 10 : 6,
      model: 'qwen3-max',
    },
    modelSetting: {
      temperature: scene.capabilities.includes('工具调用') ? 0.2 : 0.3,
    },
  };
}

export default function SceneMining({ onCreateScene }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedScene, setSelectedScene] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [dataSource, setDataSource] = useState('all');
  const [foundCount, setFoundCount] = useState(0);

  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null); // { type: 'success'|'error', text: string }
  const [batchCreating, setBatchCreating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null); // { done, total, successCount }

  const handleCreate = (scene) => {
    const sampleQs = scene.sampleQuestions.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n');
    const structuredMsg = [
      `我想基于以下场景信息创建一个 Agent：`,
      ``,
      `**场景名称：** ${scene.name}`,
      ``,
      `**场景描述：** ${scene.description}`,
      ``,
      `**代表性问题：**`,
      sampleQs,
      ``,
      `**人工历史回复样本：**`,
      scene.humanReplySample,
    ].join('\n');
    if (onCreateScene) onCreateScene(structuredMsg);
  };

  const handleBatchCreate = async () => {
    setBatchCreating(true);
    setBatchProgress({ done: 0, total: mockScenes.length, successCount: 0 });
    setCreateMsg(null);
    let successCount = 0;
    for (let i = 0; i < mockScenes.length; i++) {
      try {
        await saveAgent(buildAgentPayload(mockScenes[i]));
        successCount++;
      } catch (e) {
        // 单条失败不中断，继续下一条
        console.warn(`场景「${mockScenes[i].name}」创建失败:`, e.message);
      }
      setBatchProgress({ done: i + 1, total: mockScenes.length, successCount });
    }
    setBatchCreating(false);
    setCreateMsg({
      type: successCount === mockScenes.length ? 'success' : 'error',
      text: `批量创建完成：${successCount}/${mockScenes.length} 个 Agent 创建成功，可在应用中心查看`,
    });
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);
    setProgress(0);
    setFoundCount(0);
    setSelectedScene(null);

    const steps = [
      { p: 15, count: 0 },
      { p: 30, count: 1 },
      { p: 50, count: 2 },
      { p: 70, count: 3 },
      { p: 85, count: 4 },
      { p: 100, count: 5 },
    ];
    steps.forEach(({ p, count }, i) => {
      setTimeout(() => {
        setProgress(p);
        setFoundCount(count);
        if (p === 100) {
          setTimeout(() => {
            setAnalyzing(false);
            setAnalyzed(true);
            setSelectedScene(mockScenes[0]);
          }, 500);
        }
      }, (i + 1) * 800);
    });
  };

  const getDifficultyTag = (d) => {
    const map = { '简单': 'tag-success', '中等': 'tag-warning', '复杂': 'tag-danger' };
    return map[d] || 'tag-gray';
  };

  return (
    <div>
      {/* 筛选器 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4, display: 'block' }}>时间范围</label>
            <select className="select" style={{ width: 150 }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              <option value="7">近 7 天</option>
              <option value="14">近 14 天</option>
              <option value="30">近 30 天</option>
              <option value="90">近 90 天</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4, display: 'block' }}>数据来源</label>
            <select className="select" style={{ width: 180 }} value={dataSource} onChange={e => setDataSource(e.target.value)}>
              <option value="all">全部对话</option>
              <option value="robot">仅机器人对话</option>
              <option value="human">仅人工对话</option>
            </select>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary btn-lg" onClick={startAnalysis} disabled={analyzing} style={{ marginTop: 18 }}>
            {analyzing ? '分析中...' : '🔍 开始场景分析'}
          </button>
        </div>
      </div>

      {/* 分析进度 */}
      {analyzing && (
        <div className="card fade-in" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>正在分析历史对话数据...</p>
            <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto 12px' }}>
              <div className="fill fill-primary" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              已发现 <strong style={{ color: 'var(--primary)' }}>{foundCount}</strong> 个潜在场景 · 进度 {progress}%
            </p>
          </div>
        </div>
      )}

      {/* 未分析空状态 */}
      {!analyzing && !analyzed && (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📊</div>
            <p>点击「开始场景分析」，AI 将自动从历史对话中挖掘适合 Agent 处理的业务场景</p>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 8 }}>
              分析范围：NLP 未命中 / 转人工 / 差评 / 低置信度对话
            </p>
          </div>
        </div>
      )}

      {/* 分析结果 */}
      {analyzed && (
        <div style={{ display: 'flex', gap: 20 }} className="fade-in">
          {/* 左侧：场景卡片列表 */}
          <div style={{ flex: '0 0 380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>推荐场景（{mockScenes.length}个）</h3>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>按评分排序</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mockScenes.map(scene => (
                <div
                  key={scene.id}
                  className={`scene-card ${selectedScene?.id === scene.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedScene(scene); setCreateMsg(null); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h4>{scene.name}</h4>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{scene.score}</span>
                  </div>
                  <p>{scene.description}</p>
                  <div className="meta">
                    <span className={`tag ${getDifficultyTag(scene.difficulty)}`}>{scene.difficulty}</span>
                    <span className="tag tag-gray">💬 {scene.dialogCount}条对话</span>
                    <span className="tag tag-primary">覆盖率 {scene.coverage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：详情面板 */}
          <div style={{ flex: 1 }}>
            {selectedScene ? (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3>{selectedScene.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{selectedScene.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCreate(selectedScene)}
                      disabled={batchCreating}
                    >
                      一键创建
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleBatchCreate}
                      disabled={creating || batchCreating}
                    >
                      {batchCreating
                        ? `批量创建中 ${batchProgress?.done || 0}/${batchProgress?.total || 0}`
                        : '批量创建'}
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {/* 统计指标 */}
                  <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                    <div className="stat-card">
                      <div className="stat-label">对话量</div>
                      <div className="stat-value" style={{ fontSize: 24 }}>{selectedScene.dialogCount.toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">预估覆盖率</div>
                      <div className="stat-value" style={{ fontSize: 24, color: 'var(--success)' }}>{selectedScene.coverage}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">综合评分</div>
                      <div className="stat-value" style={{ fontSize: 24, color: 'var(--primary)' }}>{selectedScene.score}/100</div>
                    </div>
                  </div>

                  {/* 代表性问题 */}
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>代表性问题</h4>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, marginBottom: 20 }}>
                    {selectedScene.sampleQuestions.map((q, i) => (
                      <div key={i} style={{ padding: '6px 0', borderBottom: i < selectedScene.sampleQuestions.length - 1 ? '1px solid var(--gray-200)' : 'none', fontSize: 13 }}>
                        <span style={{ color: 'var(--gray-400)', marginRight: 8 }}>{i + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </div>

                  {/* 人工回复样本 */}
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>人工历史回复样本</h4>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 20 }}>
                    {selectedScene.humanReplySample}
                  </div>

                  {/* 推荐配置 */}
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>推荐 Agent 配置</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {selectedScene.capabilities.map((c, i) => (
                      <span key={i} className="tag tag-primary">{c}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                    <p style={{ marginBottom: 4 }}>
                      <strong>推荐工具：</strong>{selectedScene.recommendedTools.join('、')}
                    </p>
                    <p>
                      <strong>工作流：</strong>{selectedScene.needWorkflow ? '✅ 建议配置（流程类场景）' : '⏭️ 无需工作流（问答类场景）'}
                    </p>
                  </div>

                  {/* 创建结果提示 */}
                  {createMsg && (
                    <div style={{
                      marginTop: 16,
                      padding: '10px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      background: createMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                      border: `1px solid ${createMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                      color: createMsg.type === 'success' ? '#065f46' : '#991b1b',
                    }}>
                      {createMsg.type === 'success' ? '✅ ' : '❌ '}{createMsg.text}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <div className="icon">👈</div>
                  <p>选择左侧场景查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
