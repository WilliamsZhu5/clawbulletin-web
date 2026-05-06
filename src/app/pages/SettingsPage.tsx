import { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Eye,
  ExternalLink,
  Check,
  ChevronRight,
  Link,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { currentUser } from '../data/mockData';
import { 拿用户, 拿通知偏好, 更新通知偏好, type 通知偏好 } from '../data/api';

type SettingsSection = 'profile' | 'notifications' | 'privacy' | 'talkto' | 'integrations';

const sections: Array<{ id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'talkto', label: 'talkto.me', icon: Link },
  { id: 'notifications', label: '通知', icon: Bell },
  { id: 'privacy', label: '隐私与可见性', icon: Eye },
];

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        enabled ? 'bg-[#141414]' : 'bg-[#D0D0CA]'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Profile state
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [username, setUsername] = useState(currentUser.username);
  const [saved, setSaved] = useState(false);

  // Notification state — IM / digest 仍为前端 mock（后端未实现）
  // 邮件偏好接通真后端：4 类事件 × 邮件 bool + 退订全部（v2 通知中心 F12）
  const [notifIM, setNotifIM] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [digestFreq, setDigestFreq] = useState<'daily' | 'weekly'>('daily');

  // 后端 v2 通知偏好
  const [偏好, set偏好] = useState<通知偏好 | null>(null);
  const [偏好加载中, set偏好加载中] = useState(false);
  const [偏好错, set偏好错] = useState<string | null>(null);
  const [偏好保存中, set偏好保存中] = useState<string | null>(null); // 当前在保存哪个 key（防并发）
  const [偏好保存提示, set偏好保存提示] = useState<string | null>(null); // 已保存 / 失败提示

  // 进入通知 tab 拉偏好；防 StrictMode 双调用
  useEffect(() => {
    if (activeSection !== 'notifications') return;
    if (偏好) return;
    set偏好加载中(true);
    set偏好错(null);
    拿通知偏好()
      .then((p) => set偏好(p))
      .catch((e) => set偏好错(e?.message || String(e)))
      .finally(() => set偏好加载中(false));
  }, [activeSection, 偏好]);

  // 切换某个事件的邮件开关 —— 先调 API 成功后再改 local state（不做乐观更新）
  const 切换事件邮件 = async (事件key: keyof 通知偏好['邮件']) => {
    if (!偏好 || 偏好保存中) return;
    const 新值 = !偏好.邮件[事件key];
    set偏好保存中(事件key);
    set偏好保存提示(null);
    try {
      const r = await 更新通知偏好({ 邮件: { [事件key]: 新值 } as Partial<通知偏好['邮件']> });
      set偏好(r);
      set偏好保存提示('已保存');
      setTimeout(() => set偏好保存提示(null), 1800);
    } catch (e: any) {
      set偏好保存提示(`保存失败：${e?.message || e}`);
    } finally {
      set偏好保存中(null);
    }
  };

  const 切换全部退订 = async () => {
    if (!偏好 || 偏好保存中) return;
    const 新值 = !偏好.退订全部;
    set偏好保存中('__退订全部__');
    set偏好保存提示(null);
    try {
      const r = await 更新通知偏好({ 退订全部: 新值 });
      set偏好(r);
      set偏好保存提示('已保存');
      setTimeout(() => set偏好保存提示(null), 1800);
    } catch (e: any) {
      set偏好保存提示(`保存失败：${e?.message || e}`);
    } finally {
      set偏好保存中(null);
    }
  };

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  // talkto.me state
  const [ttmConnected] = useState(true);
  const [screeningEnabled, setScreeningEnabled] = useState(true);
  const [allowAgents, setAllowAgents] = useState(false);
  const [imChannel, setImChannel] = useState<'whatsapp' | 'telegram' | 'email'>('telegram');

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div
        className="rounded-2xl mb-6 px-5 py-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 55%, #5B21B6 100%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Settings style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>BULLETIN</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>设置</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>管理账户、通知与偏好设置</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Section nav */}
        <div className="shrink-0 w-44">
          <div className="flex flex-col gap-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-[#F0F0EE] text-[#141414]'
                      : 'text-[#666660] hover:bg-[#F8F8F6] hover:text-[#141414]'
                  }`}
                >
                  <Icon
                    className={isActive ? 'text-[#141414]' : 'text-[#999994]'}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    style={{ width: '15px', height: '15px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0">

          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
              <h2 className="text-[#141414] mb-5" style={{ fontSize: '15px', fontWeight: 600 }}>
                个人资料
              </h2>

              <div className="flex flex-col gap-4 mb-6">
                {/* Avatar */}
                <div>
                  <label className="block text-[#141414] mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                    头像
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: currentUser.avatarColor, fontSize: '18px', fontWeight: 700 }}
                    >
                      {currentUser.avatarInitials}
                    </div>
                    <div>
                      <p className="text-[#666660]" style={{ fontSize: '12px' }}>
                        头像使用你的姓名首字母，自定义头像即将上线。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '12px', fontWeight: 500 }}>
                    显示名称
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '12px', fontWeight: 500 }}>
                    用户名
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-[#F8F8F6] text-[#999994]"
                      style={{ fontSize: '13px' }}
                    >
                      @
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] outline-none focus:border-[#141414] transition-colors"
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  <p className="text-[#999994] mt-1.5" style={{ fontSize: '11px' }}>
                    你的 talkto.me 链接会同步更新为新用户名。
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '12px', fontWeight: 500 }}>
                    简介
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] outline-none focus:border-[#141414] transition-colors resize-none"
                    style={{ fontSize: '13px', lineHeight: '1.6' }}
                    maxLength={200}
                  />
                  <div className="flex justify-end">
                    <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                      {bio.length}/200
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F4F4F2]">
                <button
                  onClick={() => navigate(`/u/${currentUser.username}`)}
                  className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors"
                  style={{ fontSize: '12px' }}
                >
                  查看公开主页
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleSaveProfile}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    saved
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-[#141414] text-white hover:bg-[#2A2A2A]'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      已保存
                    </>
                  ) : (
                    '保存修改'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* talkto.me */}
          {activeSection === 'talkto' && (
            <div className="flex flex-col gap-4">
              {/* Connection status */}
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[#141414]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    talkto.me 连接
                  </h2>
                  {ttmConnected && (
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A]"
                      style={{ fontSize: '11px', fontWeight: 500 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      已连接
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA] mb-5">
                  <div
                    className="inline-flex items-center px-2 py-1 rounded-md bg-[#141414] text-white"
                    style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' }}
                  >
                    talkto.me
                  </div>
                  <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {currentUser.talktoLink}
                  </span>
                  <a
                    href={`https://${currentUser.talktoLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[#999994] hover:text-[#141414] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* IM Channel */}
                <div>
                  <label className="block text-[#141414] mb-2" style={{ fontSize: '12px', fontWeight: 500 }}>
                    消息转发渠道
                  </label>
                  <div className="flex flex-col gap-2">
                    {(['telegram', 'whatsapp', 'email'] as const).map((channel) => (
                      <button
                        key={channel}
                        onClick={() => setImChannel(channel)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                          imChannel === channel
                            ? 'border-[#141414] bg-white'
                            : 'border-[#E8E8E4] hover:border-[#C8C8C4]'
                        }`}
                      >
                        <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                          {channel === 'telegram' ? 'Telegram' : channel === 'whatsapp' ? 'WhatsApp' : '邮箱'}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            imChannel === channel ? 'border-[#141414] bg-[#141414]' : 'border-[#D0D0CA]'
                          }`}
                        >
                          {imChannel === channel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message screening */}
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
                <h3 className="text-[#141414] mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>
                  消息筛选
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                        启用消息筛选
                      </p>
                      <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                        Agent 会按 ttm_rules.md 检查并过滤收到的消息
                      </p>
                    </div>
                    <ToggleSwitch enabled={screeningEnabled} onChange={setScreeningEnabled} />
                  </div>

                  <div className="h-px bg-[#F4F4F2]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                        允许 Agent 间消息
                      </p>
                      <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                        允许其他 OpenClaw Agent 直接联系你的 Agent（第二阶段功能）
                      </p>
                    </div>
                    <ToggleSwitch enabled={allowAgents} onChange={setAllowAgents} />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F4F4F2]">
                  <button
                    className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors"
                    style={{ fontSize: '12px' }}
                  >
                    编辑 ttm_rules.md
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications —— v2 通知中心 F12：邮件偏好接通真后端 */}
          {activeSection === 'notifications' && (
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[#141414]" style={{ fontSize: '15px', fontWeight: 600 }}>
                  通知设置
                </h2>
                {偏好保存提示 && (
                  <span
                    style={{
                      fontSize: 11,
                      color: 偏好保存提示.includes('失败') ? '#B91C1C' : '#16A34A',
                      fontWeight: 500,
                    }}
                  >
                    {偏好保存提示}
                  </span>
                )}
              </div>

              {/* 邮件区块 */}
              <div className="mt-4">
                <p
                  className="text-[#999994] mb-2 uppercase tracking-wider"
                  style={{ fontSize: '10px', fontWeight: 600 }}
                >
                  邮件通知
                </p>
                <p
                  className="text-[#666660] mb-4"
                  style={{ fontSize: '12px', lineHeight: 1.55 }}
                >
                  邮件通知默认关闭，开启后接收 4 类事件邮件，可在每封邮件底部一键退订。
                </p>

                {/* 当前邮箱展示 */}
                {(() => {
                  const u = 拿用户();
                  if (!u?.email) return null;
                  return (
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl"
                      style={{ background: '#F8F8F6', border: '1px solid #EBEBEA' }}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#999994]" strokeWidth={1.75} />
                      <span style={{ fontSize: 11, color: '#999994' }}>发送至</span>
                      <span style={{ fontSize: 12, color: '#141414', fontWeight: 500 }}>{u.email}</span>
                    </div>
                  );
                })()}

                {偏好加载中 && (
                  <p style={{ fontSize: 12, color: '#999994' }}>加载偏好中…</p>
                )}
                {偏好错 && !偏好加载中 && (
                  <p style={{ fontSize: 12, color: '#B91C1C' }}>加载失败：{偏好错}</p>
                )}

                {偏好 && !偏好加载中 && (
                  <div className="flex flex-col gap-3">
                    {/* 4 类事件 toggle */}
                    {([
                      ['comment_created', '我发的帖子有新评论'],
                      ['conversation_started', '有人通过我的 Agent 发起对话'],
                      ['message_received', '对话有新消息'],
                      ['negotiation_updated', '谈判状态变更'],
                    ] as const).map(([key, label], i) => {
                      const enabled = !!偏好.邮件[key];
                      const 整体退订 = 偏好.退订全部;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="text-[#141414]"
                                style={{ fontSize: '13px', fontWeight: 500, opacity: 整体退订 ? 0.5 : 1 }}
                              >
                                {label}
                              </p>
                            </div>
                            <button
                              disabled={整体退订 || 偏好保存中 === key}
                              onClick={() => 切换事件邮件(key)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                enabled && !整体退订 ? 'bg-[#4F46E5]' : 'bg-[#D0D0CA]'
                              }`}
                              style={{
                                cursor: 整体退订 ? 'not-allowed' : 偏好保存中 === key ? 'wait' : 'pointer',
                                opacity: 整体退订 ? 0.5 : 1,
                              }}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                  enabled && !整体退订 ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                          {i < 3 && <div className="h-px bg-[#F4F4F2] mt-3" />}
                        </div>
                      );
                    })}

                    {/* 一键全关 */}
                    <div className="h-px bg-[#F4F4F2] my-1" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-[#141414]"
                          style={{ fontSize: '13px', fontWeight: 500 }}
                        >
                          退订全部邮件
                        </p>
                        <p className="text-[#999994] mt-0.5" style={{ fontSize: '11px' }}>
                          打开后所有 4 类事件都不再发送邮件，覆盖上面的开关
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={偏好.退订全部}
                        onChange={() => 切换全部退订()}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* IM / 摘要区 —— 保留 mock，标 v3 待实现 */}
              <div className="h-px bg-[#F4F4F2] my-5" />

              <div>
                <p
                  className="text-[#999994] mb-2 uppercase tracking-wider"
                  style={{ fontSize: '10px', fontWeight: 600 }}
                >
                  其他渠道
                </p>
                <div className="flex items-center justify-between" style={{ opacity: 0.55 }}>
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#999994]" strokeWidth={1.75} />
                    <div>
                      <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                        即时通讯通知
                      </p>
                      <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                        通过你绑定的即时通讯渠道转发（Telegram / WhatsApp） · 即将上线
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={notifIM} onChange={setNotifIM} />
                </div>

                <div className="h-px bg-[#F4F4F2] my-3" />

                <div className="flex items-center justify-between" style={{ opacity: 0.55 }}>
                  <div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                      接收活动摘要
                    </p>
                    <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                      把所有活动汇总后发送，而不是逐条通知 · 即将上线
                    </p>
                  </div>
                  <ToggleSwitch enabled={notifDigest} onChange={setNotifDigest} />
                </div>

                {notifDigest && (
                  <div className="flex items-center gap-2 mt-3" style={{ opacity: 0.55 }}>
                    {(['daily', 'weekly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setDigestFreq(freq)}
                        className={`px-3.5 py-1.5 rounded-full border transition-all ${
                          digestFreq === freq
                            ? 'border-[#141414] bg-[#141414] text-white'
                            : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                        }`}
                        style={{ fontSize: '12px' }}
                      >
                        {freq === 'daily' ? '每日' : '每周'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
              <h2 className="text-[#141414] mb-5" style={{ fontSize: '15px', fontWeight: 600 }}>
                隐私与可见性
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                      公开主页
                    </p>
                    <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                      任何人都能查看你的主页和发布
                    </p>
                  </div>
                  <ToggleSwitch enabled={profilePublic} onChange={setProfilePublic} />
                </div>

                <div className="h-px bg-[#F4F4F2]" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                      出现在搜索结果中
                    </p>
                    <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                      他人按姓名或用户名搜索时，会显示你的主页
                    </p>
                  </div>
                  <ToggleSwitch enabled={showInSearch} onChange={setShowInSearch} />
                </div>

                <div className="h-px bg-[#F4F4F2]" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                      在主页显示活动
                    </p>
                    <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                      公开主页上显示你的评论和浏览活动
                    </p>
                  </div>
                  <ToggleSwitch enabled={showActivity} onChange={setShowActivity} />
                </div>

                <div className="h-px bg-[#F4F4F2]" />

                <div>
                  <p className="text-[#141414] mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>
                    数据与账户
                  </p>
                  <div className="flex flex-col gap-2 mt-3">
                    <button
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all text-left"
                      style={{ fontSize: '13px' }}
                    >
                      <span>导出我的数据</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#F43F5E]/30 text-[#F43F5E] hover:border-[#F43F5E] hover:bg-[#FFF1F2] transition-all text-left"
                      style={{ fontSize: '13px' }}
                    >
                      <span>删除账户</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-[#F4F4F2]">
                <button
                  className="px-4 py-2 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  保存设置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}