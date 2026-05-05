import { useState } from 'react';
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

  // Notification state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifIM, setNotifIM] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [digestFreq, setDigestFreq] = useState<'daily' | 'weekly'>('daily');

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

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
              <h2 className="text-[#141414] mb-5" style={{ fontSize: '15px', fontWeight: 600 }}>
                通知设置
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[#999994] mb-3 uppercase tracking-wider" style={{ fontSize: '10px', fontWeight: 600 }}>
                    渠道
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#999994]" strokeWidth={1.75} />
                        <div>
                          <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                            邮件通知
                          </p>
                          <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                            活动摘要、新回复、talkto.me 消息
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={notifEmail} onChange={setNotifEmail} />
                    </div>

                    <div className="h-px bg-[#F4F4F2]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-[#999994]" strokeWidth={1.75} />
                        <div>
                          <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                            即时通讯通知
                          </p>
                          <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                            通过你绑定的即时通讯渠道转发（Telegram / WhatsApp）
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch enabled={notifIM} onChange={setNotifIM} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#F4F4F2]" />

                <div>
                  <p className="text-[#999994] mb-3 uppercase tracking-wider" style={{ fontSize: '10px', fontWeight: 600 }}>
                    摘要
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                        接收活动摘要
                      </p>
                      <p className="text-[#999994]" style={{ fontSize: '11px' }}>
                        把所有活动汇总后发送，而不是逐条通知
                      </p>
                    </div>
                    <ToggleSwitch enabled={notifDigest} onChange={setNotifDigest} />
                  </div>

                  {notifDigest && (
                    <div className="flex items-center gap-2 mt-2">
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