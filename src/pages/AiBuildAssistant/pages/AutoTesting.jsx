import React, { useState, useEffect } from 'react';
import { mockTestResults, accuracyTrend, testSourceStats, knowledgeTestCases, workflowTestCases, batchTestCases } from '../data/mockData';
import { fetchAgentList, fetchAgentDetail, fetchKnowledgeSpaces } from '../services/agentApi';
import { exportSessions } from '../services/qiyuApi';

export default function AutoTesting() {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [targetAccuracy, setTargetAccuracy] = useState(85);
  const [maxRounds, setMaxRounds] = useState(5);
  const [testGenerated, setTestGenerated] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testDone, setTestDone] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [showDetail, setShowDetail] = useState(null);
  const [selectedSources, setSelectedSources] = useState(['history', 'knowledge', 'workflow']);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const [troubleshootError, setTroubleshootError] = useState('');
  const [troubleshootAnswer, setTroubleshootAnswer] = useState('');
  const [troubleshootAnalyzing, setTroubleshootAnalyzing] = useState(false);
  const [troubleshootResult, setTroubleshootResult] = useState(null);

  const [agentList, setAgentList] = useState([]);
  const [agentDetail, setAgentDetail] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sourceStats, setSourceStats] = useState(testSourceStats);

  const [editableHistory, setEditableHistory] = useState(() => batchTestCases.map((c, i) => ({ ...c, _id: i })));
  const [editableKnowledge, setEditableKnowledge] = useState(() => knowledgeTestCases.map((c, i) => ({ ...c, _id: i })));
  const [editableWorkflow, setEditableWorkflow] = useState(() => workflowTestCases.map((c, i) => ({ ...c, _id: i })));

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [loadingTestSet, setLoadingTestSet] = useState(false);

  const startEdit = (row) => {
    setEditingRowId(row._id);
    setEditingValues({ question: row.question, expected: row.expected });
  };
  const saveEdit = (setter, index) => {
    setter(prev => prev.map((row, i) => i === index ? { ...row, ...editingValues } : row));
    setEditingRowId(null);
    setEditingValues({});
  };
  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingValues({});
  };
  const addRow = (setter, defaultType) => {
    const newRow = { _id: Date.now(), question: '', expected: '', type: defaultType };
    setter(prev => [...prev, newRow]);
    setEditingRowId(newRow._id);
    setEditingValues({ question: '', expected: '' });
  };
  const deleteRow = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    loadAgentList();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      setLoadingTestSet(true);
      loadAgentDetail(selectedAgent);
      const timer = setTimeout(() => setLoadingTestSet(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedAgent]);

  useEffect(() => {
    setExpandedStep(null);
    setTroubleshootError('');
    setTroubleshootAnswer('');
    setTroubleshootAnalyzing(false);
    setTroubleshootResult(null);
  }, [showDetail]);

  async function loadAgentList() {
    setLoadingAgents(true);
    setApiError(null);
    try {
      const list = await Promise.race([
        fetchAgentList(0),
        new Promise((_, reject) => setTimeout(() => reject(new Error('api_timeout')), 2000)),
      ]);
      if (list.length > 0) {
        setAgentList(list);
      } else {
        setAgentList([]);
        setApiError('Agent 列表为空，使用默认数据');
        fallbackToMock();
      }
    } catch (e) {
      console.warn('Agent 列表接口失败，降级到 mock 数据:', e.message);
      setApiError('接口不可达，使用默认数据');
      fallbackToMock();
    } finally {
      setLoadingAgents(false);
    }
  }

  async function loadAgentDetail(appId) {
    setLoadingDetail(true);
    try {
      const detail = await fetchAgentDetail(appId);
      if (detail) {
        setAgentDetail(detail);
        const knowledgeCount = (detail.ysKnowledgeList || []).length;
        const knowledgeDocCount = (detail.ysKnowledgeList || []).reduce((sum, k) => sum + (k.docCount || 0), 0);
        setSourceStats({
          history: { label: '历史对话', icon: '💬', cases: 120, desc: '从近30天对话中提取' },
          knowledge: {
            label: '知识库',
            icon: '📚',
            cases: knowledgeDocCount || 65,
            desc: `从${knowledgeCount}个知识空间${knowledgeDocCount || '65篇'}文档中生成`,
          },
          workflow: { label: '工作流', icon: '🔀', cases: 45, desc: '从工作流节点路径中抽离' },
        });
      }
    } catch (e) {
      console.warn('Agent 详情接口失败:', e.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  function fallbackToMock() {
    setAgentList([
      { appId: 1001, appName: '换货退差助手' },
      { appId: 1002, appName: '物流查询助手' },
      { appId: 1003, appName: '退款进度助手' },
      { appId: 1004, appName: '优惠活动咨询助手' },
      { appId: 1005, appName: '商品选购顾问' },
      { appId: 1006, appName: '会员积分助手' },
      { appId: 1007, appName: '质量问题投诉助手' },
      { appId: 1008, appName: '发票开具助手' },
    ]);
    setSourceStats(testSourceStats);
  }

  const getCounts = () => {
    let positive = 0, adversarial = 0, boundary = 0, pathCoverage = 0;
    if (selectedSources.includes('history')) { positive += 80; adversarial += 20; boundary += 20; }
    if (selectedSources.includes('knowledge')) { positive += 30; adversarial += 25; boundary += 10; }
    if (selectedSources.includes('workflow')) { positive += 20; adversarial += 5; pathCoverage += 20; }
    return { positive, adversarial, boundary, pathCoverage };
  };

  const getTotal = () => {
    return selectedSources.reduce((sum, key) => sum + (sourceStats[key]?.cases || 0), 0);
  };

  const toggleSource = (key) => {
    setSelectedSources(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  const generateTests = () => {
    setGenerating(true);
    setTestGenerated(false);
    setGenStep('');
    const steps = [];
    if (selectedSources.includes('history')) steps.push('正在分析历史对话...');
    if (selectedSources.includes('knowledge')) steps.push('正在抽取知识库要点...');
    if (selectedSources.includes('workflow')) steps.push('正在遍历工作流路径...');
    steps.push('正在生成对抗用例...');

    steps.forEach((step, i) => {
      setTimeout(() => setGenStep(step), i * 600);
    });

    const doGenerate = async () => {
      if (selectedSources.includes('history')) {
        try {
          const end = Date.now();
          const start = end - 5 * 24 * 60 * 60 * 1000;
          await exportSessions(start, end, 0);
        } catch (e) {
          console.warn('历史会话导出失败，使用模拟数据:', e.message);
        }
      }
    };
    doGenerate();

    setTimeout(() => {
      setTestGenerated(true);
      setGenerating(false);
      setGenStep('');
    }, steps.length * 600 + 400);
  };

  const startTest = () => {
    setTesting(true);
    setTestDone(false);
    setTestProgress(0);
    const total = getTotal();
    const steps = [10, 25, 40, 55, 70, 85, 100];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setTestProgress(p);
        if (p === 100) {
          setTimeout(() => {
            setTesting(false);
            setTestDone(true);
            setCurrentRound(prev => Math.min(prev + 1, accuracyTrend.length - 1));
          }, 500);
        }
      }, (i + 1) * 600);
    });
  };

  const startOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      startTest();
    }, 2000);
  };

  const handleTroubleshootAnalyze = () => {
    if (!troubleshootError.trim()) return;
    setTroubleshootAnalyzing(true);
    setTroubleshootResult(null);
    setTimeout(() => {
      const r = mockTestResults.find(x => x.id === showDetail);
      const hint = r?.refusal === 'miss_refusal'
        ? '在拒识规则中补充该类选购问题关键词，如"推荐"、"好看"、"码数"等，并设置置信度阈值'
        : r?.tool === 'miss'
        ? '工具调用前需确保已获取必要参数（如订单号），建议在工具描述中添加前置条件校验'
        : '在提示词中增加相关场景的处理示例，明确说明期望的回复逻辑和格式';
      setTroubleshootResult(`根据错误原因「${troubleshootError.slice(0, 30)}」分析：\n1. ${hint}\n2. 参考正确答案：「${troubleshootAnswer.slice(0, 30) || '请填写正确答案'}」\n3. 预计优化后准确率提升 5~8%`);
      setTroubleshootAnalyzing(false);
    }, 2000);
  };

  const getCorrectnessTag = (v) => {
    const m = { correct: ['✅ 正确', 'tag-success'], partial: ['⚠️ 部分正确', 'tag-warning'], wrong: ['❌ 错误', 'tag-danger'] };
    const [label, cls] = m[v] || ['—', 'tag-gray'];
    return <span className={`tag ${cls}`}>{label}</span>;
  };
  const getRefusalTag = (v) => {
    const m = { correct_refusal: ['✅ 应拒且拒', 'tag-success'], miss_refusal: ['❌ 应拒未拒', 'tag-danger'], wrong_refusal: ['❌ 应答但拒', 'tag-warning'] };
    const [label, cls] = m[v] || ['—', 'tag-gray'];
    return <span className={`tag ${cls}`}>{label}</span>;
  };
  const getToolTag = (v) => {
    const m = { correct: ['✅', 'tag-success'], miss: ['❌ 未调用', 'tag-danger'], wrong_call: ['❌ 错误调用', 'tag-danger'] };
    const [label, cls] = m[v] || ['—', 'tag-gray'];
    return <span className={`tag ${cls}`}>{label}</span>;
  };

  const accuracy = currentRound < accuracyTrend.length ? accuracyTrend[currentRound].accuracy : 85;
  const counts = getCounts();
  const total = getTotal();

  return (
    <div>
      {/* 顶部配置 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4, display: 'block' }}>选择 Agent</label>
            <select className="select" style={{ width: 200 }} value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} disabled={loadingAgents}>
              {loadingAgents ? (
                <option>加载中...</option>
              ) : (
                <>
                  <option value="">请选择Agent</option>
                  {agentList.map(agent => (
                    <option key={agent.appId} value={agent.appId}>{agent.appName}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4, display: 'block' }}>目标准确率</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input className="input" type="number" style={{ width: 80 }} value={targetAccuracy} onChange={e => setTargetAccuracy(Number(e.target.value))} />
              <span style={{ fontSize: 14 }}>%</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4, display: 'block' }}>最大优化轮次</label>
            <input className="input" type="number" style={{ width: 80 }} value={maxRounds} onChange={e => setMaxRounds(Number(e.target.value))} />
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-outline" style={{ marginBottom: 0 }}>📤 导出报告</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* 左侧：测试集管理 */}
        <div style={{ flex: '0 0 300px' }}>
          <div className="card">
            <div className="card-header">
              <h3>测试集管理</h3>
            </div>
            <div className="card-body">
              {!selectedAgent ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 13 }}>请先选择 Agent</div>
                </div>
              ) : loadingTestSet ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 13, color: 'var(--primary)', marginBottom: 10 }}>正在加载测试集配置...</div>
                  <div className="progress-bar" style={{ height: 4, maxWidth: 160, margin: '0 auto' }}>
                    <div className="fill fill-primary" style={{ width: '70%', animation: 'pulse 1.2s infinite' }} />
                  </div>
                </div>
              ) : (
                <>
              {/* 加载中 */}
              {loadingDetail && (
                <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--gray-500)' }}>
                  正在加载 Agent 配置...
                </div>
              )}
              {/* 来源选择 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8, fontWeight: 500 }}>生成来源（可多选）</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(sourceStats).map(([key, src]) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 6, cursor: 'pointer', transition: 'all .15s',
                        background: selectedSources.includes(key) ? 'var(--primary-light)' : 'var(--gray-100)',
                        borderLeft: selectedSources.includes(key) ? '3px solid var(--primary)' : '3px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(key)}
                        onChange={() => toggleSource(key)}
                        style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: 16 }}>{src.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{src.label}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{src.cases}条</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{src.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>预计生成</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{total} 条</span>
                </div>
              </div>

              {/* 生成中状态 */}
              {generating && (
                <div className="fade-in" style={{ textAlign: 'center', padding: '12px 0', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>{genStep}</div>
                  <div className="progress-bar" style={{ height: 4, marginTop: 8 }}>
                    <div className="fill fill-primary" style={{ width: '60%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              )}

              {/* 已生成：用例分布 */}
              {testGenerated && !generating && (
                <div className="fade-in" style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8, fontWeight: 500 }}>用例分布</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: '正向验证', count: counts.positive, color: 'var(--success)' },
                      { label: '拒识/对抗', count: counts.adversarial, color: 'var(--danger)' },
                      { label: '边界测试', count: counts.boundary, color: 'var(--warning)' },
                      { label: '路径覆盖', count: counts.pathCoverage, color: 'var(--primary)' },
                    ].filter(item => item.count > 0).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                          {item.label}
                        </div>
                        <span style={{ fontWeight: 600 }}>{item.count} 条</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </>
              )}
            </div>
            {selectedAgent && !loadingTestSet && (
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={generateTests}
                disabled={generating || selectedSources.length === 0}
              >
                {generating ? '⏳ 生成中...' : testGenerated ? '🔄 重新生成' : '⚡ 生成测试集'}
              </button>
              {testGenerated && (
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPreview(true)}>
                  📋 预览 / 编辑
                </button>
              )}
            </div>
            )}
          </div>
        </div>

        {/* 右侧：测评结果 & 调优 */}
        <div style={{ flex: 1 }}>
          {/* 准确率趋势 */}
          {(testDone || currentRound > 0) && (
            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>准确率趋势</h3>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                    当前: 第 {currentRound} 轮 / 共 {maxRounds} 轮 · 目标 {targetAccuracy}%
                  </span>
                </div>
                <div className="accuracy-chart">
                  {accuracyTrend.slice(0, currentRound + 1).map((item, i) => (
                    <div key={i} className="accuracy-bar">
                      <div className="value" style={{ color: item.color }}>{item.accuracy}%</div>
                      <div className="bar" style={{ height: `${item.accuracy * 1.4}px`, background: item.color }} />
                      <div className="label">{item.round}</div>
                    </div>
                  ))}
                </div>
                {accuracy >= targetAccuracy && (
                  <div style={{ textAlign: 'center', padding: '8px 0', background: 'var(--success-light)', borderRadius: 6, color: '#065f46', fontWeight: 600, fontSize: 14 }}>
                    🎉 已达到目标准确率 {targetAccuracy}%！
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 测试进度 */}
          {testing && (
            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>正在对「{agentList.find(a => String(a.appId) === selectedAgent)?.appName || selectedAgent}」执行批量测评...</p>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>逐条发送测试用例，等待智能体回复并评估</p>
                <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto 12px' }}>
                  <div className="fill fill-primary" style={{ width: `${testProgress}%` }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>已完成 {Math.round(total * testProgress / 100)}/{total} 条 · 预计消耗 {Math.round(total * 1.4)} 积分</p>
              </div>
            </div>
          )}

          {/* 优化进度 */}
          {optimizing && (
            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>🔧 正在自动优化 Agent 配置...</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  分析错误模式 → 优化提示词 → 调整工具描述 → 收紧拒识策略
                </p>
              </div>
            </div>
          )}

          {/* 统计概览 */}
          {testDone && (
            <>
              <div className="stat-grid fade-in" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">总准确率</div>
                  <div className="stat-value" style={{ color: accuracy >= targetAccuracy ? 'var(--success)' : 'var(--warning)' }}>
                    {accuracy}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">拒识准确率</div>
                  <div className="stat-value">91%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">工具调用率</div>
                  <div className="stat-value">87%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">工作流完成率</div>
                  <div className="stat-value">93%</div>
                </div>
              </div>

              {/* 测试结果表格 */}
              <div className="card fade-in">
                <div className="card-header">
                  <h3>测评详情 ({mockTestResults.length} 条)</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={startTest} disabled={testing || optimizing}>
                      🔄 重新测评
                    </button>
                    {accuracy < targetAccuracy && (
                      <button className="btn btn-success btn-sm" onClick={startOptimize} disabled={testing || optimizing}>
                        ⚡ 一键优化
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ overflow: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>用户问题</th>
                        <th>回答正确性</th>
                        <th>拒识判定</th>
                        <th>工具调用</th>
                        <th>工作流</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTestResults.map(r => (
                        <tr key={r.id} style={r.correctness === 'wrong' ? { background: '#fef2f2' } : r.correctness === 'partial' ? { background: '#fffbeb' } : {}}>
                          <td>{r.id}</td>
                          <td style={{ maxWidth: 200 }}>{r.question}</td>
                          <td>{getCorrectnessTag(r.correctness)}</td>
                          <td>{getRefusalTag(r.refusal)}</td>
                          <td>{getToolTag(r.tool)}</td>
                          <td>{getToolTag(r.workflow)}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(showDetail === r.id ? null : r.id)}>
                              {showDetail === r.id ? '收起' : '详情'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 详情展开 */}
                {showDetail && (() => {
                  const r = mockTestResults.find(x => x.id === showDetail);
                  if (!r) return null;
                  return (
                    <div className="card-body fade-in" style={{ background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)' }}>
                      {/* Agent 实际回复 / 期望回复 */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>Agent 实际回复</h4>
                          <div style={{ background: '#fff', padding: 12, borderRadius: 6, fontSize: 13, border: '1px solid var(--gray-200)' }}>
                            {r.agentReply}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>期望回复</h4>
                          <div style={{ background: '#fff', padding: 12, borderRadius: 6, fontSize: 13, border: '1px solid var(--gray-200)' }}>
                            {r.expected}
                          </div>
                        </div>
                      </div>
                      {r.correctness !== 'correct' && (
                        <div style={{ marginBottom: 16, padding: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6 }}>
                          <strong style={{ fontSize: 13 }}>优化建议：</strong>
                          <span style={{ fontSize: 13 }}>
                            {r.refusal === 'miss_refusal' ? '在拒识策略中补充该类问题的关键词' :
                             r.tool === 'miss' ? '优化工具描述，使其更准确匹配该场景' :
                             '在提示词中增加相关场景的处理指引'}
                          </span>
                        </div>
                      )}

                      {/* AI 排障区域 */}
                      <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
                        {/* 排障头部 */}
                        <div style={{ background: '#fff', padding: '10px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>🔍 AI 排障</span>
                          <span style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>
                            Session: {r.sessionId}
                          </span>
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>查询调用步骤</button>
                            <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>查看七鱼日志</button>
                          </div>
                        </div>

                        {/* 三栏布局 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr' }}>
                          {/* 左栏：模型配置 */}
                          <div style={{ padding: '12px 14px', borderRight: '1px solid var(--gray-200)', background: '#fff' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 10 }}>模型配置</div>
                            {[
                              ['是否回复引用知识', r.modelConfig.replyWithKnowledge],
                              ['机器人会话是否生效', r.modelConfig.botSessionEnabled],
                              ['应答模式', r.modelConfig.replyMode],
                              ['访客端输出形式', r.modelConfig.outputFormat],
                              ['知识检索模式', r.modelConfig.retrievalMode],
                              ['语言类型', r.modelConfig.language],
                              ['绑定知识空间', r.modelConfig.knowledgeSpaces],
                              ['七鱼文档列表', r.modelConfig.docList],
                            ].map(([label, value]) => (
                              <div key={label} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 12, color: 'var(--gray-700)', wordBreak: 'break-all' }}>{value}</div>
                              </div>
                            ))}
                          </div>

                          {/* 中栏：调用链路 */}
                          <div style={{ padding: '12px 14px', borderRight: '1px solid var(--gray-200)', background: '#fff' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 10 }}>调用链路</div>
                            {(r.callSteps || []).map(step => {
                              const stepKey = `${r.id}-${step.num}`;
                              const isExpanded = expandedStep === stepKey;
                              const statusColor = step.status === 'ok' ? '#059669' : step.status === 'warning' ? '#d97706' : '#dc2626';
                              const statusBg = step.status === 'ok' ? '#f0fdf4' : step.status === 'warning' ? '#fffbeb' : '#fef2f2';
                              const statusIcon = step.status === 'ok' ? '✓' : step.status === 'warning' ? '⚠' : '✗';
                              return (
                                <div key={step.num} style={{ marginBottom: 8, border: `1px solid ${step.status !== 'ok' ? statusColor + '60' : 'var(--gray-200)'}`, borderRadius: 6, overflow: 'hidden' }}>
                                  <div
                                    style={{ padding: '8px 10px', cursor: 'pointer', background: isExpanded ? 'var(--gray-50)' : '#fff', display: 'flex', alignItems: 'center', gap: 8 }}
                                    onClick={() => setExpandedStep(isExpanded ? null : stepKey)}
                                  >
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.num}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.name}</div>
                                      <div style={{ fontSize: 11, marginTop: 2 }}>
                                        <span style={{ color: statusColor, background: statusBg, padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>{statusIcon} {step.statusText}</span>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                  {isExpanded && (
                                    <div style={{ padding: '8px 10px', borderTop: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                                      <div style={{ marginBottom: 6 }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>节点类型：</span>
                                        <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>{step.nodeType}</span>
                                      </div>
                                      <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>输入</div>
                                        <pre style={{ fontSize: 11, background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--gray-200)', margin: 0, overflow: 'auto', maxHeight: 80, color: 'var(--gray-700)' }}>{JSON.stringify(step.input, null, 2)}</pre>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>输出</div>
                                        <pre style={{ fontSize: 11, background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid var(--gray-200)', margin: 0, overflow: 'auto', maxHeight: 80, color: 'var(--gray-700)' }}>{JSON.stringify(step.output, null, 2)}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 右栏：排障分析 */}
                          <div style={{ padding: '12px 14px', background: '#fff' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 10 }}>排障分析</div>
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>请输入错误原因</div>
                              <textarea
                                style={{ width: '100%', height: 72, padding: '6px 8px', fontSize: 12, border: '1px solid #f87171', borderRadius: 6, resize: 'none', outline: 'none', boxSizing: 'border-box', color: 'var(--gray-700)', fontFamily: 'inherit' }}
                                placeholder="描述该用例的错误原因..."
                                value={troubleshootError}
                                onChange={e => setTroubleshootError(e.target.value)}
                              />
                            </div>
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>请输入正确答案</div>
                              <textarea
                                style={{ width: '100%', height: 72, padding: '6px 8px', fontSize: 12, border: '1px solid var(--gray-200)', borderRadius: 6, resize: 'none', outline: 'none', boxSizing: 'border-box', color: 'var(--gray-700)', fontFamily: 'inherit' }}
                                placeholder="填写期望的正确回答..."
                                value={troubleshootAnswer}
                                onChange={e => setTroubleshootAnswer(e.target.value)}
                              />
                            </div>
                            <button
                              className="btn btn-primary"
                              style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                              onClick={handleTroubleshootAnalyze}
                              disabled={troubleshootAnalyzing || !troubleshootError.trim()}
                            >
                              {troubleshootAnalyzing ? '⏳ 分析中...' : '开始分析'}
                            </button>
                            {troubleshootAnalyzing && (
                              <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--primary-light)', borderRadius: 6, fontSize: 12, color: 'var(--primary)', textAlign: 'center' }}>
                                正在分析调用链路，定位问题根因...
                              </div>
                            )}
                            {troubleshootResult && !troubleshootAnalyzing && (
                              <div className="fade-in" style={{ marginTop: 10, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 6 }}>分析结果</div>
                                <pre style={{ fontSize: 12, color: '#047857', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>{troubleshootResult}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* 空状态 */}
          {!testDone && !testing && !optimizing && currentRound === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="icon">🧪</div>
                <p>选择来源生成测试集，支持多来源对抗训练</p>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 8 }}>
                  从历史对话提取 + 知识库边界试探 + 工作流路径覆盖 → 批量测评 → AI 打标 → 一键优化
                </p>
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          {testGenerated && !testDone && !testing && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              {!selectedAgent ? (
                <div style={{ padding: '16px 24px', background: 'var(--gray-50)', borderRadius: 8, border: '1px dashed var(--gray-300)' }}>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 500 }}>请先在顶部选择要测试的智能体</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                    将对 <strong style={{ color: 'var(--primary)' }}>{agentList.find(a => String(a.appId) === selectedAgent)?.appName || selectedAgent}</strong> 执行批量测评
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={startTest}>
                    🚀 开始测评
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 预览弹框 */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPreview(false)}>
          <div style={{ background: '#fff', borderRadius: 12, width: '80%', maxWidth: 900, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>测试集预览 · {total} 条用例</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPreview(false)}>关闭</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
              {selectedSources.includes('history') && (
                <div>
                  <div style={{ padding: '12px 24px', background: 'var(--gray-50)', fontWeight: 600, fontSize: 13, color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 1 }}>
                    💬 历史对话来源 · {editableHistory.length} 条
                  </div>
                  <table className="data-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr><th style={{ width: 50 }}>#</th><th>用户问题</th><th>期望行为</th><th style={{ width: 80 }}>类型</th><th style={{ width: 100 }}>操作</th></tr>
                    </thead>
                    <tbody>
                      {editableHistory.map((c, i) => {
                        const isEditing = editingRowId === c._id;
                        return (
                          <tr key={c._id} style={{ background: isEditing ? '#f0f7ff' : undefined }}>
                            <td>{i + 1}</td>
                            <td>{isEditing ? <input autoFocus value={editingValues.question} onChange={e => setEditingValues(v => ({ ...v, question: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.question || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td>{isEditing ? <input value={editingValues.expected} onChange={e => setEditingValues(v => ({ ...v, expected: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.expected || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td><span className="tag tag-success">正向</span></td>
                            <td>
                              {isEditing ? (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => saveEdit(setEditableHistory, i)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>保存</button>
                                  <button onClick={cancelEdit} style={{ border: 'none', background: 'none', color: '#8c8c8c', cursor: 'pointer', fontSize: 12, padding: 0 }}>取消</button>
                                </span>
                              ) : (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => startEdit(c)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>编辑</button>
                                  <button onClick={() => deleteRow(setEditableHistory, i)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, padding: 0 }}>删除</button>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '10px 24px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => addRow(setEditableHistory, '正向验证')}>+ 添加用例</button>
                  </div>
                </div>
              )}
              {selectedSources.includes('knowledge') && (
                <div>
                  <div style={{ padding: '12px 24px', background: 'var(--gray-50)', fontWeight: 600, fontSize: 13, color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 1 }}>
                    📚 知识库来源 · {editableKnowledge.length} 条
                  </div>
                  <table className="data-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr><th style={{ width: 50 }}>#</th><th>用户问题</th><th>期望行为</th><th style={{ width: 80 }}>类型</th><th style={{ width: 100 }}>操作</th></tr>
                    </thead>
                    <tbody>
                      {editableKnowledge.map((c, i) => {
                        const isEditing = editingRowId === c._id;
                        return (
                          <tr key={c._id} style={{ background: isEditing ? '#f0f7ff' : undefined }}>
                            <td>{i + 1}</td>
                            <td>{isEditing ? <input autoFocus value={editingValues.question} onChange={e => setEditingValues(v => ({ ...v, question: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.question || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td>{isEditing ? <input value={editingValues.expected} onChange={e => setEditingValues(v => ({ ...v, expected: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.expected || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td><span className={`tag ${c.type === '对抗用例' ? 'tag-danger' : c.type === '边界试探' ? 'tag-warning' : 'tag-success'}`}>{c.type}</span></td>
                            <td>
                              {isEditing ? (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => saveEdit(setEditableKnowledge, i)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>保存</button>
                                  <button onClick={cancelEdit} style={{ border: 'none', background: 'none', color: '#8c8c8c', cursor: 'pointer', fontSize: 12, padding: 0 }}>取消</button>
                                </span>
                              ) : (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => startEdit(c)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>编辑</button>
                                  <button onClick={() => deleteRow(setEditableKnowledge, i)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, padding: 0 }}>删除</button>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '10px 24px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => addRow(setEditableKnowledge, '正向验证')}>+ 添加用例</button>
                  </div>
                </div>
              )}
              {selectedSources.includes('workflow') && (
                <div>
                  <div style={{ padding: '12px 24px', background: 'var(--gray-50)', fontWeight: 600, fontSize: 13, color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 1 }}>
                    🔀 工作流来源 · {editableWorkflow.length} 条
                  </div>
                  <table className="data-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr><th style={{ width: 50 }}>#</th><th>用户问题</th><th>期望行为</th><th style={{ width: 80 }}>类型</th><th style={{ width: 100 }}>操作</th></tr>
                    </thead>
                    <tbody>
                      {editableWorkflow.map((c, i) => {
                        const isEditing = editingRowId === c._id;
                        return (
                          <tr key={c._id} style={{ background: isEditing ? '#f0f7ff' : undefined }}>
                            <td>{i + 1}</td>
                            <td>{isEditing ? <input autoFocus value={editingValues.question} onChange={e => setEditingValues(v => ({ ...v, question: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.question || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td>{isEditing ? <input value={editingValues.expected} onChange={e => setEditingValues(v => ({ ...v, expected: e.target.value }))} style={{ width: '100%', padding: '2px 4px', border: '1px solid #91caff', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} /> : (c.expected || <span style={{ color: '#bfbfbf' }}>未填写</span>)}</td>
                            <td><span className={`tag ${c.type === '对抗用例' ? 'tag-danger' : c.type === '路径覆盖' ? 'tag-success' : 'tag-warning'}`}>{c.type}</span></td>
                            <td>
                              {isEditing ? (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => saveEdit(setEditableWorkflow, i)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>保存</button>
                                  <button onClick={cancelEdit} style={{ border: 'none', background: 'none', color: '#8c8c8c', cursor: 'pointer', fontSize: 12, padding: 0 }}>取消</button>
                                </span>
                              ) : (
                                <span style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => startEdit(c)} style={{ border: 'none', background: 'none', color: '#1677ff', cursor: 'pointer', fontSize: 12, padding: 0 }}>编辑</button>
                                  <button onClick={() => deleteRow(setEditableWorkflow, i)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, padding: 0 }}>删除</button>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ padding: '10px 24px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => addRow(setEditableWorkflow, '路径覆盖')}>+ 添加用例</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
