import React, { useState, useRef, useEffect } from 'react';
import { chatFlow, agentReplies, batchTestCases } from '../data/mockData';
import { saveAgent } from '../services/agentApi';
import WorkflowPreview from './WorkflowPreview';

const initialWorkflowNodes = [
  { id: 'start_1', type: 'start', data: { title: '进店咨询', content: '访客发起换货退差咨询' }, blocks: [] },
  { id: 'dialogue_locate', type: 'dialogue', data: { title: '定位订单', content: '对话节点 · 识别订单号/商品信息' } },
  {
    id: 'condition_scene', type: 'condition', data: { title: '场景判断', content: '判断咨询类型' },
    blocks: [
      { id: 'branch_repurchased', type: 'block', data: { title: '已重拍退差', content: '换货已重拍且咨询退差' }, blocks: [
        { id: 'tool_calc_diff', type: 'tool', data: { title: '核对换货差价金额', content: '调用订单差价核算API' } },
        { id: 'condition_amount', type: 'condition', data: { title: '金额核对', content: '判断金额是否一致' }, blocks: [
          { id: 'branch_amount_ok', type: 'block', data: { title: '金额一致', content: '核对无误' }, blocks: [
            { id: 'dialogue_guide_apply', type: 'dialogue', data: { title: '引导退差申请流程', content: '对话节点 · 指引客户操作' } },
          ] },
          { id: 'branch_amount_dispute', type: 'block', data: { title: '金额有异议', content: '客户对金额有疑问' }, blocks: [
            { id: 'dialogue_explain', type: 'dialogue', data: { title: '核算过程说明', content: '对话节点 · 解释差价计算' } },
          ] },
        ] },
      ] },
      { id: 'branch_pre_exchange', type: 'block', data: { title: '换货前咨询', content: '尚未换货，先咨询流程' }, blocks: [
        { id: 'dialogue_explain_flow', type: 'dialogue', data: { title: '换货流程说明', content: '对话节点 · 说明换货流程' } },
        { id: 'reply_guide', type: 'reply', data: { title: '发送换货流程指南', content: '回复节点 · 发送操作指南' } },
      ] },
    ],
  },
  { id: 'dialogue_other', type: 'dialogue', data: { title: '询问是否需要其它协助', content: '对话节点 · 确认还有无其他问题' } },
  { id: 'end_1', type: 'end', data: { title: '发送结束语', content: '结束会话' }, blocks: [] },
];

const previewData = {
  prompt: {
    role: '你是一名专业的售后客服专员，擅长处理换货重拍后的差价退还问题。服务态度友好、计算严谨，隶属于XX品牌客服团队。',
    skills: '1. 定位订单：识别客户的原订单和重拍订单信息\n2. 差价核算：计算换货差价（含多件多折活动折扣、颜色价格差异等）\n3. 退差引导：引导客户提交退差申请并核对申请金额\n4. 运费说明：说明换货重拍订单的运费退还规则\n5. 换货前咨询：未换货客户引导换货流程',
    refusal: '以下场景不在你的服务范围内，请统一回复"这个问题需要转给售前客服为您解答~"：\n- 商品选购建议\n- 价格与优惠咨询\n- 活动规则咨询（非退差相关）\n- 非售后类投诉',
  },
  tools: [
    { name: '获取七鱼用户信息', type: '内置工具', status: 'added', desc: '获取客户基础信息、会员等级、历史订单' },
    { name: '获取七鱼会话信息', type: '内置工具', status: 'added', desc: '获取当前会话来源、上下文、客户标签' },
    { name: '订单差价核算', type: 'API工具', status: 'added', desc: 'GET /api/order/diff-calc — 计算原单与重拍单差价' },
    { name: '退款操作', type: 'API工具', status: 'added', desc: 'POST /api/refund/create — 发起差价退款申请' },
    { name: '订单备注', type: 'API工具', status: 'added', desc: 'POST /api/order/remark — 添加退差处理记录' },
  ],
  knowledge: [
    { name: '退换货政策文档', docCount: 15, status: 'linked' },
    { name: '差价核算规则', docCount: 8, status: 'linked' },
    { name: 'FAQ常见问题', docCount: 42, status: 'linked' },
  ],
  rules: {
    context: 8,
    model: 'qwen3-max',
    temperature: 0.2,
    recall: '自动调用',
    maxRecall: 5,
  },
};

const steps = ['场景定义', '提示词', '工具配置', '工作流', '知识库', '对话规则'];

export default function ConversationalBuild({ initialMessage, onCreated }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: chatFlow[0].aiMessage },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputText, setInputText] = useState('');
  const [previewTab, setPreviewTab] = useState('prompt');
  const [typing, setTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [visibleTools, setVisibleTools] = useState(2);
  const [visibleKnowledge, setVisibleKnowledge] = useState(0);
  const [agentCreated, setAgentCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdAppId, setCreatedAppId] = useState(null);
  const [createError, setCreateError] = useState('');

  const [testMode, setTestMode] = useState('chat');
  const [testMessages, setTestMessages] = useState([
    { role: 'agent', text: '您好！我是换货重拍退差助手，请问有什么可以帮您？' }
  ]);
  const [testInput, setTestInput] = useState('');
  const [testTyping, setTestTyping] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchDone, setBatchDone] = useState(false);
  const [expandedCase, setExpandedCase] = useState(null);
  const testChatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (testChatRef.current) {
      testChatRef.current.scrollTop = testChatRef.current.scrollHeight;
    }
  }, [testMessages, testTyping]);

  const runChatStep = (userMsg, files) => {
    setMessages(prev => [...prev, { role: 'user', text: userMsg, files }]);
    setTyping(true);
    const nextStep = currentStep + 1;
    setTimeout(() => {
      if (nextStep < chatFlow.length) {
        setMessages(prev => [...prev, { role: 'ai', text: chatFlow[nextStep].aiMessage }]);
        setCurrentStep(nextStep);
        if (nextStep >= 2) setVisibleTools(2);
        if (nextStep >= 3) setVisibleTools(5);
        if (nextStep >= 4) setPreviewTab('workflow');
        if (nextStep >= 5) { setVisibleKnowledge(3); setPreviewTab('knowledge'); }
        if (nextStep >= 5) { setTimeout(() => setPreviewTab('rules'), 300); }
      }
      setTyping(false);
    }, 1200);
  };

  const sendMessage = () => {
    if ((!inputText.trim() && pendingFiles.length === 0) || typing) return;
    const userMsg = inputText.trim();
    const files = [...pendingFiles];
    setInputText('');
    setPendingFiles([]);
    runChatStep(userMsg, files);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialMessage) {
      setTimeout(() => runChatStep(initialMessage, []), 400);
    }
  }, []);

  const useSample = () => {
    if (currentStep < chatFlow.length && chatFlow[currentStep].sampleUserInput) {
      setInputText(chatFlow[currentStep].sampleUserInput);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex === currentStep) return;
    setCurrentStep(stepIndex);
    const tabMap = ['prompt', 'prompt', 'tools', 'workflow', 'knowledge', 'rules'];
    setPreviewTab(tabMap[stepIndex] || 'prompt');
    if (stepIndex >= 2) setVisibleTools(2);
    if (stepIndex >= 3) setVisibleTools(5);
    if (stepIndex >= 5) setVisibleKnowledge(3);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      isImage: f.type.startsWith('image/'),
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setPendingFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removePendingFile = (index) => {
    setPendingFiles(prev => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const prompt = [
        `## 角色定位\n${previewData.prompt.role}`,
        `## 技能\n${previewData.prompt.skills}`,
        `## 拒答规则\n${previewData.prompt.refusal}`,
      ].join('\n\n');

      const payload = {
        bizType: 0,
        appName: '换货重拍退差助手',
        appDesc: '处理换货重拍后的差价退还问题',
        prompt,
        sessionSetting: {
          contextRound: previewData.rules.context,
          model: previewData.rules.model,
        },
        modelSetting: {
          temperature: previewData.rules.temperature,
        },
      };

      if (createdAppId) {
        payload.appId = createdAppId;
      }

      const result = await Promise.race([
        saveAgent(payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error('api_timeout')), 2000)),
      ]);
      const newAppId = result?.data?.appId;
      if (newAppId) {
        setCreatedAppId(newAppId);
      }
      setAgentCreated(true);
      setTimeout(() => {
        setAgentCreated(false);
        if (onCreated) {
          onCreated({ appId: newAppId || Date.now(), appName: payload.appName, appDesc: payload.appDesc });
        } else {
          setPreviewTab('test');
        }
      }, 1000);
    } catch (err) {
      console.error('创建 Agent 失败:', err);
      // API 不可用时（demo 环境）仍走完整流程
      setAgentCreated(true);
      setTimeout(() => {
        setAgentCreated(false);
        if (onCreated) {
          onCreated({ appId: Date.now(), appName: '换货重拍退差助手', appDesc: '处理换货重拍后的差价退还问题' });
        } else {
          setPreviewTab('test');
        }
      }, 1000);
    } finally {
      setCreating(false);
    }
  };

  const getAgentReply = (userText) => {
    const match = agentReplies.find(r => r.keywords.some(k => userText.includes(k)));
    return match ? match.reply : '好的，请稍等，我帮您查询一下相关信息。请问您能提供一下订单号吗？';
  };

  const sendTestMessage = (text) => {
    const msg = text || testInput.trim();
    if (!msg || testTyping) return;
    setTestInput('');
    setTestMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTestTyping(true);
    setTimeout(() => {
      setTestMessages(prev => [...prev, { role: 'agent', text: getAgentReply(msg) }]);
      setTestTyping(false);
    }, 1000);
  };

  const runBatchTest = () => {
    setBatchRunning(true);
    setBatchProgress(0);
    setBatchDone(false);
    setExpandedCase(null);
    const steps = [12, 25, 38, 50, 62, 75, 88, 100];
    steps.forEach((val, i) => {
      setTimeout(() => {
        setBatchProgress(val);
        if (val === 100) {
          setTimeout(() => {
            setBatchRunning(false);
            setBatchDone(true);
          }, 400);
        }
      }, (i + 1) * 500);
    });
  };

  const renderPreview = () => {
    switch (previewTab) {
      case 'prompt':
        return (
          <div className={currentStep >= 1 ? 'fade-in' : ''} style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {currentStep >= 1 ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>角色人设</h4>
                  <div style={{ background: 'var(--gray-100)', padding: 12, borderRadius: 6, fontSize: 13, lineHeight: 1.8 }}>{previewData.prompt.role}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>技能范围</h4>
                  <div style={{ background: 'var(--gray-100)', padding: 12, borderRadius: 6, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{previewData.prompt.skills}</div>
                </div>
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>拒识限制</h4>
                  <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', padding: 12, borderRadius: 6, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{previewData.prompt.refusal}</div>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="icon">📝</div>
                <p>完成场景定义后将自动生成提示词</p>
              </div>
            )}
          </div>
        );

      case 'tools':
        return (
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {previewData.tools.slice(0, visibleTools).map((tool, i) => (
              <div key={i} className="fade-in" style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{tool.name}</span>
                    <span className={`tag ${tool.type === '内置工具' ? 'tag-success' : 'tag-primary'}`}>{tool.type}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{tool.desc}</p>
                </div>
                <span style={{ color: 'var(--success)', fontSize: 16 }}>✓</span>
              </div>
            ))}
            {visibleTools < 5 && (
              <div className="empty-state" style={{ padding: 30 }}>
                <p style={{ fontSize: 13 }}>继续对话将添加更多工具...</p>
              </div>
            )}
          </div>
        );

      case 'workflow':
        return (
          <div style={{ flex: 1, position: 'relative', minHeight: 300 }}>
            <WorkflowPreview nodes={initialWorkflowNodes} />
          </div>
        );

      case 'knowledge':
        return (
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {visibleKnowledge > 0 ? (
              previewData.knowledge.slice(0, visibleKnowledge).map((kb, i) => (
                <div key={i} className="fade-in" style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--gray-200)' }}>
                  <span style={{ fontSize: 24, marginRight: 12 }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{kb.name}</div>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{kb.docCount} 篇文档</p>
                  </div>
                  <span className="tag tag-success">已关联</span>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="icon">📚</div>
                <p>工作流设计完成后将配置知识库</p>
              </div>
            )}
          </div>
        );

      case 'rules':
        return (
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {currentStep >= 5 ? (
              <div className="fade-in">
                {[
                  { label: '上下文轮数', value: `${previewData.rules.context} 轮` },
                  { label: '选用模型', value: previewData.rules.model },
                  { label: '温度参数', value: `${previewData.rules.temperature}（严谨模式）` },
                  { label: '召回策略', value: previewData.rules.recall },
                  { label: '最大召回数', value: `${previewData.rules.maxRecall} 条切片` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                    <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>{item.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="icon">⚙️</div>
                <p>最后一步配置对话规则</p>
              </div>
            )}
          </div>
        );

      case 'test':
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* 模式切换 */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="mode-switch">
                <button className={`mode-btn ${testMode === 'chat' ? 'active' : ''}`} onClick={() => setTestMode('chat')}>实时对话</button>
                <button className={`mode-btn ${testMode === 'batch' ? 'active' : ''}`} onClick={() => setTestMode('batch')}>批量测试</button>
              </div>
              {testMode === 'chat' && (
                <button className="btn btn-outline btn-sm" onClick={() => setTestMessages([{ role: 'agent', text: '您好！我是换货重拍退差助手，请问有什么可以帮您？' }])}>清空对话</button>
              )}
            </div>

            {testMode === 'chat' ? (
              /* 实时对话模式 */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div ref={testChatRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {testMessages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role === 'agent' ? 'ai' : 'user'} fade-in`}>
                      <div className="chat-avatar">{msg.role === 'agent' ? '🤖' : '👤'}</div>
                      <div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                    </div>
                  ))}
                  {testTyping && (
                    <div className="chat-msg ai fade-in">
                      <div className="chat-avatar">🤖</div>
                      <div className="chat-bubble"><span className="typing-dots">思考中</span></div>
                    </div>
                  )}
                </div>
                {/* 快捷问题 */}
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--gray-200)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['我要退差价', '订单号YD20260501001', '运费能退吗', '活动打了8折', '推荐颜色'].map((q, i) => (
                    <button key={i} className="btn btn-outline btn-sm" onClick={() => sendTestMessage(q)} style={{ fontSize: 11 }}>{q}</button>
                  ))}
                </div>
                {/* 输入框 */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 8 }}>
                  <input
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendTestMessage()}
                    placeholder="输入访客问题测试 Agent 回复..."
                    style={{ flex: 1, padding: '8px 14px', border: '1px solid var(--gray-300)', borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button className="btn btn-primary" onClick={() => sendTestMessage()} disabled={!testInput.trim() || testTyping} style={{ borderRadius: 20 }}>发送</button>
                </div>
              </div>
            ) : (
              /* 批量测试模式 */
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* 统计栏 */}
                {batchDone && (
                  <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: 'var(--success-light)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>87.5%</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>通过率</div>
                    </div>
                    <div style={{ background: 'var(--primary-light)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>7/8</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>通过用例</div>
                    </div>
                    <div style={{ background: 'var(--warning-light)', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>1</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>部分通过</div>
                    </div>
                  </div>
                )}

                {/* 进度条 */}
                {batchRunning && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>正在测试...</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{batchProgress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="fill fill-primary" style={{ width: `${batchProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* 测试用例表格 */}
                {(batchDone || batchRunning) && (
                  <table className="data-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 30 }}>#</th>
                        <th>访客问题</th>
                        <th>期望行为</th>
                        <th style={{ width: 60 }}>结果</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchTestCases.slice(0, Math.ceil(batchProgress / 12.5)).map((tc) => (
                        <React.Fragment key={tc.id}>
                          <tr onClick={() => setExpandedCase(expandedCase === tc.id ? null : tc.id)} style={{ cursor: 'pointer' }}>
                            <td>{tc.id}</td>
                            <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.question}</td>
                            <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-500)' }}>{tc.expected}</td>
                            <td>
                              <span className={`tag ${tc.correctness === 'correct' ? 'tag-success' : tc.correctness === 'partial' ? 'tag-warning' : 'tag-danger'}`}>
                                {tc.correctness === 'correct' ? '通过' : tc.correctness === 'partial' ? '部分' : '失败'}
                              </span>
                            </td>
                          </tr>
                          {expandedCase === tc.id && (
                            <tr>
                              <td colSpan={4} style={{ background: 'var(--gray-100)', padding: 12 }}>
                                <div style={{ fontSize: 12, marginBottom: 6 }}>
                                  <strong style={{ color: 'var(--gray-500)' }}>Agent 回复：</strong>
                                </div>
                                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--gray-800)', whiteSpace: 'pre-line' }}>{tc.agentReply}</div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 操作按钮 */}
                {!batchRunning && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={runBatchTest}>
                      {batchDone ? '重新测试' : '开始批量测试（8条用例）'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%' }}>
      {/* 主分栏布局 */}
      <div className="split-layout">
        {/* 左侧：对话区域 */}
        <div className="split-left">
          <div className="chat-container">
            <div style={{ padding: '10px 16px', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🤖</span> AI 搭建助手
            </div>
            <div className="chat-messages" ref={chatRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role} fade-in`}>
                  <div className="chat-avatar">{msg.role === 'ai' ? '🤖' : '👤'}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '85%' }}>
                    {msg.files && msg.files.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.files.map((f, fi) => (
                          f.isImage && f.preview ? (
                            <img key={fi} src={f.preview} alt={f.name} style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid var(--gray-200)', objectFit: 'cover' }} />
                          ) : (
                            <div key={fi} className="chat-file-tag">
                              <span>{f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? '📝' : '📎'}</span>
                              <span style={{ fontSize: 12 }}>{f.name}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                    {msg.text && <div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="chat-msg ai fade-in">
                  <div className="chat-avatar">🤖</div>
                  <div className="chat-bubble">
                    <span className="typing-dots">正在思考</span>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-area" style={{ flexDirection: 'column', gap: 8 }}>
              {/* 待上传文件预览 */}
              {pendingFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="pending-file-chip">
                      {f.isImage && f.preview ? (
                        <img src={f.preview} alt={f.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 18 }}>{f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? '📝' : '📎'}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatFileSize(f.size)}</div>
                      </div>
                      <button onClick={() => removePendingFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {/* 输入行 */}
              <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept=".doc,.docx,.pdf,.txt,.png,.jpg,.jpeg,.gif,.webp,.csv,.xlsx,.xls" style={{ display: 'none' }} />
                <button
                  className="chat-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="上传文件或图片"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.1667 6.66667L10 2.5L5.83334 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={currentStep >= chatFlow.length - 1 && !chatFlow[currentStep]?.expectInput ? '搭建已完成' : '输入你的需求，或上传业务文档/图片...'}
                  disabled={currentStep >= chatFlow.length - 1 && !chatFlow[currentStep]?.expectInput}
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={(!inputText.trim() && pendingFiles.length === 0) || typing}>发送</button>
              </div>
            </div>
          </div>

          {/* 快捷填入 */}
          {currentStep < chatFlow.length && chatFlow[currentStep].sampleUserInput && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 8, alignSelf: 'flex-start', fontSize: 12 }}
              onClick={useSample}
            >
              💡 使用示例输入
            </button>
          )}

          {/* 搭建进度 — 可点击跳步 */}
          <div className="build-progress" style={{ marginTop: 12 }}>
            <h4>搭建进度 <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--gray-500)' }}>（点击步骤可跳转）</span></h4>
            <div className="build-steps">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`build-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
                  onClick={() => handleStepClick(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="step-dot">
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <div className="step-label">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：实时预览 */}
        <div className="split-right">
          <div className="preview-panel" style={{ flex: 1 }}>
            <div className="preview-tabs">
              {['prompt', 'tools', 'workflow', 'knowledge', 'rules', 'test'].map(tab => (
                <div key={tab} className={`preview-tab ${previewTab === tab ? 'active' : ''}`} onClick={() => setPreviewTab(tab)}>
                  {{ prompt: '提示词', tools: '工具', workflow: '工作流', knowledge: '知识库', rules: '对话规则', test: '测试' }[tab]}
                  {tab === 'tools' && visibleTools > 0 && <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--primary)' }}>({visibleTools})</span>}
                  {tab === 'knowledge' && visibleKnowledge > 0 && <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--primary)' }}>({visibleKnowledge})</span>}
                </div>
              ))}
            </div>
            <div className="preview-content">
              {renderPreview()}
            </div>
          </div>

          {/* 底部操作栏 */}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="progress-bar" style={{ width: 200, height: 6 }}>
                <div className="fill fill-primary" style={{ width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%` }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                {Math.round(Math.min(100, (currentStep / (steps.length - 1)) * 100))}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" disabled={currentStep < 5}>继续完善</button>
              <button className="btn btn-success" disabled={currentStep < 5 || creating} onClick={handleCreate}>
                {creating ? '⏳ 创建中…' : agentCreated ? '✅ Agent 已创建！' : createdAppId ? '🔄 更新 Agent' : '🚀 创建 Agent'}
              </button>
            </div>
            {createError && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6, fontSize: 12, color: '#cf1322' }}>
                ⚠️ {createError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
