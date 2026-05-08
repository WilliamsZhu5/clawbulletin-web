import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Briefcase,
  Rocket,
  ShoppingBag,
  Wrench,
  Building2,
  CalendarDays,
  X,
  Plus,
  Info,
  Sparkles,
  PenLine,
} from 'lucide-react';
import { categorySubcategories } from '../data/mockData';
import type { CategoryId } from '../data/mockData';
import { 发帖, 已登录, agent起草 } from '../data/api';

const categoryOptions: Array<{
  id: CategoryId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
}> = [
  { id: 'jobs', label: '职位', description: '全职、兼职、合同岗位', icon: Briefcase, color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'projects', label: '项目', description: '副业项目、寻找联合创始人', icon: Rocket, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'marketplace', label: '二手市场', description: '买卖或交换闲置物品', icon: ShoppingBag, color: '#EA580C', bg: '#FFF7ED' },
  { id: 'skills', label: '技能', description: '提供或寻求技能与服务', icon: Wrench, color: '#16A34A', bg: '#F0FDF4' },
  { id: 'housing', label: '租房', description: '出租、转租、合租', icon: Building2, color: '#0D9488', bg: '#F0FDFA' },
  { id: 'events', label: '活动', description: '聚会、工坊、活动召集', icon: CalendarDays, color: '#E11D48', bg: '#FFF1F2' },
];

interface FormState {
  category: CategoryId | null;
  subcategory: string;
  title: string;
  body: string;
  tags: string[];
  location: string;
  compensation: string;
  contactPreference: 'talkto' | 'email' | 'both';
}

// 受 LLM 草稿启动时跳过的步骤：直接落到 step 2（填详情），用户审核 / 改 / 发即可
const SUBCAT_FALLBACK = '其他';

export function CreatePostPage() {
  const navigate = useNavigate();

  // 模式：'compose' 跟 agent 描述（A3 起草入口）；'editor' 进入传统 4 步表单
  const [mode, setMode] = useState<'compose' | 'editor'>('compose');

  // ==== A-Compose 状态：用户口述 + 起草中标志 + 错误 ====
  const [用户描述, set用户描述] = useState('');
  const [起草中, set起草中] = useState(false);
  const [起草错误, set起草错误] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  const [form, setForm] = useState<FormState>({
    category: null,
    subcategory: '',
    title: '',
    body: '',
    tags: [],
    location: '',
    compensation: '',
    contactPreference: 'talkto',
  });

  const subcategories = form.category ? categorySubcategories[form.category] ?? [] : [];

  const updateForm = (key: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      updateForm('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateForm('tags', form.tags.filter((t) => t !== tag));
  };

  const canProceed = () => {
    if (step === 1) return !!form.category && !!form.subcategory;
    if (step === 2) return form.title.trim().length >= 10 && form.body.trim().length >= 30;
    if (step === 3) return true;
    return true;
  };

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  // 让 agent 把口述需求起草成草稿，填进 form，并切到 editor 模式
  // 直接落到 step 2（填详情）让用户审核 / 改 / 重新起草 / 发布
  const 让agent起草 = async () => {
    if (!已登录()) {
      navigate('/login');
      return;
    }
    if (!用户描述.trim()) {
      set起草错误('请先描述你想发什么帖子');
      return;
    }
    set起草中(true);
    set起草错误(null);
    try {
      const 草稿 = await agent起草(用户描述.trim());
      const 类别合法集 = ['jobs', 'projects', 'marketplace', 'skills', 'housing', 'events'] as const;
      const 类别: CategoryId = (类别合法集 as readonly string[]).includes(草稿.category)
        ? (草稿.category as CategoryId)
        : 'projects';
      // 子类别：草稿没给就用该类别下首个子类别（保证 step 2/3/4 都能正常通过校验）
      const 子类别候选 = categorySubcategories[类别] ?? [];
      const 子类别 = 草稿.subcategory && 子类别候选.includes(草稿.subcategory)
        ? 草稿.subcategory
        : (子类别候选[0] || SUBCAT_FALLBACK);
      // 价格 / 薪酬：合并 compensation_text 和 price_cents 成一个用户可读字符串
      let 薪酬 = 草稿.compensation_text || '';
      if (!薪酬 && 草稿.price_cents != null) {
        const 货币符号 = 草稿.price_currency === 'USD' ? '$' : '¥';
        薪酬 = `${货币符号}${(草稿.price_cents / 100).toFixed(0)}`;
      }
      setForm({
        category: 类别,
        subcategory: 子类别,
        title: 草稿.title,
        body: 草稿.body,
        tags: (草稿.tags || []).slice(0, 8),
        location: 草稿.location_text || '',
        compensation: 薪酬,
        contactPreference: 'talkto',
      });
      setMode('editor');
      setStep(2); // 跳过选分类（agent 已选好），落到填详情让用户审核
    } catch (err: any) {
      set起草错误(err.message ? `Agent 起草失败：${err.message}` : 'Agent 起草失败，请稍后重试');
    } finally {
      set起草中(false);
    }
  };

  // 跳过 agent，自己写（A2 模式）
  const 跳过agent = () => {
    setMode('editor');
    setStep(1);
  };

  // 让 agent 重新起草：清掉当前 form 内容，回到 compose 入口
  const 重新起草 = () => {
    setMode('compose');
    set起草错误(null);
  };

  const handlePublish = async () => {
    if (!已登录()) {
      setPublishError('请先登录');
      navigate('/login');
      return;
    }
    if (!form.category) {
      setPublishError('请选择类别');
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const post = await 发帖({
        title: form.title,
        body: form.body,
        category: form.category,
        subcategory: form.subcategory || undefined,
        tags: form.tags,
        location_text: form.location || undefined,
        compensation_text: form.compensation || undefined,
      });
      setCreatedPostId(post.id);
      setPublished(true);
    } catch (err: any) {
      setPublishError(err.message || String(err));
    } finally {
      setPublishing(false);
    }
  };

  // ===== A-Compose 入口：用户跟自己 agent 描述想发什么帖子 =====
  if (mode === 'compose' && !published) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors mb-4"
            style={{ fontSize: '13px' }}
          >
            <ChevronLeft className="w-4 h-4" />
            取消
          </button>
          <h1 className="text-[#141414]" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            新建发布
          </h1>
        </div>

        <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6">
          {/* Agent 卡片头 */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#F5F3FF' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#7C3AED' }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 600 }}>
                告诉你的 Agent 你想发什么帖子
              </h2>
              <p className="text-[#999994]" style={{ fontSize: '12px' }}>
                你的 Agent 会把你的口述整理成一篇结构化草稿，由你审核后再发布。
              </p>
            </div>
          </div>

          <textarea
            value={用户描述}
            onChange={(e) => set用户描述(e.target.value)}
            placeholder="比如：我想招一位中英翻译，把 200 页用户手册翻成中文，预算 5000 元，可远程，希望两周内交稿。"
            rows={8}
            disabled={起草中}
            className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors resize-none disabled:opacity-60"
            style={{ fontSize: '14px', lineHeight: '1.65' }}
            maxLength={2000}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
              {用户描述.length}/2000
            </span>
          </div>

          {起草错误 && (
            <div className="mt-2 mb-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
              <p className="text-[#991B1B]" style={{ fontSize: '12px' }}>{起草错误}</p>
            </div>
          )}

          {/* 主操作 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-5">
            <button
              onClick={让agent起草}
              disabled={起草中 || !用户描述.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
              onMouseEnter={(e) => { if (!起草中 && 用户描述.trim()) { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
            >
              <Sparkles className="w-4 h-4" />
              {起草中 ? 'Agent 正在起草…' : '让 Agent 起草'}
            </button>
            <button
              onClick={跳过agent}
              disabled={起草中}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all disabled:opacity-40"
              style={{ fontSize: '13px' }}
            >
              <PenLine className="w-4 h-4" />
              跳过 Agent，自己写
            </button>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#999994] shrink-0 mt-0.5" />
            <p className="text-[#666660]" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              起草由你的 Agent 在你授权下完成，草稿不会自动发布——只有你确认后才上线 Bulletin。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (published) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[#16A34A]" strokeWidth={2.5} />
        </div>
        <h1 className="text-[#141414] mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
          发布成功
        </h1>
        <p className="text-[#666660] mb-6" style={{ fontSize: '14px' }}>
          你的发布已上线 Bulletin。其他人可以通过搜索或首页发现它。
        </p>
        <div className="flex items-center justify-center gap-3">
          {createdPostId && (
            <button
              onClick={() => navigate(`/post/${createdPostId}`)}
              className="px-5 py-2.5 rounded-xl transition-all"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
            >
              查看帖子
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all"
            style={{ fontSize: '13px' }}
          >
            返回首页
          </button>
          <button
            onClick={() => {
              setPublished(false);
              setStep(1);
              setMode('compose');
              set用户描述('');
              set起草错误(null);
              setForm({ category: null, subcategory: '', title: '', body: '', tags: [], location: '', compensation: '', contactPreference: 'talkto' });
            }}
            className="px-5 py-2.5 rounded-xl transition-all"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
          >
            再发一条
          </button>
        </div>
      </div>
    );
  }

  // 来自 agent 起草？(form 已有内容 + 上次进 compose 起草过) — 用 form.title 非空粗略判定
  const 来自agent起草 = !!form.title.trim() && !!form.body.trim();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => 来自agent起草 ? 重新起草() : navigate(-1)}
          className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors mb-4"
          style={{ fontSize: '13px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          {来自agent起草 ? '回到 Agent 起草' : '取消'}
        </button>
        <h1 className="text-[#141414]" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          新建发布
        </h1>
      </div>

      {/* Agent 起草提示带 */}
      {来自agent起草 && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#7C3AED' }} strokeWidth={2} />
          <div className="flex-1">
            <p className="text-[#5B21B6]" style={{ fontSize: '12px', fontWeight: 600 }}>
              这份草稿由你的 Agent 起草
            </p>
            <p className="text-[#6D28D9] mt-0.5" style={{ fontSize: '12px', lineHeight: '1.5' }}>
              你可以直接修改任何字段，或让 Agent 重新起草。发布前不会自动上线。
            </p>
          </div>
          <button
            onClick={重新起草}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[#5B21B6] border border-[#DDD6FE] hover:bg-white transition-colors"
            style={{ fontSize: '12px', fontWeight: 500 }}
          >
            让 Agent 重新起草
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                s < step
                  ? 'text-white'
                  : s === step
                  ? 'text-white ring-4 ring-[#4F46E5]/10'
                  : 'bg-[#F4F4F2] text-[#BBBBB6]'
              }`}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                background: s <= step ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : undefined,
              }}
            >
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span
              className={s === step ? 'text-[#141414]' : 'text-[#999994]'}
              style={{ fontSize: '12px', fontWeight: s === step ? 600 : 400 }}
            >
              {['选分类', '填详情', '联系方式', '确认'][s - 1]}
            </span>
            {s < 4 && <div className="w-8 h-px bg-[#E8E8E4] mx-1" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6 mb-4">
        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              选择分类
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              选择你想要创建的发布类型。
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                const isSelected = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { updateForm('category', cat.id); updateForm('subcategory', ''); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#4F46E5] bg-white'
                        : 'border-[#E8E8E4] hover:border-[#C8C8C4] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <Icon
                        className="w-4.5 h-4.5"
                        strokeWidth={1.75}
                        style={{ color: cat.color, width: '18px', height: '18px' }}
                      />
                    </div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {cat.label}
                    </p>
                    <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {form.category && subcategories.length > 0 && (
              <div>
                <label className="block text-[#141414] mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                  子分类
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => updateForm('subcategory', sub)}
                      className={`px-3.5 py-2 rounded-xl border transition-all ${
                        form.subcategory === sub
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                      }`}
                      style={{ fontSize: '13px' }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              填写详情
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              用清晰、真实的语言描述你提供或寻找的内容。
            </p>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  标题
                  <span className="text-[#F43F5E] ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="写一个清晰、具体的标题..."
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                  style={{ fontSize: '14px' }}
                  maxLength={120}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                    {form.title.length}/120
                  </span>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  描述
                  <span className="text-[#F43F5E] ml-1">*</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => updateForm('body', e.target.value)}
                  placeholder="提供背景、要求、预期...具体且真实。"
                  rows={10}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors resize-none"
                  style={{ fontSize: '13px', lineHeight: '1.65' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                    {form.body.length} 字
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  标签
                  <span className="text-[#999994] ml-2" style={{ fontWeight: 400 }}>最多 8 个</span>
                </label>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F4F2] text-[#444440]"
                        style={{ fontSize: '12px' }}
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-[#999994] hover:text-[#666660] transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="添加标签..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                    disabled={form.tags.length >= 8}
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim() || form.tags.length >= 8}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F4F4F2] text-[#666660] hover:bg-[#EBEBEA] hover:text-[#141414] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                    地点
                    <span className="text-[#999994] ml-1" style={{ fontWeight: 400 }}>(选填)</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    placeholder="城市、区域，或填「远程」"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                    薪酬 / 价格
                    <span className="text-[#999994] ml-1" style={{ fontWeight: 400 }}>(选填)</span>
                  </label>
                  <input
                    type="text"
                    value={form.compensation}
                    onChange={(e) => updateForm('compensation', e.target.value)}
                    placeholder="例如：¥120k、¥50/小时、免费"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              联系偏好
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              别人通过哪种方式联系你？
            </p>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  value: 'talkto' as const,
                  label: '只通过 talkto.me',
                  description: '消息通过你的 talkto.me Agent，按规则过滤和路由。',
                  recommended: true,
                },
                {
                  value: 'email' as const,
                  label: '只通过邮箱',
                  description: '邮箱将显示在发布上，可能收到未经筛选的信息。',
                  recommended: false,
                },
                {
                  value: 'both' as const,
                  label: 'talkto.me 和邮箱都用',
                  description: '对方可任选，talkto.me 消息仍按规则由 Agent 处理。',
                  recommended: false,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateForm('contactPreference', option.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.contactPreference === option.value
                      ? 'border-[#141414] bg-white'
                      : 'border-[#E8E8E4] hover:border-[#C8C8C4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#141414]" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {option.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {option.recommended && (
                        <span
                          className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]"
                          style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                          推荐
                        </span>
                      )}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          form.contactPreference === option.value
                            ? 'border-[#141414] bg-[#141414]'
                            : 'border-[#D0D0CA]'
                        }`}
                      >
                        {form.contactPreference === option.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[#666660]" style={{ fontSize: '12px' }}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#999994] shrink-0 mt-0.5" />
              <p className="text-[#666660]" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                你的 talkto.me Agent 会按规则文件（ttm_rules.md）处理所有收到的消息。
                你可以在 talkto.me 控制台里配置筛选条件、路由和通知设置。
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              确认并发布
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              发布前再检查一遍内容。
            </p>

            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA]">
                <div className="flex items-center gap-2 mb-3">
                  {categoryOptions.find((c) => c.id === form.category) && (() => {
                    const cat = categoryOptions.find((c) => c.id === form.category)!;
                    const Icon = cat.icon;
                    return (
                      <>
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: cat.bg }}
                        >
                          <Icon style={{ color: cat.color, width: '13px', height: '13px' }} strokeWidth={2} />
                        </div>
                        <span style={{ fontSize: '12px', color: cat.color, fontWeight: 500 }}>
                          {cat.label} — {form.subcategory}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-[#141414] mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                  {form.title || '（无标题）'}
                </p>
                <p className="text-[#666660] line-clamp-3" style={{ fontSize: '13px' }}>
                  {form.body || '（无描述）'}
                </p>
                {(form.location || form.compensation) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#EBEBEA]">
                    {form.location && (
                      <span className="text-[#999994]" style={{ fontSize: '12px' }}>
                        {form.location}
                      </span>
                    )}
                    {form.compensation && (
                      <span
                        className="px-2 py-0.5 rounded-md bg-[#EBEBEA] text-[#444440]"
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        {form.compensation}
                      </span>
                    )}
                  </div>
                )}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-[#EBEBEA] text-[#666660]"
                        style={{ fontSize: '11px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-[#E8E8E4]">
                <div className="flex items-center justify-between">
                  <span className="text-[#666660]" style={{ fontSize: '13px' }}>联系方式</span>
                  <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {form.contactPreference === 'talkto' ? 'talkto.me' : form.contactPreference === 'email' ? '邮箱' : 'talkto.me + 邮箱'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: '13px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          上一步
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
            onMouseEnter={(e) => { if (canProceed()) { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
          >
            下一步
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            {publishError && <p style={{ fontSize: 11, color: '#DC2626' }}>{publishError}</p>}
            <button
              onClick={handlePublish}
              disabled={!form.title.trim() || !form.body.trim() || publishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
              onMouseEnter={(e) => { if (form.title.trim() && form.body.trim() && !publishing) { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)'; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)'; }}
            >
              <Check className="w-4 h-4" />
              {publishing ? '发布中…' : '发布帖子'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
